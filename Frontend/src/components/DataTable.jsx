function DataTable({ tableData, formatCellValue, rowKeyPrefix = 'row' }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {tableData.columns.map((column) => (
              <th key={`${rowKeyPrefix}-header-${column}`}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={`${rowKeyPrefix}-${rowIndex}`}>
              {tableData.columns.map((column) => (
                <td key={`${rowKeyPrefix}-${rowIndex}-${column}`}>
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { DataTable }
