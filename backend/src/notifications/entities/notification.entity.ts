import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titel: string;

  @Column({ type: 'text' })
  bericht: string;

  @Column()
  type: string;

  @Column({ default: false })
  gelezen: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  verstuurdOp: Date;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
