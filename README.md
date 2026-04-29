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

3. Start the backend with BackendApplication.java file


## Dependencies

- Make sure you have Node.js and npm installed for the frontend.
- Make sure you have Java 21 and Maven installed for the backend.

## SonarCloud Setup

1. Create the project in SonarCloud for this repository.
2. Add a GitHub secret named `SONAR_TOKEN`.
3. Add GitHub repository variables named `SONAR_ORGANIZATION` and `SONAR_PROJECT_KEY`.
4. Push the workflow from `.github/workflows/sonarcloud.yml`.
5. In GitHub branch protection rules for `main`, require the `SonarCloud` status check before merge.
6. If you want formatting to block merges too, keep `Spotless` in the workflow and require that check as well.

## Coverage

- Backend coverage is collected with JaCoCo and written to `Backend/target/site/jacoco/jacoco.xml`.
- SonarCloud reads that XML file during analysis, so Java unit-test coverage can contribute to the quality gate.
- To actually get non-zero coverage, you still need backend unit tests under `Backend/src/test/java`.

Note: PRs from forked repositories do not receive GitHub secrets, so SonarCloud analysis will not run for those PRs unless you use a different security model.
