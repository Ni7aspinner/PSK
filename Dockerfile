FROM maven:3.9.9-eclipse-temurin-21 AS backend-build

WORKDIR /app

COPY Backend/pom.xml .
COPY Backend/src ./src

RUN mvn -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS backend

WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY Frontend/package*.json .
RUN npm ci

COPY Frontend .

ARG BACKEND_URL=http://localhost:8080
RUN printf 'BACKEND_URL=%s\n' "$BACKEND_URL" > environment.properties \
  && npm run build

FROM nginx:1.27-alpine AS frontend

COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80
