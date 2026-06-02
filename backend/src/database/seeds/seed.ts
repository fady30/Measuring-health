import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import dataSource from '../data-source';
import { User } from '../../users/entities/user.entity';
import { ProfileSettings } from '../../users/entities/profile-settings.entity';
import { Device } from '../../devices/entities/device.entity';
import { HealthData } from '../../health-data/entities/health-data.entity';
import { Goal } from '../../goals/entities/goal.entity';
import { GoalProgress } from '../../goals/entities/goal-progress.entity';
import { Notification } from '../../notifications/entities/notification.entity';

const SEED_PASSWORD = 'Wachtwoord123!';

interface SeedUserInput {
  naam: string;
  email: string;
  geboortedatum: string;
  thema: string;
  dagelijksStappendoel: number;
  device: { naam: string; macAdres: string; firmwareVersie: string };
  stappenReeks: number[];
  goal: { type: string; streefwaarde: number };
  notificatie: { titel: string; bericht: string; type: string };
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayOffset(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(8, 0, 0, 0);
  return date;
}

async function seedUser(input: SeedUserInput, passwordHash: string): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const profileSettingsRepository = dataSource.getRepository(ProfileSettings);
  const deviceRepository = dataSource.getRepository(Device);
  const healthDataRepository = dataSource.getRepository(HealthData);
  const goalRepository = dataSource.getRepository(Goal);
  const goalProgressRepository = dataSource.getRepository(GoalProgress);
  const notificationRepository = dataSource.getRepository(Notification);

  const user = await userRepository.save(
    userRepository.create({
      naam: input.naam,
      email: input.email,
      passwordHash,
      geboortedatum: input.geboortedatum,
    }),
  );

  await profileSettingsRepository.save(
    profileSettingsRepository.create({
      user,
      thema: input.thema,
      dagelijksStappendoel: input.dagelijksStappendoel,
    }),
  );

  const device = await deviceRepository.save(
    deviceRepository.create({
      user,
      naam: input.device.naam,
      macAdres: input.device.macAdres,
      firmwareVersie: input.device.firmwareVersie,
      laatsteSync: dayOffset(0),
    }),
  );

  const goal = await goalRepository.save(
    goalRepository.create({
      user,
      type: input.goal.type,
      streefwaarde: input.goal.streefwaarde,
      actief: true,
    }),
  );

  for (let index = 0; index < input.stappenReeks.length; index += 1) {
    const stappen = input.stappenReeks[index];
    const gemetenOp = dayOffset(input.stappenReeks.length - 1 - index);

    await healthDataRepository.save(
      healthDataRepository.create({
        user,
        device,
        stappen,
        hartslag: 70 + (index % 5) * 3,
        slaapuren: 7 + (index % 3) * 0.5,
        gemetenOp,
      }),
    );

    await goalProgressRepository.save(
      goalProgressRepository.create({
        goal,
        datum: toDateOnly(gemetenOp),
        behaaldeWaarde: stappen,
        gehaald: stappen >= input.goal.streefwaarde,
      }),
    );
  }

  await notificationRepository.save(
    notificationRepository.create({
      user,
      titel: input.notificatie.titel,
      bericht: input.notificatie.bericht,
      type: input.notificatie.type,
    }),
  );
}

async function seed(): Promise<void> {
  const logger = new Logger('Seed');
  await dataSource.initialize();

  try {
    const userRepository = dataSource.getRepository(User);
    const emails = ['alice@measure-health.test', 'bob@measure-health.test'];
    const existing = await userRepository.find({
      where: emails.map((email) => ({ email })),
    });
    if (existing.length > 0) {
      await userRepository.remove(existing);
      logger.log('Bestaande seed-gebruikers verwijderd.');
    }

    const passwordHash = await argon2.hash(SEED_PASSWORD, {
      type: argon2.argon2id,
    });

    await seedUser(
      {
        naam: 'Alice Jansen',
        email: 'alice@measure-health.test',
        geboortedatum: '2011-04-12',
        thema: 'licht',
        dagelijksStappendoel: 10000,
        device: {
          naam: 'Wearable Alice',
          macAdres: 'AA:BB:CC:DD:EE:01',
          firmwareVersie: '1.2.0',
        },
        stappenReeks: [8200, 11050, 9700, 12300, 10450, 7600, 13000],
        goal: { type: 'stappen', streefwaarde: 10000 },
        notificatie: {
          titel: 'Doel behaald',
          bericht: 'Je hebt je stappendoel gisteren gehaald.',
          type: 'doel',
        },
      },
      passwordHash,
    );

    await seedUser(
      {
        naam: 'Bob de Vries',
        email: 'bob@measure-health.test',
        geboortedatum: '2010-09-30',
        thema: 'donker',
        dagelijksStappendoel: 8000,
        device: {
          naam: 'Wearable Bob',
          macAdres: 'AA:BB:CC:DD:EE:02',
          firmwareVersie: '1.1.5',
        },
        stappenReeks: [5400, 6100, 7200, 8300, 4900, 9100, 6800],
        goal: { type: 'stappen', streefwaarde: 8000 },
        notificatie: {
          titel: 'Bijna bij je doel',
          bericht: 'Nog een korte wandeling en je haalt je doel vandaag.',
          type: 'doel',
        },
      },
      passwordHash,
    );

    logger.log('Seed voltooid. Wachtwoord voor beide accounts: ' + SEED_PASSWORD);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  const logger = new Logger('Seed');
  logger.error('Seed mislukt', error instanceof Error ? error.stack : undefined);
  process.exitCode = 1;
});
