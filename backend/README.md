# Measuring Health API

Centrale NestJS API voor de Measuring Health applicatie. Ontsluit een PostgreSQL-database voor de webapplicatie, de Flutter-app en de ESP32-wearable.

## Stack

- NestJS (TypeScript)
- PostgreSQL met TypeORM (migraties, geen `synchronize` in productie)
- JWT access- en refresh-tokens
- Argon2id voor wachtwoordhashing
- Validatie met class-validator via een globale `ValidationPipe`
- Docker en docker-compose

## Lokaal draaien

```bash
cp .env.example .env
npm install
docker compose up -d db
npm run migration:run
npm run seed
npm run start:dev
```

De API draait standaard op `http://localhost:3000`.

## Volledig via Docker

```bash
cp .env.example .env
docker compose up --build
docker compose exec api npm run seed:prod
```

De migraties draaien automatisch bij het starten van de api-container.

## Belangrijke scripts

| Script | Omschrijving |
| --- | --- |
| `npm run start:dev` | Start de API met watch-mode |
| `npm run build` | Compileert naar `dist/` |
| `npm run migration:run` | Voert de migraties uit (lokaal, ts-node) |
| `npm run migration:revert` | Draait de laatste migratie terug |
| `npm run seed` | Vult de database met testgebruikers en voorbeelddata |

## Endpoints

| Methode | Pad | Beveiligd |
| --- | --- | --- |
| POST | `/auth/register` | nee |
| POST | `/auth/login` | nee |
| POST | `/auth/refresh` | nee |
| POST | `/auth/logout` | nee |
| GET | `/users/me` | ja |
| PATCH | `/users/me` | ja |
| POST | `/health-data` | ja |
| GET | `/health-data` | ja |
| POST | `/goals` | ja |
| GET | `/goals` | ja |
| POST | `/devices` | ja |
| GET | `/notifications` | ja |
| PATCH | `/notifications/:id/read` | ja |

## Seed-accounts

Na `npm run seed` bestaan twee testgebruikers met wachtwoord `Wachtwoord123!`:

- `alice@measure-health.test`
- `bob@measure-health.test`

Gebruik ze om data-isolatie te controleren: met het token van Alice mag je nooit de health-data van Bob kunnen ophalen.
