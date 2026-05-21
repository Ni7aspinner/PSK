package org.psk.common.conflict;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.psk.contact.Contact;
import org.psk.contact.ContactRepository;
import org.psk.contact.dto.ContactDto;
import org.psk.contact.dto.ContactMapper;
import org.psk.contract.Contract;
import org.psk.contract.ContractRepository;
import org.psk.contract.dto.ContractDto;
import org.psk.contract.dto.ContractMapper;
import org.psk.service.ServiceRepository;
import org.psk.service.dto.ServiceDto;
import org.psk.service.dto.ServiceMapper;
import org.psk.supplier.Supplier;
import org.psk.supplier.SupplierRepository;
import org.psk.supplier.dto.SupplierDto;
import org.psk.supplier.dto.SupplierMapper;

@ExtendWith(MockitoExtension.class)
class ConflictResolutionHelperTest {

  @Mock private SupplierRepository supplierRepository;
  @Mock private SupplierMapper supplierMapper;
  @Mock private ServiceRepository serviceRepository;
  @Mock private ServiceMapper serviceMapper;
  @Mock private ContractRepository contractRepository;
  @Mock private ContractMapper contractMapper;
  @Mock private ContactRepository contactRepository;
  @Mock private ContactMapper contactMapper;

  private ConflictResolutionHelper helper;

  @BeforeEach
  void setUp() {
    helper =
        new ConflictResolutionHelper(
            supplierRepository,
            supplierMapper,
            serviceRepository,
            serviceMapper,
            contractRepository,
            contractMapper,
            contactRepository,
            contactMapper);
  }

  @Test
  void loadCurrentState_mapsKnownEntityTypesToDtos() {
    Supplier supplier = new Supplier();
    org.psk.service.Service service = new org.psk.service.Service();
    Contract contract = new Contract();
    Contact contact = new Contact();
    SupplierDto supplierDto = SupplierDto.builder().id(1L).version(11L).build();
    ServiceDto serviceDto = ServiceDto.builder().id(2L).version(12L).build();
    ContractDto contractDto = ContractDto.builder().id(3L).version(13L).build();
    ContactDto contactDto = ContactDto.builder().id(4L).version(14L).build();

    when(supplierRepository.findById(1L)).thenReturn(Optional.of(supplier));
    when(supplierMapper.toDto(supplier)).thenReturn(supplierDto);
    when(serviceRepository.findById(2L)).thenReturn(Optional.of(service));
    when(serviceMapper.toDto(service)).thenReturn(serviceDto);
    when(contractRepository.findById(3L)).thenReturn(Optional.of(contract));
    when(contractMapper.toDto(contract)).thenReturn(contractDto);
    when(contactRepository.findById(4L)).thenReturn(Optional.of(contact));
    when(contactMapper.toDto(contact)).thenReturn(contactDto);

    assertThat(helper.loadCurrentState("org.psk.supplier.domain.Supplier", 1L))
        .isSameAs(supplierDto);
    assertThat(helper.loadCurrentState("ManagedService", 2L)).isSameAs(serviceDto);
    assertThat(helper.loadCurrentState("Contract", 3L)).isSameAs(contractDto);
    assertThat(helper.loadCurrentState("Contact", 4L)).isSameAs(contactDto);
  }

  @Test
  void loadCurrentState_returnsNullWhenStateCannotBeLoaded() {
    when(supplierRepository.findById(99L)).thenReturn(Optional.empty());

    assertThat(helper.loadCurrentState("Supplier", null)).isNull();
    assertThat(helper.loadCurrentState("Supplier", 99L)).isNull();
    assertThat(helper.loadCurrentState("Unknown", 1L)).isNull();
  }

  @Test
  void extractVersion_readsLongVersionWhenAvailable() {
    SupplierDto dto = SupplierDto.builder().version(5L).build();

    assertThat(helper.extractVersion(dto)).isEqualTo(5L);
  }

  @Test
  void extractVersion_returnsNullForMissingOrNonLongVersion() {
    assertThat(helper.extractVersion(null)).isNull();
    assertThat(helper.extractVersion(new Object())).isNull();
    assertThat(helper.extractVersion(new StringVersionState())).isNull();
  }

  @Test
  void normalizeEntityType_handlesNullBlankPackageNamesAndKnownSuffixes() {
    assertThat(helper.normalizeEntityType(null)).isEqualTo("Unknown");
    assertThat(helper.normalizeEntityType(" ")).isEqualTo("Unknown");
    assertThat(helper.normalizeEntityType("org.psk.supplier.domain.Supplier"))
        .isEqualTo("Supplier");
    assertThat(helper.normalizeEntityType("ManagedService")).isEqualTo("Service");
    assertThat(helper.normalizeEntityType("SignedContract")).isEqualTo("Contract");
    assertThat(helper.normalizeEntityType("EmergencyContact")).isEqualTo("Contact");
    assertThat(helper.normalizeEntityType("com.example.CustomEntity")).isEqualTo("CustomEntity");
    assertThat(helper.normalizeEntityType("PlainName")).isEqualTo("PlainName");
  }

  private static class StringVersionState {

    public String getVersion() {
      return "not-a-long";
    }
  }
}
