package org.psk.service;

import lombok.RequiredArgsConstructor;
import org.psk.dto.DataDto;
import org.psk.repository.DataRepository;
import org.psk.utils.DataValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;


@RequiredArgsConstructor
@Service
public class DataService {

    private static final Logger log = LoggerFactory.getLogger(DataService.class);
    private final DataRepository dataRepository;

    public List<DataDto> getData() {
        log.info("GetData method called");
        return dataRepository.findAll().stream()
                .filter(DataValidator::isValidName)
                .map(data -> new DataDto(data.getId(), data.getName()))
                .toList();
    }
}
