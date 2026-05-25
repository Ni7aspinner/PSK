package org.psk;

import io.github.cdimascio.dotenv.Dotenv;
import java.util.logging.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

  public static void main(String[] args) {
    Logger logger = Logger.getLogger(BackendApplication.class.getName());

    try {
      Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
      dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
    } catch (Exception e) {
      logger.warning(
          ".env file not found or couldn't be loaded. Using system environment variables.");
    }
    SpringApplication.run(BackendApplication.class, args);
  }
}
