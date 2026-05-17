# Backend

## Testing
To run the unit tests for the backend, use Maven:
```bash
mvn test
```

## Code Formatting

This project uses **Spotless** to enforce code formatting (Google Java Format). 

To check if your code is properly formatted, run:
```bash
mvn spotless:check
```

To automatically format your code according to the project rules, run:
```bash
mvn spotless:apply
```

