import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { HealthData } from './entities/health-data.entity';
import { User } from '../users/entities/user.entity';
import { DevicesService } from '../devices/devices.service';
import { CreateHealthDataDto } from './dto/create-health-data.dto';
import { QueryHealthDataDto } from './dto/query-health-data.dto';

@Injectable()
export class HealthDataService {
  constructor(
    @InjectRepository(HealthData)
    private readonly healthDataRepository: Repository<HealthData>,
    private readonly devicesService: DevicesService,
  ) {}

  async create(userId: string, dto: CreateHealthDataDto): Promise<HealthData> {
    const device = await this.devicesService.findOwnedById(userId, dto.deviceId);
    if (!device) {
      throw new ForbiddenException('Geen toegang tot dit apparaat.');
    }

    const healthData = this.healthDataRepository.create({
      stappen: dto.stappen,
      hartslag: dto.hartslag,
      slaapuren: dto.slaapuren,
      gemetenOp: new Date(dto.gemetenOp),
      user: { id: userId } as User,
      device,
    });

    const saved = await this.healthDataRepository.save(healthData);
    await this.devicesService.markSynced(device);
    return saved;
  }

  async findForUser(
    userId: string,
    query: QueryHealthDataDto,
  ): Promise<HealthData[]> {
    const where: FindOptionsWhere<HealthData> = { user: { id: userId } };
    const dateFilter = this.buildDateFilter(query);
    if (dateFilter) {
      where.gemetenOp = dateFilter;
    }

    return this.healthDataRepository.find({
      where,
      order: { gemetenOp: 'DESC' },
      relations: { device: true },
    });
  }

  private buildDateFilter(query: QueryHealthDataDto): FindOptionsWhere<HealthData>['gemetenOp'] {
    if (query.van && query.tot) {
      return Between(new Date(query.van), new Date(query.tot));
    }
    if (query.van) {
      return MoreThanOrEqual(new Date(query.van));
    }
    if (query.tot) {
      return LessThanOrEqual(new Date(query.tot));
    }
    return undefined;
  }
}
