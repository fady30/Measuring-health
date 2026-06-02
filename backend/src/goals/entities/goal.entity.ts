import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GoalProgress } from './goal-progress.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ type: 'double precision' })
  streefwaarde: number;

  @Column({ default: true })
  actief: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  aangemaaktOp: Date;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => GoalProgress, (progress) => progress.goal, { cascade: true })
  progress: GoalProgress[];
}
