import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Goal } from './goal.entity';

@Entity('goal_progress')
export class GoalProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  datum: string;

  @Column({ type: 'double precision' })
  behaaldeWaarde: number;

  @Column()
  gehaald: boolean;

  @ManyToOne(() => Goal, (goal) => goal.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goalId' })
  goal: Goal;
}
