package org.psk.contact.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UpdateContactRequest extends CreateContactRequest {

  @NotNull private Long version;
}
