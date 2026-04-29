package org.psk.controller;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.psk.dto.DataDto;
import org.psk.service.DataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class DataController {

  private static final Logger log = LoggerFactory.getLogger(DataController.class);

  private final DataService dataService;

  @GetMapping("/getData")
  public List<DataDto> getData() {
    log.info("Fetching all teachers");
    return dataService.getData();
  }
}
