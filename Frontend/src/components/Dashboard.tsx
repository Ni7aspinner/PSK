import { useCallback, useEffect, useMemo, useState } from 'react'
import heroMark from '../assets/hero.png'
import { backendApi } from '../api/backendApi'
import {
  resourceConfig,
  navItems,
  type Contact,
  type ContactCreatePayload,
  type ContactUpdatePayload,
  type Contract,
  type ContractCreatePayload,
  type ContractUpdatePayload,
  type ResourceDetail,
  type ResourceItem,
  type ResourceKey,
  type ResourceMode,
  type ResourcePayload,
  type Resources,
  type Service,
  type ServiceCreatePayload,
  type ServiceUpdatePayload,
  type Session,
  type Supplier,
  type SupplierCreatePayload,
  type SupplierUpdatePayload,
} from '../models/resourceConfig'
import {
  asRows,
  formPayload,
  replaceById,
  removeById,
  contractsForSupplier,
  servicesForContract,
  getEnrichedRows,
} from '../utils/dashboardUtils'
import { ResourceTable } from './ResourceTable'
import { FormModal } from './FormModal'
import { ThemeToggle } from './ThemeToggle'

type DashboardProps = Readonly<{
  session: Session
  onSignOut: () => void
}>

interface FormModalState {
  mode: ResourceMode
  resourceKey: ResourceKey
}

const initialResources: Resources = { suppliers: [], contacts: [], contracts: [], services: [] }

function searchableValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase()
  }

  return ''
}

async function ensurePdfBlob(blob: Blob) {
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer())
  const isPdfHeader =
    header.length === 4 && header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46

  if (!isPdfHeader) {
    throw new Error('The active suppliers report did not return a valid PDF.')
  }
}

function updatePrimaryContacts(contacts: Contact[], primaryContact: Contact) {
  return contacts.map((row) =>
    row.supplierId === primaryContact.supplierId ? { ...row, primary: row.id === primaryContact.id } : row,
  )
}

function Dashboard({ session, onSignOut }: Readonly<DashboardProps>) {
  const [activePage, setActivePage] = useState<ResourceKey>('suppliers')
  const [resources, setResources] = useState(initialResources)
  const [selected, setSelected] = useState<Partial<Record<ResourceKey, ResourceItem | null>>>({})
  const [expandedDetails, setExpandedDetails] = useState<Partial<Record<ResourceKey, ResourceDetail | null>>>({})
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [formModal, setFormModal] = useState<FormModalState | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const counts = useMemo(
    () => ({
      suppliers: resources.suppliers.length,
      contacts: resources.contacts.length,
      contracts: resources.contracts.length,
      services: resources.services.length,
    }),
    [resources],
  )

  const enrichedRows = useMemo(() => getEnrichedRows(activePage, resources), [activePage, resources])

  const filteredRows = useMemo(() => {
    if (!searchQuery) return enrichedRows
    const q = searchQuery.toLowerCase()
    return enrichedRows.filter((row) => {
      return Object.values(row).some((val) => searchableValue(val).includes(q))
    })
  }, [enrichedRows, searchQuery])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [suppliers, contacts, contracts, services] = await Promise.all([
        backendApi.getSuppliers(session),
        backendApi.getContacts(session),
        backendApi.getContracts(session),
        backendApi.getServices(session),
      ])
      setResources({
        suppliers: asRows(suppliers),
        contacts: asRows(contacts),
        contracts: asRows(contracts),
        services: asRows(services),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load resources.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const runAction = async (label: string, action: () => Promise<void>) => {
    setBusyAction(label)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.')
    } finally {
      setBusyAction('')
    }
  }

  const closeFormModal = () => setFormModal(null)

  const openCreateModal = (resourceKey: ResourceKey) => {
    setSelected((current) => ({ ...current, [resourceKey]: null }))
    setFormModal({ mode: 'create', resourceKey })
  }

  const openEditModal = (resourceKey: ResourceKey, item: ResourceItem) => {
    setSelected((current) => ({ ...current, [resourceKey]: item }))
    setFormModal({ mode: 'edit', resourceKey })
  }

  const createResource = (resourceKey: ResourceKey, payload: ResourcePayload) => {
    if (resourceKey === 'suppliers') return backendApi.createSupplier(session, payload as SupplierCreatePayload)
    if (resourceKey === 'contacts') return backendApi.createContact(session, payload as ContactCreatePayload)
    if (resourceKey === 'contracts') return backendApi.createContract(session, payload as ContractCreatePayload)
    return backendApi.createService(session, payload as ServiceCreatePayload)
  }

  const updateResource = (resourceKey: ResourceKey, item: ResourceItem, payload: ResourcePayload) => {
    if (resourceKey === 'suppliers')
      return backendApi.updateSupplier(session, item.id, payload as SupplierUpdatePayload)
    if (resourceKey === 'contacts')
      return backendApi.updateContact(session, item.id, payload as ContactUpdatePayload)
    if (resourceKey === 'contracts')
      return backendApi.updateContract(session, item.id, payload as ContractUpdatePayload)
    return backendApi.updateService(session, item.id, payload as ServiceUpdatePayload)
  }

  const deleteResource = (resourceKey: ResourceKey, item: ResourceItem) => {
    if (resourceKey === 'suppliers') return backendApi.deleteSupplier(session, item.id)
    if (resourceKey === 'contacts') return backendApi.deleteContact(session, item.id)
    if (resourceKey === 'contracts') return backendApi.deleteContract(session, item.id)
    return backendApi.deleteService(session, item.id)
  }

  const getResource = (resourceKey: ResourceKey, item: ResourceItem) => {
    if (resourceKey === 'suppliers') return backendApi.getSupplier(session, item.id)
    if (resourceKey === 'contacts') return backendApi.getContact(session, item.id)
    if (resourceKey === 'contracts') return backendApi.getContract(session, item.id)
    return backendApi.getService(session, item.id)
  }

  const createItem = (resourceKey: ResourceKey, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const config = resourceConfig[resourceKey]
    const payload = formPayload(event.currentTarget, config.fields, 'create')

    runAction(`create-${resourceKey}`, async () => {
      const created = await createResource(resourceKey, payload)
      setResources((current) => ({
        ...current,
        [resourceKey]: [...current[resourceKey], created],
      }))
      closeFormModal()
    })
  }

  const updateItem = (resourceKey: ResourceKey, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const config = resourceConfig[resourceKey]
    const item = selected[resourceKey]

    if (!item) return setError(`Select a ${config.singular} before updating.`)

    const payload = formPayload(event.currentTarget, config.fields, 'edit', item)

    runAction(`update-${resourceKey}-${item.id}`, async () => {
      const updated = await updateResource(resourceKey, item, payload)
      setResources((current) => ({
        ...current,
        [resourceKey]: replaceById(current[resourceKey], updated),
      }))
      setSelected((current) => ({ ...current, [resourceKey]: updated }))
      setExpandedDetails((current) =>
        current[resourceKey]?.item?.id === updated.id
          ? { ...current, [resourceKey]: { ...current[resourceKey], item: updated } }
          : current,
      )
      closeFormModal()
    })
  }

  const deleteItem = (resourceKey: ResourceKey, item: ResourceItem) => {
    runAction(`delete-${resourceKey}-${item.id}`, async () => {
      await deleteResource(resourceKey, item)
      setResources((current) => {
        if (resourceKey === 'suppliers') return { ...current, suppliers: removeById(current.suppliers, item.id) }
        if (resourceKey === 'contacts') return { ...current, contacts: removeById(current.contacts, item.id) }
        if (resourceKey === 'contracts') return { ...current, contracts: removeById(current.contracts, item.id) }
        return { ...current, services: removeById(current.services, item.id) }
      })
      setSelected((current) => ({ ...current, [resourceKey]: null }))
      setExpandedDetails((current) =>
        current[resourceKey]?.item?.id === item.id ? { ...current, [resourceKey]: null } : current,
      )
    })
  }

  const loadDetails = (resourceKey: ResourceKey, item: ResourceItem) => {
    runAction(`details-${resourceKey}-${item.id}`, async () => {
      const detail = await getResource(resourceKey, item)
      const nextDetail: ResourceDetail = { item: detail }

      if (resourceKey === 'suppliers') {
        const supplier = detail as Supplier
        nextDetail.contracts = contractsForSupplier(resources.contracts, supplier.id)
        nextDetail.contacts = await backendApi.getSupplierContacts(session, detail.id)
        nextDetail.services = await backendApi.getSupplierServices(session, detail.id)
      } else if (resourceKey === 'contacts') {
        const contact = detail as Contact
        nextDetail.supplier = resources.suppliers.find((s) => s.id === contact.supplierId)
      } else if (resourceKey === 'contracts') {
        const contract = detail as Contract
        nextDetail.supplier = resources.suppliers.find((s) => s.id === contract.supplierId)
        nextDetail.services = servicesForContract(resources.services, contract)
      } else if (resourceKey === 'services') {
        const service = detail as Service
        nextDetail.supplier = resources.suppliers.find((s) => s.id === service.supplierId)
        nextDetail.contract = resources.contracts.find((c) => c.id === service.contractId)
      }

      setExpandedDetails((current) => ({ ...current, [resourceKey]: nextDetail }))
    })
  }

  const closeDetails = (resourceKey: ResourceKey) =>
    setExpandedDetails((current) => ({ ...current, [resourceKey]: null }))

  const terminateContract = (contract: Contract) => {
    runAction(`terminate-contract-${contract.id}`, async () => {
      const terminated = await backendApi.terminateContract(session, contract.id)
      const nextContract = { ...contract, ...terminated, status: terminated?.status ?? 'TERMINATED' }
      setResources((current) => ({ ...current, contracts: replaceById(current.contracts, nextContract) }))
      setSelected((current) => ({ ...current, contracts: nextContract }))
      setExpandedDetails((current) =>
        current.contracts?.item?.id === nextContract.id
          ? { ...current, contracts: { ...current.contracts, item: nextContract } }
          : current,
      )
    })
  }

  const setPrimaryContact = (contact: Contact) => {
    runAction(`primary-contact-${contact.id}`, async () => {
      const primaryContact = await backendApi.setPrimaryContact(session, contact.id)
      setResources((current) => ({
        ...current,
        contacts: updatePrimaryContacts(current.contacts, primaryContact),
      }))
      setSelected((current) => ({ ...current, contacts: primaryContact }))
      setExpandedDetails((current) =>
        current.contacts?.item?.id === primaryContact.id
          ? { ...current, contacts: { ...current.contacts, item: primaryContact } }
          : current,
      )
    })
  }

  const openActiveSuppliersPdf = () => {
    runAction('active-suppliers-pdf', async () => {
      const pdfBlob = await backendApi.getActiveSuppliersPdf(session)
      await ensurePdfBlob(pdfBlob)
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000)
    })
  }

  const openRelatedDetails = (resourceKey: ResourceKey, item: ResourceItem) => {
    setActivePage(resourceKey)
    loadDetails(resourceKey, item)
  }

  const config = resourceConfig[activePage]


  const canOpenActiveSuppliersPdf = session.role?.toUpperCase() === 'ADMIN' && activePage === 'suppliers';

  return (
    <main className="dashboard-screen">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-title">
            <img src={heroMark} alt="PSK logo" className="dashboard-mark" />
            <div>
              <p className="kicker">
                Signed in as {session.username}
                {session.role ? ` · ${session.role}` : ''}
              </p>
              <h1>PSK projektas</h1>
            </div>
          </div>
          <div className="dashboard-header-right">
            <ThemeToggle />
            <button type="button" className="link-action dashboard-signout" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </header>

        <nav className="dashboard-nav" aria-label="Resource pages">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activePage === item.key ? 'nav-tab nav-tab-active' : 'nav-tab'}
              onClick={() => {
                setActivePage(item.key)
                setSearchQuery('')
              }}>
              {item.label}
              <span>{counts[item.key]}</span>
            </button>
          ))}
        </nav>

        {error && <p className="alert-text">{error}</p>}

        {loading ? (
          <section className="dashboard-panel">
            <p className="empty-state">Loading resources...</p>
          </section>
        ) : (
          <section className="dashboard-panel resource-main" aria-label={config.title}>
            <div className="resource-heading">
              <div>
                <p className="kicker">{config.title}</p>
                <h2>{filteredRows.length} records</h2>
              </div>
              <div className="heading-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder={`Search ${config.title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="primary-action resource-create"
                  onClick={() => openCreateModal(activePage)}>
                  Create {config.singular}
                </button>
                {canOpenActiveSuppliersPdf && (
                  <button
                    type="button"
                    className="primary-action"
                    style={{ marginLeft: 8 }}
                    onClick={openActiveSuppliersPdf}
                  >
                    Open active suppliers PDF
                  </button>
                )}
              </div>
            </div>
            <ResourceTable
              busyAction={busyAction}
              config={config}
              deleteItem={deleteItem}
              expandedDetails={expandedDetails[activePage]}
              loadDetails={loadDetails}
              closeDetails={closeDetails}
              openRelatedDetails={openRelatedDetails}
              openEditModal={openEditModal}
              resourceKey={activePage}
              rows={filteredRows}
              selected={selected[activePage]}
              setPrimaryContact={setPrimaryContact}
              terminateContract={terminateContract}
            />
          </section>
        )}

        {formModal && (
          <FormModal
            busy={
              formModal.mode === 'edit'
                ? busyAction === `update-${formModal.resourceKey}-${selected[formModal.resourceKey]?.id}`
                : busyAction === `create-${formModal.resourceKey}`
            }
            config={resourceConfig[formModal.resourceKey]}
            item={selected[formModal.resourceKey]}
            mode={formModal.mode}
            resources={resources}
            onClose={closeFormModal}
            onSubmit={(e) =>
              formModal.mode === 'edit' ? updateItem(formModal.resourceKey, e) : createItem(formModal.resourceKey, e)
            }
          />
        )}
      </div>
    </main>
  )
}

export { Dashboard }
