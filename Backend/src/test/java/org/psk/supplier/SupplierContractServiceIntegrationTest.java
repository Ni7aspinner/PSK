package org.psk.supplier;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.psk.contract.ContractService;
import org.psk.contract.ContractStatus;
import org.psk.contract.dto.ContractDto;
import org.psk.contract.dto.CreateContractRequest;
import org.psk.security.jwt.JwtService;
import org.psk.service.ServiceManagementService;
import org.psk.service.dto.CreateServiceRequest;
import org.psk.service.dto.ServiceDto;
import org.psk.supplier.dto.CreateSupplierRequest;
import org.psk.supplier.dto.SupplierDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SupplierContractServiceIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private SupplierService supplierService;
  @Autowired private ContractService contractService;
  @Autowired private ServiceManagementService serviceManagementService;
  @Autowired private JwtService jwtService;

  @Test
  void supplierServicesEndpoint_returnsServiceAttachedToContract() throws Exception {
    SupplierDto supplier = supplierService.create(supplierRequest());
    ContractDto contract = contractService.create(contractRequest(supplier.getId()));
    ServiceDto service =
        serviceManagementService.create(serviceRequest(supplier.getId(), contract.getId()));
    String token = jwtService.generateToken("integration-user", "USER");

    mockMvc
        .perform(
            get("/api/suppliers/{id}/services", supplier.getId())
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(service.getId()))
        .andExpect(jsonPath("$[0].name").value("Managed hosting"))
        .andExpect(jsonPath("$[0].supplierId").value(supplier.getId()))
        .andExpect(jsonPath("$[0].contractId").value(contract.getId()));
  }

  private CreateSupplierRequest supplierRequest() {
    CreateSupplierRequest request = new CreateSupplierRequest();
    request.setName("Integration Supplier");
    request.setRegistrationCode("INT-SUP-001");
    request.setEmail("supplier@example.com");
    return request;
  }

  private CreateContractRequest contractRequest(Long supplierId) {
    CreateContractRequest request = new CreateContractRequest();
    request.setContractNumber("INT-C-001");
    request.setTitle("Integration contract");
    request.setStartDate(LocalDate.of(2026, 1, 1));
    request.setEndDate(LocalDate.of(2026, 12, 31));
    request.setStatus(ContractStatus.ACTIVE);
    request.setSupplierId(supplierId);
    return request;
  }

  private CreateServiceRequest serviceRequest(Long supplierId, Long contractId) {
    CreateServiceRequest request = new CreateServiceRequest();
    request.setName("Managed hosting");
    request.setDescription("Integration service");
    request.setActive(true);
    request.setSupplierId(supplierId);
    request.setContractId(contractId);
    return request;
  }
}
