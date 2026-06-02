import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ProfileSettings } from './entities/profile-settings.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponse } from './dto/user-profile.response';

interface CreateUserParams {
  naam: string;
  email: string;
  passwordHash: string;
  geboortedatum: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProfileSettings)
    private readonly profileSettingsRepository: Repository<ProfileSettings>,
  ) {}

  async createUser(params: CreateUserParams): Promise<User> {
    const user = this.userRepository.create({
      naam: params.naam,
      email: params.email,
      passwordHash: params.passwordHash,
      geboortedatum: params.geboortedatum,
    });
    const savedUser = await this.userRepository.save(user);
    const settings = this.profileSettingsRepository.create({ user: savedUser });
    await this.profileSettingsRepository.save(settings);
    savedUser.profileSettings = settings;
    return savedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async setBlockedStatus(user: User, blocked: boolean): Promise<void> {
    user.isGeblokkeerd = blocked;
    await this.userRepository.save(user);
  }

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { profileSettings: true },
    });
    if (!user) {
      throw new NotFoundException('Gebruiker niet gevonden.');
    }
    return new UserProfileResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { profileSettings: true },
    });
    if (!user) {
      throw new NotFoundException('Gebruiker niet gevonden.');
    }

    if (dto.naam !== undefined) {
      user.naam = dto.naam;
    }
    await this.userRepository.save(user);

    const settings =
      user.profileSettings ??
      this.profileSettingsRepository.create({ user });
    if (dto.thema !== undefined) {
      settings.thema = dto.thema;
    }
    if (dto.notificatiesAan !== undefined) {
      settings.notificatiesAan = dto.notificatiesAan;
    }
    if (dto.dagelijksStappendoel !== undefined) {
      settings.dagelijksStappendoel = dto.dagelijksStappendoel;
    }
    if (dto.taal !== undefined) {
      settings.taal = dto.taal;
    }
    await this.profileSettingsRepository.save(settings);
    user.profileSettings = settings;

    return new UserProfileResponse(user);
  }
}
