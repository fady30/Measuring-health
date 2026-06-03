import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UserService } from '../users/user.service';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokensResponse } from './dto/auth-tokens.response';
import { RegisterResponse } from './dto/register.response';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const INVALID_CREDENTIALS_MESSAGE = 'Ongeldige inloggegevens.';
const ACCOUNT_LOCKED_MESSAGE =
  'Je account is geblokkeerd. Je moet contact opnemen met ons nummer 064528265.';
const INVALID_TOKEN_MESSAGE = 'Ongeldige of verlopen sessie.';

interface LogoutResponse {
  message: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) { }

  async register(dto: RegisterDto): Promise<RegisterResponse> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('E-mailadres is al in gebruik.');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    const user = await this.userService.createUser({
      naam: dto.naam,
      email: dto.email,
      passwordHash,
      geboortedatum: dto.geboortedatum,
    });

    return new RegisterResponse(user);
  }

  async login(
    dto: LoginDto,
    ip: string | null,
    deviceInfo: string | null,
  ): Promise<AuthTokensResponse> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      await this.recordAttempt(null, false, ip);
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const recentFailures = await this.countRecentFailures(user.id);
    if (recentFailures >= MAX_FAILED_ATTEMPTS || user.isGeblokkeerd) {
      await this.userService.setBlockedStatus(user, true);
      throw new ForbiddenException(ACCOUNT_LOCKED_MESSAGE);
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      await this.recordAttempt(user, false, ip);
      if (recentFailures + 1 >= MAX_FAILED_ATTEMPTS) {
        await this.userService.setBlockedStatus(user, true);
      }
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    await this.recordAttempt(user, true, ip);
    if (user.isGeblokkeerd) {
      await this.userService.setBlockedStatus(user, false);
    }

    return this.issueSession(user, deviceInfo);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokensResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const session = await this.sessionRepository.findOne({
      where: { id: payload.sessionId, user: { id: payload.sub } },
      relations: { user: true },
    });
    if (!session) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }
    if (session.verlooptOp.getTime() <= Date.now()) {
      await this.sessionRepository.remove(session);
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    const tokenMatches = await argon2.verify(
      session.refreshTokenHash,
      dto.refreshToken,
    );
    if (!tokenMatches) {
      await this.sessionRepository.remove(session);
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }

    return this.rotateSession(session);
  }

  async logout(dto: RefreshTokenDto): Promise<LogoutResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const session = await this.sessionRepository.findOne({
      where: { id: payload.sessionId, user: { id: payload.sub } },
    });
    if (session) {
      await this.sessionRepository.remove(session);
    }
    return { message: 'Uitgelogd.' };
  }

  private async issueSession(
    user: User,
    deviceInfo: string | null,
  ): Promise<AuthTokensResponse> {
    const accessToken = await this.signAccessToken(user);
    const session = this.sessionRepository.create({
      user: { id: user.id } as User,
      refreshTokenHash: '',
      deviceInfo,
      verlooptOp: new Date(),
    });
    const savedSession = await this.sessionRepository.save(session);

    const refreshToken = await this.signRefreshToken(user.id, savedSession.id);
    savedSession.refreshTokenHash = await argon2.hash(refreshToken, {
      type: argon2.argon2id,
    });
    savedSession.verlooptOp = this.resolveRefreshExpiry(refreshToken);
    await this.sessionRepository.save(savedSession);

    return new AuthTokensResponse(accessToken, refreshToken);
  }

  private async rotateSession(session: Session): Promise<AuthTokensResponse> {
    const accessToken = await this.signAccessToken(session.user);
    const refreshToken = await this.signRefreshToken(
      session.user.id,
      session.id,
    );
    session.refreshTokenHash = await argon2.hash(refreshToken, {
      type: argon2.argon2id,
    });
    session.verlooptOp = this.resolveRefreshExpiry(refreshToken);
    await this.sessionRepository.save(session);
    return new AuthTokensResponse(accessToken, refreshToken);
  }

  private signAccessToken(user: User): Promise<string> {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(
      payload,
      this.buildSignOptions('JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRES_IN'),
    );
  }

  private signRefreshToken(userId: string, sessionId: string): Promise<string> {
    const payload: RefreshTokenPayload = { sub: userId, sessionId };
    return this.jwtService.signAsync(
      payload,
      this.buildSignOptions('JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRES_IN'),
    );
  }

  private buildSignOptions(secretKey: string, expiresInKey: string): JwtSignOptions {
    return {
      secret: this.configService.getOrThrow<string>(secretKey),
      expiresIn: this.configService.getOrThrow<string>(
        expiresInKey,
      ) as JwtSignOptions['expiresIn'],
    };
  }

  private async verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE);
    }
  }

  private resolveRefreshExpiry(token: string): Date {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    if (!decoded?.exp) {
      throw new InternalServerErrorException('Token kon niet worden verwerkt.');
    }
    return new Date(decoded.exp * 1000);
  }

  private async countRecentFailures(userId: string): Promise<number> {
    const windowStart = new Date(Date.now() - LOCK_WINDOW_MS);
    const lastSuccess = await this.loginAttemptRepository.findOne({
      where: { user: { id: userId }, gelukt: true },
      order: { pogingOp: 'DESC' },
    });
    const effectiveStart =
      lastSuccess && lastSuccess.pogingOp > windowStart
        ? lastSuccess.pogingOp
        : windowStart;

    return this.loginAttemptRepository.count({
      where: {
        user: { id: userId },
        gelukt: false,
        pogingOp: MoreThan(effectiveStart),
      },
    });
  }

  private async recordAttempt(
    user: User | null,
    gelukt: boolean,
    ip: string | null,
  ): Promise<void> {
    const attempt = this.loginAttemptRepository.create({
      user: user ? ({ id: user.id } as User) : null,
      gelukt,
      ipAdres: ip,
    });
    await this.loginAttemptRepository.save(attempt);
  }
}

