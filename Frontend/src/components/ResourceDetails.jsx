import PropTypes from 'prop-types'
import { resourceConfig } from '../models/resourceConfig'
import { resourceLabel } from '../utils/dashboardUtils'

export function ResourceDetails({ detail, onRelatedSelect, primary, resourceKey }) {
  const config = resourceConfig[resourceKey]

  return (
    <section className="details-panel">
      <div className="details-heading">
        <div>
          <p className="kicker">{config.singular} details</p>
          <h3>{primary}</h3>
        </div>
      </div>
      {resourceKey === 'suppliers' && <SupplierDetails detail={detail} onRelatedSelect={onRelatedSelect} />}
      {resourceKey === 'contracts' && <ContractDetails detail={detail} onRelatedSelect={onRelatedSelect} />}
      {resourceKey === 'services' && <ServiceDetails detail={detail} onRelatedSelect={onRelatedSelect} />}
    </section>
  )
}

function RelatedRecordButton({ item, meta, onRelatedSelect, resourceKey }) {
  return (
    <button type="button" className="details-link" onClick={() => onRelatedSelect(resourceKey, item)}>
      <strong>{resourceLabel(resourceKey, item)}</strong>
      {meta && <span>{meta}</span>}
    </button>
  )
}

function RelatedList({ emptyLabel, items, renderItem, title }) {
  return (
    <div className="details-section">
      <h4>{title}</h4>
      {items.length === 0 ? <p className="details-empty">{emptyLabel}</p> : <ul className="details-related-list">{items.map(renderItem)}</ul>}
    </div>
  )
}

function SupplierDetails({ detail, onRelatedSelect }) {
  return (
    <div className="details-grid">
      <RelatedList title="Related contracts" emptyLabel="No related contracts." items={detail.contracts ?? []} renderItem={(contract) => (
        <li key={contract.id}>
          <RelatedRecordButton item={contract} meta={`${contract.status} · ${contract.startDate} to ${contract.endDate}`} onRelatedSelect={onRelatedSelect} resourceKey="contracts" />
        </li>
      )} />
      <RelatedList title="Related services" emptyLabel="No related services." items={detail.services ?? []} renderItem={(service) => (
        <li key={service.id}>
          <RelatedRecordButton item={service} meta={service.active ? 'Active' : 'Inactive'} onRelatedSelect={onRelatedSelect} resourceKey="services" />
        </li>
      )} />
    </div>
  )
}

function ContractDetails({ detail, onRelatedSelect }) {
  return (
    <div className="details-grid">
      <div className="details-section">
        <h4>Supplier</h4>
        {detail.supplier ? (
          <RelatedRecordButton item={detail.supplier} meta={[detail.supplier.email, detail.supplier.phone].filter(Boolean).join(' · ')} onRelatedSelect={onRelatedSelect} resourceKey="suppliers" />
        ) : <p className="details-empty">Unknown Supplier</p>}
      </div>
      <RelatedList title="Linked services" emptyLabel="No linked services." items={detail.services ?? []} renderItem={(service) => (
        <li key={service.id}>
          <RelatedRecordButton item={service} meta={service.active ? 'Active' : 'Inactive'} onRelatedSelect={onRelatedSelect} resourceKey="services" />
        </li>
      )} />
    </div>
  )
}

function ServiceDetails({ detail, onRelatedSelect }) {
  return (
    <div className="details-grid">
      <div className="details-section">
        <h4>Supplier</h4>
        {detail.supplier ? (
          <RelatedRecordButton item={detail.supplier} meta={[detail.supplier.email, detail.supplier.phone].filter(Boolean).join(' · ')} onRelatedSelect={onRelatedSelect} resourceKey="suppliers" />
        ) : <p className="details-empty">Unknown Supplier</p>}
      </div>
      <div className="details-section">
        <h4>Contract</h4>
        {detail.contract ? (
          <RelatedRecordButton item={detail.contract} meta={detail.contract.status} onRelatedSelect={onRelatedSelect} resourceKey="contracts" />
        ) : <p className="details-empty">No assigned contract.</p>}
      </div>
    </div>
  )
}

const resourceItemPropType = PropTypes.shape({
  active: PropTypes.bool,
  contractNumber: PropTypes.string,
  email: PropTypes.string,
  endDate: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  name: PropTypes.string,
  phone: PropTypes.string,
  startDate: PropTypes.string,
  status: PropTypes.string,
  title: PropTypes.string,
})

const detailPropType = PropTypes.shape({
  contract: resourceItemPropType,
  contracts: PropTypes.arrayOf(resourceItemPropType),
  services: PropTypes.arrayOf(resourceItemPropType),
  supplier: resourceItemPropType,
})

ResourceDetails.propTypes = {
  detail: detailPropType.isRequired,
  onRelatedSelect: PropTypes.func.isRequired,
  primary: PropTypes.string.isRequired,
  resourceKey: PropTypes.oneOf(['suppliers', 'contracts', 'services']).isRequired,
}

RelatedRecordButton.propTypes = {
  item: resourceItemPropType.isRequired,
  meta: PropTypes.string,
  onRelatedSelect: PropTypes.func.isRequired,
  resourceKey: PropTypes.oneOf(['suppliers', 'contracts', 'services']).isRequired,
}

RelatedList.propTypes = {
  emptyLabel: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(resourceItemPropType).isRequired,
  renderItem: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
}

SupplierDetails.propTypes = {
  detail: detailPropType.isRequired,
  onRelatedSelect: PropTypes.func.isRequired,
}

ContractDetails.propTypes = {
  detail: detailPropType.isRequired,
  onRelatedSelect: PropTypes.func.isRequired,
}

ServiceDetails.propTypes = {
  detail: detailPropType.isRequired,
  onRelatedSelect: PropTypes.func.isRequired,
}
