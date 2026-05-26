import type { ResourceConfig, Supplier } from '../models/resourceConfig'
import { resourceValue } from '../utils/dashboardUtils'
import { formatCellValue } from '../utils/modelUtils'
import { IconEdit, IconTrash } from './Icons'

type SupplierListProps = Readonly<{
  config: ResourceConfig
  isCompact: boolean
  onDelete: (supplier: Supplier) => void
  onEdit: (supplier: Supplier) => void
  onSelect: (supplier: Supplier) => void
  rows: Supplier[]
  selected?: Supplier | null
}>

export function SupplierList({ config, isCompact, onDelete, onEdit, onSelect, rows, selected }: SupplierListProps) {
  if (rows.length === 0) return <p className="empty-state">No {config.title.toLowerCase()} found.</p>

  const columns = isCompact ? config.columns.filter((col) => col.key === 'name') : config.columns

  return (
    <div className="table-wrap">
      <table className={`data-table ${isCompact ? 'data-table-compact' : ''}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {!isCompact && <th className="table-action-cell" aria-label="Row actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((supplier) => (
            <tr
              className={`${selected?.id === supplier.id ? 'selected-row' : ''} interactive-row`}
              key={supplier.id}
              onClick={() => onSelect(supplier)}
            >
              {columns.map((col, index) => {
                const value = formatCellValue(resourceValue(supplier, col.key))
                return (
                  <td key={col.key}>
                    {index === 0 ? (
                      <button
                        type="button"
                        className="table-row-button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onSelect(supplier)
                        }}
                      >
                        {value}
                      </button>
                    ) : (
                      value
                    )}
                  </td>
                )
              })}
              {!isCompact && (
                <td className="table-action-cell">
                  <div className="row-actions">
                    <button
                      type="button"
                      className="table-action"
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(supplier)
                      }}
                      title="Edit"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="table-action table-action-danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDelete(supplier)
                      }}
                      title="Delete"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
