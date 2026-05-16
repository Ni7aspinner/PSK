import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { formatCellValue } from '../utils/modelUtils'
import { IconEdit, IconChevronDown, IconChevronUp, IconTrash, IconTerminate } from './Icons'
import { ResourceDetails } from './ResourceDetails'

export function ResourceTable({ busyAction, config, deleteItem, expandedDetails, loadDetails, closeDetails, openRelatedDetails, openEditModal, resourceKey, rows, selected, terminateContract }) {
  if (rows.length === 0) return <p className="empty-state">No {config.title.toLowerCase()} found.</p>

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {config.columns.map((col) => <th key={col.key}>{col.label}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const primary = row[config.primaryField] ?? row.title
            const isDetailsLoading = busyAction === `details-${resourceKey}-${row.id}`
            const isExpanded = expandedDetails?.item?.id === row.id

            return (
              <Fragment key={row.id}>
                <tr className={selected?.id === row.id || isExpanded ? 'selected-row' : ''}>
                  {config.columns.map((col) => <td key={col.key}>{formatCellValue(row[col.key])}</td>)}
                  <td>
                    <div className="row-actions">
                      <button type="button" className="table-action" onClick={() => openEditModal(resourceKey, row)} title="Edit"><IconEdit /></button>
                      
                      {resourceKey === 'contracts' && row.status !== 'TERMINATED' && (
                        <button type="button" className="table-action" onClick={() => terminateContract(row)} title="Terminate Contract"><IconTerminate /></button>
                      )}
                      
                      <button type="button" className="table-action table-action-danger" onClick={() => deleteItem(resourceKey, row)} title="Delete"><IconTrash /></button>
                      
                      <button type="button" className="table-action" onClick={() => isExpanded ? closeDetails(resourceKey) : loadDetails(resourceKey, row)} title={isExpanded ? 'Collapse details' : 'Expand details'} disabled={isDetailsLoading}>
                        {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="details-row">
                    <td colSpan={config.columns.length + 1}>
                      <ResourceDetails detail={expandedDetails} onRelatedSelect={openRelatedDetails} primary={primary} resourceKey={resourceKey} />
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

const columnPropType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
})

const rowPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
})

ResourceTable.propTypes = {
  busyAction: PropTypes.string,
  closeDetails: PropTypes.func,
  config: PropTypes.shape({
    columns: PropTypes.arrayOf(columnPropType).isRequired,
    primaryField: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  deleteItem: PropTypes.func,
  expandedDetails: PropTypes.shape({
    item: rowPropType,
  }),
  loadDetails: PropTypes.func,
  openEditModal: PropTypes.func,
  openRelatedDetails: PropTypes.func,
  resourceKey: PropTypes.oneOf(['suppliers', 'contracts', 'services']).isRequired,
  rows: PropTypes.arrayOf(rowPropType).isRequired,
  selected: rowPropType,
  terminateContract: PropTypes.func,
}
