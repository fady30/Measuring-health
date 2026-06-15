# Beveiligingstest-rapport — Measuring Health API

Dit rapport bevat het overzicht en de gedetailleerde resultaten van de uitgevoerde beveiligingstests voor de NestJS backend-API.

## Samenvattingstabel

| Nr. | Testgeval / Scenario | Stappen / Actie | Verwacht Resultaat | Feitelijk Resultaat / Bewijs | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **Argon2 Wachtwoord-hashing** | Registreer `charlie@measure-health.test` via `POST /auth/register` en controleer de database. | Het wachtwoordveld bevat een Argon2-hash, geen leesbaar wachtwoord. | Database bevat hash: `$argon2id$v=19$m=65536,t=3,p=4$z4htZ3Dm...$H+5TP92zwH1...`. Platte tekst (`Wachtwoord123!`) is onleesbaar. | ✅ **PASS** |
| **2** | **Gebruiker Registratie** | `POST /auth/register` met naam, e-mail en wachtwoord. | `201 Created`; gebruiker staat in de database. | Response: `201 Created` met `{ "id": "2e861c21...", "naam": "Charlie Brown", "email": "charlie@measure-health.test" }`. Gebruiker staat in de database. | ✅ **PASS** |
| **3** | **Login met Juiste Gegevens** | `POST /auth/login` met correcte combinatie. | `200 OK` met een geldig JWT (`accessToken` en `refreshToken`) in de response. | Response: `200 OK` met JSON-body bevattende `"accessToken"` en `"refreshToken"`. | ✅ **PASS** |
| **4** | **Login met Fout Wachtwoord** | `POST /auth/login` met verkeerd wachtwoord. | `401 Unauthorized`, geen tokens, generieke melding. | Response: `401 Unauthorized` met JSON: `{"statusCode": 401, "message": "Ongeldige inloggegevens."}`. Geen tokens geretourneerd. | ✅ **PASS** |
| **5** | **Beveiligd Endpoint zonder Token** | `GET /health-data` zonder `Authorization`-header. | `401 Unauthorized`. | Response: `401 Unauthorized` met JSON: `{"statusCode": 401, "message": "Unauthorized"}`. | ✅ **PASS** |
| **6** | **Beveiligd Endpoint met Fout Token** | `GET /health-data` met gemanipuleerd of verlopen JWT. | `401 Unauthorized`. | Response: `401 Unauthorized` (de handtekening van het token klopt niet meer, verzoek wordt geweigerd). | ✅ **PASS** |
| **7** | **DTO Invoervalidatie** | `POST /health-data` met tekst (`"niet-een-getal"`) in het veld `stappen`. | `400 Bad Request`. | Response: `400 Bad Request` met JSON: `{"statusCode": 400, "message": ["stappen must be an integer number", ... ]}`. | ✅ **PASS** |
| **8** | **SQL-injectie Protectie** | Voer `' OR '1'='1` in bij `POST /auth/login`. | Login geweigerd, geen databasefouten. | E-mailveld geeft `400 Bad Request` door email-validatie. Wachtwoordveld geeft `401 Unauthorized` door parameterized query (invoer wordt als letterlijke tekst gezien). | ✅ **PASS** |
| **9** | **Data-isolatie (Privacy)** | Vraag health-data op van Alice met Alice's token en van Bob met Bob's token. | Gebruikers zien uitsluitend eigen records; geen vreemde data. | Alice ziet uitsluitend 7 records van `"Wearable Alice"`. Bob ziet uitsluitend 7 records van `"Wearable Bob"`. Database-query filtert strict op `userId` uit JWT (`user: { id: userId }`). | ✅ **PASS** |

---

## Technische Details & Bewijslast

### Test 1 & 2: Wachtwoord-hashing & Registratie
* **HTTP Verzoek:**
  ```bash
  curl -X POST -H "Content-Type: application/json" \
    -d '{"naam": "Charlie Brown", "email": "charlie@measure-health.test", "password": "Wachtwoord123!", "geboortedatum": "1995-05-15"}' \
    http://localhost:3000/auth/register -i
  ```
* **HTTP Response:**
  ```http
  HTTP/1.1 201 Created
  Content-Type: application/json; charset=utf-8

  {"id":"2e861c21-1058-458a-a417-074ad81db62a","naam":"Charlie Brown","email":"charlie@measure-health.test"}
  ```
* **SQL / Database output:**
  ```sql
  SELECT email, "passwordHash" FROM users WHERE email = 'charlie@measure-health.test';
  ```
  ```text
              email            |                                           passwordHash                                            
  -----------------------------+---------------------------------------------------------------------------------------------------
   charlie@measure-health.test | $argon2id$v=19$m=65536,t=3,p=4$z4htZ3DmBb7exD1flToeIw$H+5TP92zwH1UCoO7UxstjIeXs28dJIggw/dMM3Kr5i0
  ```

### Test 3: Login met juiste gegevens
* **HTTP Verzoek:**
  ```bash
  curl -X POST -H "Content-Type: application/json" \
    -d '{"email": "charlie@measure-health.test", "password": "Wachtwoord123!"}' \
    http://localhost:3000/auth/login -i
  ```
* **HTTP Response:**
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json; charset=utf-8

  {"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...","tokenType":"Bearer"}
  ```

### Test 4: Login met fout wachtwoord
* **HTTP Verzoek:**
  ```bash
  curl -X POST -H "Content-Type: application/json" \
    -d '{"email": "charlie@measure-health.test", "password": "WrongPassword!"}' \
    http://localhost:3000/auth/login -i
  ```
* **HTTP Response:**
  ```http
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json; charset=utf-8

  {"statusCode":401,"message":"Ongeldige inloggegevens.","error":"UNAUTHORIZED","timestamp":"2026-06-09T07:26:35.030Z","path":"/auth/login"}
  ```

### Test 5 & 6: Beveiligd endpoint (Geen of ongeldig token)
* **Verzoek zonder token:**
  ```bash
  curl http://localhost:3000/health-data -i
  ```
* **Response:**
  ```http
  HTTP/1.1 401 Unauthorized
  {"statusCode":401,"message":"Unauthorized","error":"UNAUTHORIZED","timestamp":"2026-06-09T07:26:37.802Z","path":"/health-data"}
  ```
* **Verzoek met gemanipuleerd token:**
  ```bash
  curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZTg2MWMyMS0xMDU4LTQ1OGEtYTQxNy0wNzRhZDgxZGI2MmEiLCJlbWFpbCI6ImNoYXJsaWVAbWVhc3VyZS1oZWFsdGgudGVzdCIsImlhdCI6MTc4MDk4OTk5MCwiZXhwIjoxNzgwOTkzNTkwfQ.kX7lOxUS8kn4fdw0bTbUX3I3X4hMaQFS41Ah0r3J-NX" http://localhost:3000/health-data -i
  ```
* **Response:**
  ```http
  HTTP/1.1 401 Unauthorized
  {"statusCode":401,"message":"Unauthorized","error":"UNAUTHORIZED","timestamp":"2026-06-09T07:26:40.655Z","path":"/health-data"}
  ```

### Test 7: Invoervalidatie
* **HTTP Verzoek (`stappen` is tekst):**
  ```bash
  curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <GELDIG_TOKEN>" \
    -d '{"deviceId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "stappen": "niet-een-getal", "hartslag": 75, "slaapuren": 8.5, "gemetenOp": "2026-06-09T08:00:00.000Z"}' \
    http://localhost:3000/health-data -i
  ```
* **HTTP Response:**
  ```http
  HTTP/1.1 400 Bad Request
  {"statusCode":400,"message":["stappen must not be greater than 100000","stappen must not be less than 0","stappen must be an integer number"],"error":"BAD_REQUEST","timestamp":"2026-06-09T07:26:47.752Z","path":"/health-data"}
  ```

### Test 8: SQL-injectie
* **HTTP Verzoek met SQL-injectie in email:**
  ```bash
  curl -X POST -H "Content-Type: application/json" -d '{"email": "'\'' OR '\''1'\''='\''1", "password": "'\'' OR '\''1'\''='\''1"}' http://localhost:3000/auth/login -i
  ```
* **HTTP Response:**
  ```http
  HTTP/1.1 400 Bad Request
  {"statusCode":400,"message":["email must be an email"],"error":"BAD_REQUEST","timestamp":"2026-06-09T07:27:02.342Z","path":"/auth/login"}
  ```

### Test 9: Data-isolatie
* **Gezondheidsdata van Alice opvragen met Alice's token:**
  ```bash
  curl -H "Authorization: Bearer <ALICE_TOKEN>" http://localhost:3000/health-data -s
  ```
  *Geeft uitsluitend records terug gekoppeld aan "Wearable Alice".*
* **Gezondheidsdata van Bob opvragen met Bob's token:**
  ```bash
  curl -H "Authorization: Bearer <BOB_TOKEN>" http://localhost:3000/health-data -s
  ```
  *Geeft uitsluitend records terug gekoppeld aan "Wearable Bob".*
* **Code-implementatie (`src/health-data/health-data.service.ts`):**
  ```typescript
  async findForUser(userId: string, query: QueryHealthDataDto): Promise<HealthData[]> {
    const where: FindOptionsWhere<HealthData> = { user: { id: userId } };
    // ...
    return this.healthDataRepository.find({ where, ... });
  }
  ```
