import type { ReactNode } from 'react'
import { type Contract, type ResourceDetail, type ResourceItem, type ResourceKey, type Service } from '../models/resourceConfig'
import { resourceLabel } from '../utils/dashboardUtils'

type RelatedSelect = (resourceKey: ResourceKey, item: ResourceItem) => void
type DetailProps = Readonly<{ detail: ResourceDetail; onRelatedSelect: RelatedSelect }>
type ResourceDetailsProps = Readonly<
  DetailProps & {
    openCreateModal?: (resourceKey: ResourceKey, defaultValues?: Record<string, unknown>) => void
    resourceKey: ResourceKey
  }
>
type RelatedListProps<T extends ResourceItem> = Readonly<{
  action?: ReactNode
  emptyLabel: string
  items: T[]
  renderItem: (item: T) => ReactNode
  title: string
}>
type RelatedRecordButtonProps = Readonly<{
  item: ResourceItem
  meta?: string
  onRelatedSelect: RelatedSelect
  resourceKey: ResourceKey
}>

export function ResourceDetails({
  detail,
  openCreateModal,
  onRelatedSelect,
  resourceKey,
}: Readonly<ResourceDetailsProps>) {
  return (
    <section className="details-panel">
      {resourceKey === 'suppliers' && <SupplierDetails detail={detail} onRelatedSelect={onRelatedSelect} />}
      {resourceKey === 'contacts' && <ContactDetails detail={detail} onRelatedSelect={onRelatedSelect} />}
      {resourceKey === 'contracts' && (
        <ContractDetails
          detail={detail}
          openCreateModal={openCreateModal}
          onRelatedSelect={onRelatedSelect}
        />
      )}
      {resourceKey === 'services' && (
        <ServiceDetails
          detail={detail}
          openCreateModal={openCreateModal}
          onRelatedSelect={onRelatedSelect}
        />
      )}
    </section>
  )
}

function RelatedRecordButton({ item, meta, onRelatedSelect, resourceKey }: RelatedRecordButtonProps) {
  return (
    <button type="button" className="details-link" onClick={() => onRelatedSelect(resourceKey, item)}>
      <strong>{resourceLabel(resourceKey, item)}</strong>
      {meta && <span>{meta}</span>}
    </button>
  )
}

function RelatedList<T extends ResourceItem>({
  action,
  emptyLabel,
  items,
  renderItem,
  title,
}: Readonly<RelatedListProps<T>>) {
  return (
    <div className="details-section">
      <div className={action ? 'resource-heading workspace-section-heading' : undefined}>
        <h4>{title}</h4>
        {action}
      </div>
      {items.length === 0 ? (
        <p className="details-empty">{emptyLabel}</p>
      ) : (
        <ul className="details-related-list">{items.map(renderItem)}</ul>
      )}
    </div>
  )
}

function SupplierDetails({ detail, onRelatedSelect }: Readonly<DetailProps>) {
  return (
    <div className="details-grid">
      <RelatedList
        title="Related contracts"
        emptyLabel="No related contracts."
        items={detail.contracts ?? []}
        renderItem={(contract) => (
          <li key={contract.id}>
            <RelatedRecordButton
              item={contract}
              meta={`${contract.status} · ${contract.startDate} to ${contract.endDate}`}
              onRelatedSelect={onRelatedSelect}
              resourceKey="contracts"
            />
          </li>
        )}
      />
      <RelatedList
        title="Related contacts"
        emptyLabel="No related contacts."
        items={detail.contacts ?? []}
        renderItem={(contact) => (
          <li key={contact.id}>
            <RelatedRecordButton
              item={contact}
              meta={[contact.position, contact.email, contact.phone].filter(Boolean).join(' · ')}
              onRelatedSelect={onRelatedSelect}
              resourceKey="contacts"
            />
          </li>
        )}
      />
      <RelatedList
        title="Related services"
        emptyLabel="No related services."
        items={detail.services ?? []}
        renderItem={(service) => (
          <li key={service.id}>
            <RelatedRecordButton
              item={service}
              meta={service.active ? 'Active' : 'Inactive'}
              onRelatedSelect={onRelatedSelect}
              resourceKey="services"
            />
          </li>
        )}
      />
    </div>
  )
}

function ContactDetails({ detail, onRelatedSelect }: Readonly<DetailProps>) {
  return (
    <div className="details-grid">
      <div className="details-section">
        <h4>Supplier</h4>
        {detail.supplier ? (
          <RelatedRecordButton
            item={detail.supplier}
            meta={[detail.supplier.email, detail.supplier.phone].filter(Boolean).join(' · ')}
            onRelatedSelect={onRelatedSelect}
            resourceKey="suppliers"
          />
        ) : (
          <p className="details-empty">Unknown Supplier</p>
        )}
      </div>
    </div>
  )
}

function ContractDetails({
  detail,
  openCreateModal,
  onRelatedSelect,
}: Readonly<DetailProps & { openCreateModal?: (resourceKey: ResourceKey, defaultValues?: Record<string, unknown>) => void }>) {
  const contract = detail.item as Contract | undefined

  return (
    <div className="details-grid">
      <RelatedList
        action={
          contract && (
            <button
              type="button"
              className="primary-action"
              onClick={() => openCreateModal?.('services', { contractId: contract.id, supplierId: contract.supplierId })}
            >
              Add service
            </button>
          )
        }
        title="Linked services"
        emptyLabel="No linked services."
        items={detail.services ?? []}
        renderItem={(service) => (
          <li key={service.id}>
            <RelatedRecordButton
              item={service}
              meta={service.active ? 'Active' : 'Inactive'}
              onRelatedSelect={onRelatedSelect}
              resourceKey="services"
            />
          </li>
        )}
      />
    </div>
  )
}

function ServiceDetails({
  detail,
  openCreateModal,
  onRelatedSelect,
}: Readonly<DetailProps & { openCreateModal?: (resourceKey: ResourceKey, defaultValues?: Record<string, unknown>) => void }>) {
  const service = detail.item as Service | undefined

  return (
    <div className="details-grid">
      <div className="details-section">
        <div className="resource-heading workspace-section-heading">
          <h4>Linked contract</h4>
          {service && (
            <button
              type="button"
              className="primary-action"
              onClick={() => openCreateModal?.('contracts', { supplierId: service.supplierId })}
            >
              Add contract
            </button>
          )}
        </div>
        {detail.contract ? (
          <RelatedRecordButton
            item={detail.contract}
            meta={detail.contract.status}
            onRelatedSelect={onRelatedSelect}
            resourceKey="contracts"
          />
        ) : (
          <p className="details-empty">No assigned contract.</p>
        )}
      </div>
    </div>
  )
}
