import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { HealthData } from '../../health-data/entities/health-data.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  naam: string;

  @Column({ unique: true })
  macAdres: string;

  @Column()
  firmwareVersie: string;

  @Column({ type: 'timestamptz', nullable: true })
  laatsteSync: Date | null;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => HealthData, (healthData) => healthData.device)
  healthData: HealthData[];
}
