import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal } from './entities/goal.entity';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.create(user.userId, dto);
  }

  @Get()
  find(@CurrentUser() user: AuthenticatedUser): Promise<Goal[]> {
    return this.goalsService.findForUser(user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.update(user.userId, id, dto);
  }
}
