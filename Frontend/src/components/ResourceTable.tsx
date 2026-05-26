import { Fragment } from 'react'
import type {
  Contact,
  Contract,
  ResourceConfig,
  ResourceDetail,
  ResourceItem,
  ResourceKey,
} from '../models/resourceConfig'
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
  closeDetails: (resourceKey: ResourceKey) => void
  openRelatedDetails: (resourceKey: ResourceKey, item: ResourceItem) => void
  openEditModal: (resourceKey: ResourceKey, item: ResourceItem) => void
  resourceKey: ResourceKey
  rows: ResourceItem[]
  selected?: ResourceItem | null
  setPrimaryContact: (contact: Contact) => void
  terminateContract: (contract: Contract) => void
}>

export function ResourceTable({
  busyAction = '',
  config,
  columnKeys,
  deleteItem,
  emptyMessage,
  expandedDetails,
  loadDetails,
  closeDetails,
  openRelatedDetails,
  openEditModal,
  resourceKey,
  rows,
  selected,
  setPrimaryContact,
  terminateContract,
}: Readonly<ResourceTableProps>) {
  if (rows.length === 0) return <p className="empty-state">{emptyMessage ?? `No ${config.title.toLowerCase()} found.`}</p>

  const displayColumns = config.columns.filter((col) => !columnKeys || columnKeys.includes(col.key))
  const canExpand = resourceKey === 'contracts' || resourceKey === 'services'

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {displayColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th className="table-action-cell" aria-label="Row actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isExpanded = expandedDetails?.item?.id === row.id
            const isDetailsLoading = busyAction === `details-${resourceKey}-${row.id}`
            const activateRow = () => (isExpanded ? closeDetails(resourceKey) : loadDetails(resourceKey, row))

            return (
              <Fragment key={row.id}>
                <tr
                  className={`${selected?.id === row.id || isExpanded ? 'selected-row' : ''} ${canExpand ? 'interactive-row' : ''}`}
                  onClick={canExpand ? activateRow : undefined}
                >
                  {displayColumns.map((col) => {
                    const value = formatCellValue(resourceValue(row, col.key))
                    return <td key={col.key}>{value}</td>
                  })}
                  <td className="table-action-cell">
                    <div className="row-actions">
                      <button type="button" className="table-action" onClick={(event) => {
                          event.stopPropagation()
                          openEditModal(resourceKey, row)
                        }} title="Edit">
                        <IconEdit />
                      </button>

                      {resourceKey === 'contracts' && isContractLike(row) && row.status !== 'TERMINATED' && (
                        <button type="button" className="table-action" onClick={(event) => {
                            event.stopPropagation()
                            terminateContract(row)
                          }} title="Terminate Contract">
                          <IconTerminate />
                        </button>
                      )}

                      {resourceKey === 'contacts' && isContactLike(row) && !row.primary && (
                        <button type="button" className="table-action" onClick={(event) => {
                            event.stopPropagation()
                            setPrimaryContact(row)
                          }} title="Set Primary Contact">
                          <IconPrimary />
                        </button>
                      )}

                      <button type="button" className="table-action table-action-danger" onClick={(event) => {
                          event.stopPropagation()
                          deleteItem(resourceKey, row)
                        }} title="Delete">
                        <IconTrash />
                      </button>

                      {canExpand && (
                        <button
                          type="button"
                          className="table-action"
                          onClick={(event) => {
                            event.stopPropagation()
                            activateRow()
                          }}
                          title={isExpanded ? 'Collapse details' : 'Expand details'}
                          disabled={isDetailsLoading}
                        >
                          {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {canExpand && isExpanded && expandedDetails && (
                  <tr className="details-row">
                    <td colSpan={displayColumns.length + 1}>
                      <ResourceDetails
                        detail={expandedDetails}
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
