import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Device } from '../../devices/entities/device.entity';

@Entity('health_data')
export class HealthData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  stappen: number;

  @Column({ type: 'int' })
  hartslag: number;

  @Column({ type: 'double precision' })
  slaapuren: number;

  @Column({ type: 'timestamptz' })
  gemetenOp: Date;

  @ManyToOne(() => User, (user) => user.healthData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Device, (device) => device.healthData, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deviceId' })
  device: Device;
}
