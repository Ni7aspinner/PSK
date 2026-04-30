import { render, screen } from '@testing-library/react'
import { DataTable } from './DataTable'

describe('DataTable', () => {
  it('renders headers and rows from table data', () => {
    const tableData = {
      columns: ['id', 'name'],
      rows: [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ],
      rowCount: 2,
    }

    render(
      <DataTable
        tableData={tableData}
        formatCellValue={(value) => String(value)}
        rowKeyPrefix="data-row"
      />,
    )

    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})