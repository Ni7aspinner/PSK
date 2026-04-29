package org.psk.config;

import java.sql.SQLException;
import org.h2.tools.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class H2TcpServerConfig {

  @Bean(initMethod = "start", destroyMethod = "stop")
  public Server h2TcpServer() throws SQLException {
    return Server.createTcpServer("-tcp", "-tcpPort", "9092");
  }
}
