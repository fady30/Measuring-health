import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { User } from '../users/entities/user.entity';
import { CreateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  async create(userId: string, dto: CreateDeviceDto): Promise<Device> {
    const existing = await this.deviceRepository.findOne({
      where: { macAdres: dto.macAdres },
    });
    if (existing) {
      throw new ConflictException('Dit MAC-adres is al geregistreerd.');
    }

    const device = this.deviceRepository.create({
      naam: dto.naam,
      macAdres: dto.macAdres,
      firmwareVersie: dto.firmwareVersie,
      user: { id: userId } as User,
    });

    try {
      return await this.deviceRepository.save(device);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Dit MAC-adres is al geregistreerd.');
      }
      throw error;
    }
  }

  async findOwnedById(userId: string, deviceId: string): Promise<Device | null> {
    return this.deviceRepository.findOne({
      where: { id: deviceId, user: { id: userId } },
    });
  }

  async markSynced(device: Device): Promise<void> {
    device.laatsteSync = new Date();
    await this.deviceRepository.save(device);
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === '23505'
    );
  }
}
