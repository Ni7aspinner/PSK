package org.psk.service;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.Instant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.psk.supplier.Supplier;

class ServiceTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    void onCreate_setsCreatedAtTimestamp() {
        Service service = new Service();
        assertThat(service.getCreatedAt()).isNull();

        service.onCreate();

        assertThat(service.getCreatedAt()).isNotNull();
        assertThat(service.getCreatedAt()).isBeforeOrEqualTo(Instant.now());
    }

    @Test
    void onCreate_resetsActiveToTrue_ifActiveIsNull() {
        Service service = new Service();
        service.setActive(null);

        service.onCreate();

        assertThat(service.getActive()).isTrue();
    }

    @Test
    void equalsAndHashCode_areBasedOnNameAndSupplierId() {
        Supplier supplierA = new Supplier();
        supplierA.setId(10L);

        Supplier supplierB = new Supplier();
        supplierB.setId(20L);

        Service s1 = new Service();
        s1.setName("Cloud Hosting");
        s1.setSupplier(supplierA);

        Service s2 = new Service();
        s2.setName("Cloud Hosting");
        s2.setSupplier(supplierA);

        Service s3 = new Service();
        s3.setName("Different Service");
        s3.setSupplier(supplierA);

        Service s4 = new Service();
        s4.setName("Cloud Hosting");
        s4.setSupplier(supplierB);

        Service sNull1 = new Service();
        Service sNull2 = new Service();

        assertThat(s1).isEqualTo(s2);
        assertThat(s1.hashCode()).isEqualTo(s2.hashCode());

        assertThat(s1).isNotEqualTo(s3);
        assertThat(s1.hashCode()).isNotEqualTo(s3.hashCode());

        assertThat(s1).isNotEqualTo(s4);
        assertThat(s1.hashCode()).isNotEqualTo(s4.hashCode());

        assertThat(sNull1).isNotEqualTo(s1);
        assertThat(sNull1).isNotEqualTo(sNull2);

        assertThat(s1).isNotEqualTo(new Object());
    }

    @Test
    void validation_failsIfMandatoryFieldsAreMissing() {
        Service service = new Service();

        var violations = validator.validate(service);

        assertThat(violations).hasSize(2);

        assertThat(violations)
                .extracting(v -> v.getPropertyPath().toString())
                .containsExactlyInAnyOrder("name", "supplier");
    }

    @Test
    void validation_passesWithValidData() {
        Supplier validSupplier = new Supplier();

        Service service = new Service();
        service.setName("Cloud Storage");
        service.setSupplier(validSupplier);

        var violations = validator.validate(service);

        assertThat(violations).isEmpty();
    }
}