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

## SonarCloud Checks

-PR now will be checked by SonarCloud and will get blocked until all comments are resolved.

## Coverage

- Backend coverage is collected with JaCoCo and written to `Backend/target/site/jacoco/jacoco.xml`.
- SonarCloud reads that XML file during analysis, so Java unit-test coverage can contribute to the quality gate.
- To actually get non-zero coverage, you still need backend unit tests under `Backend/src/test/java`.
