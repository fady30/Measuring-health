import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { HealthDataService } from './health-data.service';
import { CreateHealthDataDto } from './dto/create-health-data.dto';
import { QueryHealthDataDto } from './dto/query-health-data.dto';
import { HealthData } from './entities/health-data.entity';

@UseGuards(JwtAuthGuard)
@Controller('health-data')
export class HealthDataController {
  constructor(private readonly healthDataService: HealthDataService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateHealthDataDto,
  ): Promise<HealthData> {
    return this.healthDataService.create(user.userId, dto);
  }

  @Get()
  find(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryHealthDataDto,
  ): Promise<HealthData[]> {
    return this.healthDataService.findForUser(user.userId, query);
  }
}
