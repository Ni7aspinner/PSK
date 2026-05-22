import { Fragment } from 'react'
import type { Contact, Contract, ResourceConfig, ResourceDetail, ResourceItem, ResourceKey } from '../models/resourceConfig'
import { isContactLike, isContractLike, resourceValue } from '../utils/dashboardUtils'
import { formatCellValue } from '../utils/modelUtils'
import { IconEdit, IconTrash, IconTerminate, IconPrimary, IconChevronDown, IconChevronUp } from './Icons'
import { ResourceDetails } from './ResourceDetails'

type ResourceTableProps = Readonly<{
  busyAction?: string
  config: ResourceConfig
  columnKeys?: string[]
  deleteItem: (resourceKey: ResourceKey, item: ResourceItem) => void
  emptyMessage?: string
  expandedDetails?: ResourceDetail | null
  loadDetails: (resourceKey: ResourceKey, item: ResourceItem) => void
  closeDetails?: (resourceKey: ResourceKey) => void
  openRelatedDetails: (resourceKey: ResourceKey, item: ResourceItem) => void
  openEditModal: (resourceKey: ResourceKey, item: ResourceItem) => void
  openCreateModal?: (resourceKey: ResourceKey, defaultValues?: Record<string, unknown>) => void
  resourceKey: ResourceKey
  rows: ResourceItem[]
  selected?: ResourceItem | null
  setPrimaryContact: (contact: Contact) => void
  terminateContract: (contract: Contract) => void
  isCompact?: boolean
}>

export function ResourceTable({
  config,
  columnKeys,
  deleteItem,
  emptyMessage,
  expandedDetails,
  loadDetails,
  closeDetails,
  openRelatedDetails,
  openEditModal,
  openCreateModal,
  resourceKey,
  rows,
  selected,
  setPrimaryContact,
  terminateContract,
  isCompact,
}: Readonly<ResourceTableProps>) {
  if (rows.length === 0) return <p className="empty-state">{emptyMessage ?? `No ${config.title.toLowerCase()} found.`}</p>

  const hideActions = isCompact && resourceKey === 'suppliers'
  const displayColumns = config.columns.filter((col) =>
    isCompact && resourceKey === 'suppliers' ? col.key === 'name' : !columnKeys || columnKeys.includes(col.key),
  )
  const canExpand = resourceKey === 'contracts' || resourceKey === 'services'
  const isRowInteractive = resourceKey === 'suppliers' || canExpand

  return (
    <div className="table-wrap">
      <table className={`data-table ${isCompact ? 'data-table-compact' : ''}`}>
        <thead>
          <tr>
            {displayColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {!hideActions && <th className="table-action-cell" aria-label="Row actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isExpanded = expandedDetails?.item?.id === row.id
            const activateRow = () => {
              if (resourceKey === 'suppliers') {
                openRelatedDetails(resourceKey, row)
              } else if (canExpand && isExpanded) {
                closeDetails?.(resourceKey)
              } else if (canExpand) {
                loadDetails(resourceKey, row)
              }
            }

            return (
              <Fragment key={row.id}>
                <tr
                  className={`${selected?.id === row.id || isExpanded ? 'selected-row' : ''} ${isRowInteractive ? 'interactive-row' : ''}`}
                  onClick={isRowInteractive ? activateRow : undefined}
                >
                  {displayColumns.map((col, index) => {
                    const value = formatCellValue(resourceValue(row, col.key))
                    if (index === 0 && isRowInteractive) {
                      return (
                        <td key={col.key}>
                          <button type="button" className="table-row-button">
                            {value}
                          </button>
                        </td>
                      )
                    }

                    if (col.key === 'supplierName') {
                      return (
                        <td key={col.key}>
                          <button
                            type="button"
                            className="link-action table-link-action"
                            onClick={() => {
                              openRelatedDetails('suppliers', { id: (row as Record<string, unknown>).supplierId as number } as ResourceItem)
                            }}
                          >
                            {value}
                          </button>
                        </td>
                      )
                    }

                    return <td key={col.key}>{value}</td>
                  })}
                  {!hideActions && (
                    <td className="table-action-cell">
                      <div className="row-actions">
                        <button type="button" className="table-action" onClick={() => {
                          openEditModal(resourceKey, row)
                        }} title="Edit">
                          <IconEdit />
                        </button>

                        {resourceKey === 'contracts' && isContractLike(row) && row.status !== 'TERMINATED' && (
                          <button type="button" className="table-action" onClick={() => {
                            terminateContract(row)
                          }} title="Terminate Contract">
                            <IconTerminate />
                          </button>
                        )}

                        {resourceKey === 'contacts' && isContactLike(row) && !row.primary && (
                          <button type="button" className="table-action" onClick={() => {
                            setPrimaryContact(row)
                          }} title="Set Primary Contact">
                            <IconPrimary />
                          </button>
                        )}

                        <button type="button" className="table-action table-action-danger" onClick={() => {
                          deleteItem(resourceKey, row)
                        }} title="Delete">
                          <IconTrash />
                        </button>

                        {canExpand && (
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => {
                              if (isExpanded) {
                                closeDetails?.(resourceKey)
                              } else {
                                loadDetails(resourceKey, row)
                              }
                            }}
                            title={isExpanded ? 'Collapse details' : 'Expand details'}
                          >
                            {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                {canExpand && isExpanded && expandedDetails && (
                  <tr className="details-row">
                    <td colSpan={displayColumns.length + 1}>
                      <ResourceDetails
                        detail={expandedDetails}
                        openCreateModal={openCreateModal}
                        onRelatedSelect={openRelatedDetails}
                        resourceKey={resourceKey}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
