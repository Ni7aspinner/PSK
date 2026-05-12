package org.psk.config;

import java.util.Arrays;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
public class FlywayConfig {

  @Bean
  public Flyway flyway(DataSource dataSource) {
    Flyway flyway =
        Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .load();
    flyway.migrate();
    return flyway;
  }

  @Bean
  public static BeanFactoryPostProcessor flywayEntityManagerDependsOn() {
    return (ConfigurableListableBeanFactory beanFactory) -> {
      if (beanFactory.containsBeanDefinition("entityManagerFactory")) {
        BeanDefinition bd = beanFactory.getBeanDefinition("entityManagerFactory");
        String[] existing = bd.getDependsOn();
        if (existing == null) {
          bd.setDependsOn("flyway");
        } else {
          String[] updated = Arrays.copyOf(existing, existing.length + 1);
          updated[existing.length] = "flyway";
          bd.setDependsOn(updated);
        }
      }
    };
  }
}
