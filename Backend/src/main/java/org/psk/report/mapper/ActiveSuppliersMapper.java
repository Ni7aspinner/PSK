package org.psk.report.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.psk.report.dto.ActiveSupplierRow;

@Mapper
public interface ActiveSuppliersMapper {

  @Select(
      """
      SELECT
        s.id AS supplier_id,
        s.name,
        s.registration_code,
        COUNT(DISTINCT c.id) AS active_contracts,
        COUNT(DISTINCT ss.id) AS active_services
      FROM supplier s
      LEFT JOIN contract c
        ON c.supplier_id = s.id
       AND c.status = 'ACTIVE'
       AND c.end_date >= CURRENT_DATE
      LEFT JOIN supplier_service ss
        ON ss.supplier_id = s.id
       AND ss.active = TRUE
      GROUP BY s.id, s.name, s.registration_code
      ORDER BY s.name, s.id
      """)
  List<ActiveSupplierRow> findActiveSuppliers();
}
