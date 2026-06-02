import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gelukt: boolean;

  @Column({ type: 'varchar', nullable: true })
  ipAdres: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  pogingOp: Date;

  @ManyToOne(() => User, (user) => user.loginAttempts, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
