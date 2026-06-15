import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { User } from '../users/entities/user.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  async create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    const goal = this.goalRepository.create({
      type: dto.type,
      streefwaarde: dto.streefwaarde,
      actief: dto.actief ?? true,
      user: { id: userId } as User,
    });
    return this.goalRepository.save(goal);
  }

  async findForUser(userId: string): Promise<Goal[]> {
    return this.goalRepository.find({
      where: { user: { id: userId } },
      relations: { progress: true },
      order: { aangemaaktOp: 'DESC' },
    });
  }

  async update(
    userId: string,
    goalId: string,
    dto: UpdateGoalDto,
  ): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id: goalId, user: { id: userId } },
    });
    if (!goal) {
      throw new NotFoundException('Doel niet gevonden.');
    }
    Object.assign(goal, dto);
    return this.goalRepository.save(goal);
  }
}
