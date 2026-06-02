import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profile_settings')
export class ProfileSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'licht' })
  thema: string;

  @Column({ default: true })
  notificatiesAan: boolean;

  @Column({ type: 'int', default: 10000 })
  dagelijksStappendoel: number;

  @Column({ default: 'nl' })
  taal: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profileSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
