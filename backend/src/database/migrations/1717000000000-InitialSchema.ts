import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1717000000000 implements MigrationInterface {
  name = 'InitialSchema1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "naam" character varying NOT NULL,
        "email" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "geboortedatum" date NOT NULL,
        "isGeblokkeerd" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "profile_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "thema" character varying NOT NULL DEFAULT 'licht',
        "notificatiesAan" boolean NOT NULL DEFAULT true,
        "dagelijksStappendoel" integer NOT NULL DEFAULT 10000,
        "taal" character varying NOT NULL DEFAULT 'nl',
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_profile_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_profile_settings_userId" UNIQUE ("userId"),
        CONSTRAINT "FK_profile_settings_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "devices" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "naam" character varying NOT NULL,
        "macAdres" character varying NOT NULL,
        "firmwareVersie" character varying NOT NULL,
        "laatsteSync" TIMESTAMP WITH TIME ZONE,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_devices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_devices_macAdres" UNIQUE ("macAdres"),
        CONSTRAINT "FK_devices_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "health_data" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "stappen" integer NOT NULL,
        "hartslag" integer NOT NULL,
        "slaapuren" double precision NOT NULL,
        "gemetenOp" TIMESTAMP WITH TIME ZONE NOT NULL,
        "userId" uuid NOT NULL,
        "deviceId" uuid NOT NULL,
        CONSTRAINT "PK_health_data" PRIMARY KEY ("id"),
        CONSTRAINT "FK_health_data_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_health_data_device" FOREIGN KEY ("deviceId")
          REFERENCES "devices" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "goals" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" character varying NOT NULL,
        "streefwaarde" double precision NOT NULL,
        "actief" boolean NOT NULL DEFAULT true,
        "aangemaaktOp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_goals" PRIMARY KEY ("id"),
        CONSTRAINT "FK_goals_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "goal_progress" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "datum" date NOT NULL,
        "behaaldeWaarde" double precision NOT NULL,
        "gehaald" boolean NOT NULL,
        "goalId" uuid NOT NULL,
        CONSTRAINT "PK_goal_progress" PRIMARY KEY ("id"),
        CONSTRAINT "FK_goal_progress_goal" FOREIGN KEY ("goalId")
          REFERENCES "goals" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "login_attempts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "gelukt" boolean NOT NULL,
        "ipAdres" character varying,
        "pogingOp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_login_attempts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_login_attempts_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "refreshTokenHash" character varying NOT NULL,
        "deviceInfo" character varying,
        "verlooptOp" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sessions_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "titel" character varying NOT NULL,
        "bericht" text NOT NULL,
        "type" character varying NOT NULL,
        "gelezen" boolean NOT NULL DEFAULT false,
        "verstuurdOp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_health_data_user" ON "health_data" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_health_data_gemetenOp" ON "health_data" ("gemetenOp")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_login_attempts_user" ON "login_attempts" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sessions_user" ON "sessions" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user" ON "notifications" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "login_attempts"`);
    await queryRunner.query(`DROP TABLE "goal_progress"`);
    await queryRunner.query(`DROP TABLE "goals"`);
    await queryRunner.query(`DROP TABLE "health_data"`);
    await queryRunner.query(`DROP TABLE "devices"`);
    await queryRunner.query(`DROP TABLE "profile_settings"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
