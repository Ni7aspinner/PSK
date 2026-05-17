import { Fragment } from 'react'
import type { Contract, ResourceConfig, ResourceDetail, ResourceItem, ResourceKey } from '../models/resourceConfig'
import { isContractLike, resourceValue } from '../utils/dashboardUtils'
import { formatCellValue } from '../utils/modelUtils'
import { IconEdit, IconChevronDown, IconChevronUp, IconTrash, IconTerminate } from './Icons'
import { ResourceDetails } from './ResourceDetails'

type ResourceTableProps = Readonly<{
  busyAction: string
  config: ResourceConfig
  deleteItem: (resourceKey: ResourceKey, item: ResourceItem) => void
  expandedDetails?: ResourceDetail | null
  loadDetails: (resourceKey: ResourceKey, item: ResourceItem) => void
  closeDetails: (resourceKey: ResourceKey) => void
  openRelatedDetails: (resourceKey: ResourceKey, item: ResourceItem) => void
  openEditModal: (resourceKey: ResourceKey, item: ResourceItem) => void
  resourceKey: ResourceKey
  rows: ResourceItem[]
  selected?: ResourceItem | null
  terminateContract: (contract: Contract) => void
}>

export function ResourceTable({
  busyAction,
  config,
  deleteItem,
  expandedDetails,
  loadDetails,
  closeDetails,
  openRelatedDetails,
  openEditModal,
  resourceKey,
  rows,
  selected,
  terminateContract,
}: Readonly<ResourceTableProps>) {
  if (rows.length === 0) return <p className="empty-state">No {config.title.toLowerCase()} found.</p>

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {config.columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const primary = String(resourceValue(row, config.primaryField) ?? resourceValue(row, 'title') ?? row.id)
            const isDetailsLoading = busyAction === `details-${resourceKey}-${row.id}`
            const isExpanded = expandedDetails?.item?.id === row.id

            return (
              <Fragment key={row.id}>
                <tr className={selected?.id === row.id || isExpanded ? 'selected-row' : ''}>
                  {config.columns.map((col) => (
                    <td key={col.key}>{formatCellValue(resourceValue(row, col.key))}</td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="table-action"
                        onClick={() => openEditModal(resourceKey, row)}
                        title="Edit">
                        <IconEdit />
                      </button>

                      {resourceKey === 'contracts' && isContractLike(row) && row.status !== 'TERMINATED' && (
                        <button
                          type="button"
                          className="table-action"
                          onClick={() => terminateContract(row)}
                          title="Terminate Contract">
                          <IconTerminate />
                        </button>
                      )}

                      <button
                        type="button"
                        className="table-action table-action-danger"
                        onClick={() => deleteItem(resourceKey, row)}
                        title="Delete">
                        <IconTrash />
                      </button>

                      <button
                        type="button"
                        className="table-action"
                        onClick={() => (isExpanded ? closeDetails(resourceKey) : loadDetails(resourceKey, row))}
                        title={isExpanded ? 'Collapse details' : 'Expand details'}
                        disabled={isDetailsLoading}>
                        {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && expandedDetails && (
                  <tr className="details-row">
                    <td colSpan={config.columns.length + 1}>
                      <ResourceDetails
                        detail={expandedDetails}
                        onRelatedSelect={openRelatedDetails}
                        primary={primary}
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
