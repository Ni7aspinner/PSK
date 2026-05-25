# PSK

Team project

## Project Structure

- `Frontend/` - Vite + React app
- `Backend/` - Spring Boot 

## Setup

### Frontend

1. Open a terminal in `Frontend/`.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Backend

1. Open a terminal in `Backend/`.
2. Install and build the project:

```bash
mvn install
```

3. Start the backend with the BackendApplication.java file


## Dependencies

- Make sure you have Node.js and npm installed for the frontend.
- Make sure you have Java 21 and Maven installed for the backend.

## Local development

### Requirements

- Docker (for the database)
- Java 21
- Node.js and npm

### Database

Remote Database configuration:

Ask Nojus for .env file to use

Place the file under ```PSK/Backend```

Should be all set

To Connect Intellij IDEA to the DB, do the following:

1. Navigate to View -> Tool Windows -> Database 
2. Press the '+' icon
3. Data Source -> PostgreSQL
4. Navigate to SSH/SSL
5. Select "Use SSL"
6. Make sure the "Mode" is "Required"
7. Go back to General
8. Select "URL only"
9. From the `.env` file paste in the URL
10. Use the Username and Password from the `.env` file
11. Should be all set

For local testing (Outdated, have to use the unmodified application.properties with hardcoded db info):

Start PostgreSQL:

```bash
docker compose up -d
```

Stop PostgreSQL:

```bash
docker compose down
```

Reset PostgreSQL (wipe all data):

```bash
docker compose down -v && docker compose up -d
```

### Run Backend

```bash
cd Backend
./mvnw spring-boot:run
```

Windows:

```cmd
cd Backend
mvnw.cmd spring-boot:run
```

### Run Frontend

```bash
cd Frontend
npm run dev
```

## SonarCloud Checks

-PR now will be checked by SonarCloud and will get blocked until all comments are resolved.

## Coverage

- Backend coverage is collected with JaCoCo and written to `Backend/target/site/jacoco/jacoco.xml`.
- SonarCloud reads that XML file during analysis, so Java unit-test coverage can contribute to the quality gate.
- To actually get non-zero coverage, you still need backend unit tests under `Backend/src/test/java`.
