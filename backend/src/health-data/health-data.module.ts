import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthData } from './entities/health-data.entity';
import { HealthDataService } from './health-data.service';
import { HealthDataController } from './health-data.controller';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [TypeOrmModule.forFeature([HealthData]), DevicesModule],
  controllers: [HealthDataController],
  providers: [HealthDataService],
})
export class HealthDataModule {}
