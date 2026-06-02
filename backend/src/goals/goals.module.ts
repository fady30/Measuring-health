import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './entities/goal.entity';
import { GoalProgress } from './entities/goal-progress.entity';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, GoalProgress])],
  controllers: [GoalsController],
  providers: [GoalsService],
})
export class GoalsModule {}
