package org.psk.utils;

import org.psk.entity.Data;

public class DataValidator {

  public static boolean isValidName(Data data) {
    String name = data.getName();
    return name != null && !name.trim().isEmpty();
  }
}
