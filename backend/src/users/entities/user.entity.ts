import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ProfileSettings } from './profile-settings.entity';
import { Device } from '../../devices/entities/device.entity';
import { HealthData } from '../../health-data/entities/health-data.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { Session } from '../../auth/entities/session.entity';
import { LoginAttempt } from '../../auth/entities/login-attempt.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  naam: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  passwordHash: string;

  @Column({ type: 'date' })
  geboortedatum: string;

  @Column({ default: false })
  isGeblokkeerd: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => ProfileSettings, (settings) => settings.user, {
    cascade: true,
  })
  profileSettings: ProfileSettings;

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @OneToMany(() => HealthData, (healthData) => healthData.user)
  healthData: HealthData[];

  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => LoginAttempt, (attempt) => attempt.user)
  loginAttempts: LoginAttempt[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
