import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './database/typeorm-options';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { HealthDataModule } from './health-data/health-data.module';
import { GoalsModule } from './goals/goals.module';
import { DevicesModule } from './devices/devices.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildDataSourceOptions({
          host: configService.getOrThrow<string>('DATABASE_HOST'),
          port: Number(configService.getOrThrow<string>('DATABASE_PORT')),
          username: configService.getOrThrow<string>('DATABASE_USER'),
          password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
          database: configService.getOrThrow<string>('DATABASE_NAME'),
        }),
    }),
    AuthModule,
    UserModule,
    HealthDataModule,
    GoalsModule,
    DevicesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
