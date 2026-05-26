import { useCallback, useEffect, useMemo, useState } from 'react'
import heroMark from '../assets/hero.png'
import { backendApi } from '../api/backendApi'
import {
  resourceConfig,
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
  type ResourceCreateDefaults,
  type Resources,
  type Service,
  type ServiceCreatePayload,
  type ServiceUpdatePayload,
  type Session,
  type Supplier,
  type SupplierCreatePayload,
  type SupplierUpdatePayload,
  type WorkspaceResourceKey,
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
import { SupplierList } from './SupplierList'

type DashboardProps = Readonly<{
  session: Session
  onSignOut: () => void
}>

interface FormModalState {
  mode: ResourceMode
  resourceKey: ResourceKey
  defaultValues?: ResourceCreateDefaults
}

const initialResources: Resources = { suppliers: [], contacts: [], contracts: [], services: [] }
const workspaceColumnKeys = {
  contacts: ['firstName', 'lastName', 'position', 'email', 'phone', 'primaryLabel'],
  contracts: ['contractNumber', 'title', 'startDate', 'endDate', 'status'],
  services: ['name', 'description', 'activeLabel'],
} satisfies Record<WorkspaceResourceKey, string[]>
const workspaceTabs: WorkspaceResourceKey[] = ['contacts', 'contracts', 'services']

function searchableValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase()
  }

  return ''
}

function filterRows<T extends ResourceItem>(rows: T[], query: string) {
  if (!query) return rows
  const q = query.toLowerCase()
  return rows.filter((row) => Object.values(row).some((val) => searchableValue(val).includes(q)))
}

function isWorkspaceTab(resourceKey: ResourceKey): resourceKey is WorkspaceResourceKey {
  return workspaceTabs.includes(resourceKey as WorkspaceResourceKey)
}

function isSupplier(item: ResourceItem | null | undefined): item is Supplier {
  return Boolean(item && 'registrationCode' in item)
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

function replaceExpandedDetailItem(
  details: Partial<Record<ResourceKey, ResourceDetail | null>>,
  resourceKey: ResourceKey,
  item: ResourceItem,
) {
  const detail = details[resourceKey]
  return detail?.item?.id === item.id ? { ...details, [resourceKey]: { ...detail, item } } : details
}

function Dashboard({ session, onSignOut }: Readonly<DashboardProps>) {
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceResourceKey>('contacts')
  const [resources, setResources] = useState(initialResources)
  const [selected, setSelected] = useState<Partial<Record<ResourceKey, ResourceItem | null>>>({})
  const [expandedDetails, setExpandedDetails] = useState<Partial<Record<ResourceKey, ResourceDetail | null>>>({})
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [formModal, setFormModal] = useState<FormModalState | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('')

  const config = resourceConfig.suppliers
  const enrichedRows = useMemo(() => getEnrichedRows('suppliers', resources), [resources])
  const filteredRows = useMemo(() => filterRows(enrichedRows, searchQuery), [enrichedRows, searchQuery])

  const loadSuppliers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const suppliers = await backendApi.getSuppliers(session)
      setResources((current) => ({ ...current, suppliers: asRows(suppliers) }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load resources.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  useEffect(() => {
    globalThis.addEventListener('focus', loadSuppliers)
    return () => globalThis.removeEventListener('focus', loadSuppliers)
  }, [loadSuppliers])

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

  const loadSupplierRelations = (supplier: Supplier) => {
    runAction(`supplier-relations-${supplier.id}`, async () => {
      const [contacts, allContracts, services] = await Promise.all([
        backendApi.getSupplierContacts(session, supplier.id).then(asRows<Contact>),
        backendApi.getContracts(session).then(asRows<Contract>),
        backendApi.getSupplierServices(session, supplier.id).then(asRows<Service>),
      ])

      setResources((current) => ({
        ...current,
        contacts,
        contracts: contractsForSupplier(allContracts, supplier.id),
        services,
      }))
    })
  }

  const openSupplierWorkspace = (supplier: Supplier, tab: WorkspaceResourceKey = 'contacts') => {
    setSelected((current) => ({ ...current, suppliers: supplier }))
    setSearchQuery('')
    setWorkspaceSearchQuery('')
    loadSupplierRelations(supplier)
    setWorkspaceTab(tab)
  }

  const closeFormModal = () => setFormModal(null)

  const openCreateModal = (resourceKey: ResourceKey, defaultValues?: ResourceCreateDefaults) => {
    setSelected((current) => ({ ...current, [resourceKey]: null }))
    setFormModal({ mode: 'create', resourceKey, defaultValues })
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
      if (resourceKey === 'services') {
        const service = created as Service
        setExpandedDetails((curr) => {
          const detail = curr.contracts
          return detail && detail.item?.id === service.contractId
            ? { ...curr, contracts: { ...detail, services: [...(detail.services ?? []), service] } }
            : curr
        })
      }
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
      setExpandedDetails((current) => replaceExpandedDetailItem(current, resourceKey, updated))
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
      const next: ResourceDetail = { item: detail }
      if (resourceKey !== 'suppliers') {
        if (resourceKey === 'contacts') {
          const contact = detail as Contact
          next.supplier = resources.suppliers.find((s) => s.id === contact.supplierId)
        } else if (resourceKey === 'contracts') {
          const contract = detail as Contract
          next.supplier = resources.suppliers.find((s) => s.id === contract.supplierId)
          next.services = servicesForContract(resources.services, contract)
        } else {
          const service = detail as Service
          next.supplier = resources.suppliers.find((s) => s.id === service.supplierId)
          next.contract = resources.contracts.find((c) => c.id === service.contractId)
        }
      }
      setExpandedDetails((curr) => ({ ...curr, [resourceKey]: next }))
      setSelected((curr) => ({ ...curr, [resourceKey]: detail }))
    })
  }

  const closeDetails = (resourceKey: ResourceKey) => {
    setExpandedDetails((curr) => ({ ...curr, [resourceKey]: null }))
    if (resourceKey === 'suppliers') {
      setSelected((curr) => ({ ...curr, suppliers: null }))
    }
  }

  const terminateContract = (contract: Contract) => {
    runAction(`terminate-contract-${contract.id}`, async () => {
      const res = await backendApi.terminateContract(session, contract.id)
      const next = { ...contract, ...res, status: res?.status ?? 'TERMINATED' }
      setResources((curr) => ({ ...curr, contracts: replaceById(curr.contracts, next) }))
      setSelected((curr) => ({ ...curr, contracts: next }))
      setExpandedDetails((curr) => replaceExpandedDetailItem(curr, 'contracts', next))
    })
  }

  const setPrimaryContact = (contact: Contact) => {
    runAction(`primary-contact-${contact.id}`, async () => {
      const primary = await backendApi.setPrimaryContact(session, contact.id)
      const update = (rows: Contact[]) => updatePrimaryContacts(rows, primary)
      setResources((curr) => ({ ...curr, contacts: update(curr.contacts) }))
      setSelected((curr) => ({ ...curr, contacts: primary }))
      setExpandedDetails((curr) => replaceExpandedDetailItem(curr, 'contacts', primary))
    })
  }

  const selectedSupplier = isSupplier(selected.suppliers) ? selected.suppliers : undefined

  const switchWorkspaceTab = (tab: WorkspaceResourceKey, query = '') => {
    setWorkspaceTab(tab)
    setWorkspaceSearchQuery(query)
  }

  const openActiveSuppliersPdf = () => {
    runAction('active-suppliers-pdf', async () => {
      const pdfBlob = await backendApi.getActiveSuppliersPdf(session)
      await ensurePdfBlob(pdfBlob)
      const pdfUrl = URL.createObjectURL(pdfBlob)
      globalThis.open(pdfUrl, '_blank', 'noopener,noreferrer')
      globalThis.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000)
    })
  }

  const openRelatedDetails = (resourceKey: ResourceKey, item: ResourceItem) => {
    if (resourceKey === 'suppliers') {
      if (selected.suppliers?.id === item.id) {
        closeDetails('suppliers')
      } else {
        openSupplierWorkspace(resources.suppliers.find((s) => s.id === item.id) ?? (item as Supplier))
      }
      return
    }

    if (isWorkspaceTab(resourceKey)) {
      switchWorkspaceTab(resourceKey)
      loadDetails(resourceKey, item)
    }
  }

  const workspaceRows: ResourceItem[] = selectedSupplier
    ? getEnrichedRows(workspaceTab, {
        suppliers: [selectedSupplier],
        contacts: resources.contacts,
        contracts: resources.contracts,
        services: resources.services,
      })
    : []
  const filteredWorkspaceRows = filterRows(workspaceRows, workspaceSearchQuery)

  const openSupplierCreateModal = (resourceKey: WorkspaceResourceKey) =>
    selectedSupplier && openCreateModal(resourceKey, { supplierId: selectedSupplier.id })

  const tableActions = {
    busyAction,
    deleteItem,
    loadDetails,
    closeDetails,
    openRelatedDetails,
    openEditModal,
    setPrimaryContact,
    terminateContract,
  }
  const supplierMeta = selectedSupplier
    ? [
        ['Code', selectedSupplier.registrationCode],
        ['Email', selectedSupplier.email || '-'],
        ['Phone', selectedSupplier.phone || '-'],
      ]
    : []
  const canOpenActiveSuppliersPdf = session.role?.toUpperCase() === 'ADMIN'

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

        {error && <p className="alert-text">{error}</p>}

        {loading ? (
          <section className="dashboard-panel">
            <p className="empty-state">Loading resources...</p>
          </section>
        ) : (
          <section className="dashboard-panel resource-main" aria-label={config.title}>
            <div className="split-pane-layout">
              {/* Left Pane (Master Table) */}
              <div className={`master-pane ${selectedSupplier ? '' : 'master-pane-full'}`}>
                <div className="resource-heading supplier-list-heading">
                  <div className="supplier-list-toolbar">
                    <div>
                      <p className="kicker supplier-count-kicker">{config.title} · {filteredRows.length}</p>
                    </div>
                    <button
                      type="button"
                      className="primary-action resource-create supplier-create-action"
                      onClick={() => openCreateModal('suppliers')}>
                      Create {config.singular}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="search-input"
                    placeholder={`Search ${config.title.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <SupplierList
                  config={config}
                  isCompact={Boolean(selectedSupplier)}
                  onDelete={(supplier) => deleteItem('suppliers', supplier)}
                  onEdit={(supplier) => openEditModal('suppliers', supplier)}
                  onSelect={(supplier) => openRelatedDetails('suppliers', supplier)}
                  rows={filteredRows}
                  selected={selectedSupplier}
                />
              </div>

              {/* Right Pane (Supplier Workspace) */}
              {selectedSupplier && (
                <div className="workspace-pane">
                  <div className="workspace-content-pane">
                    <div className="workspace-profile-header">
                      <div>
                        <span className="kicker">Supplier Hub</span>
                        <h2 className="supplier-profile-title">
                          {selectedSupplier.name}
                        </h2>
                        <div className="profile-meta-grid">
                          {supplierMeta.map(([label, value]) => (
                            <div className="profile-meta-item" key={label}>
                              <span className="profile-meta-label">{label}</span>
                              <span className="profile-meta-value">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="heading-actions">
                        <button
                          type="button"
                          className="link-action workspace-link-action"
                          onClick={() => openEditModal('suppliers', selectedSupplier)}>
                          Edit supplier
                        </button>
                        {canOpenActiveSuppliersPdf && (
                          <button
                            type="button"
                            className="link-action workspace-link-action"
                            onClick={openActiveSuppliersPdf}>
                            Open active suppliers PDF
                          </button>
                        )}
                        <button
                          type="button"
                          className="link-action workspace-link-action close-supplier-action"
                          onClick={() => closeDetails('suppliers')}>
                          ✕ Close
                        </button>
                      </div>
                    </div>

                    <div className="dashboard-nav">
                      {workspaceTabs.map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          className={`nav-tab ${workspaceTab === tab ? 'nav-tab-active' : ''}`}
                          onClick={() => switchWorkspaceTab(tab)}>
                          {resourceConfig[tab].title} <span>{resources[tab].length}</span>
                        </button>
                      ))}
                    </div>

                    <div className="workspace-content-pane">
                      <div className="resource-heading workspace-section-heading">
                        <h4>{resourceConfig[workspaceTab].title}</h4>
                        <div className="heading-actions">
                          <input
                            type="text"
                            className="search-input"
                            placeholder={`Search ${resourceConfig[workspaceTab].title.toLowerCase()}...`}
                            value={workspaceSearchQuery}
                            onChange={(e) => setWorkspaceSearchQuery(e.target.value)}
                          />
                          <button
                            type="button"
                            className="primary-action"
                            onClick={() => openSupplierCreateModal(workspaceTab)}>
                            Add {resourceConfig[workspaceTab].singular}
                          </button>
                        </div>
                      </div>
                      <ResourceTable
                        {...tableActions}
                        columnKeys={workspaceColumnKeys[workspaceTab]}
                        config={resourceConfig[workspaceTab]}
                        expandedDetails={expandedDetails[workspaceTab]}
                        resourceKey={workspaceTab}
                        rows={filteredWorkspaceRows}
                        selected={selected[workspaceTab]}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            defaultValues={formModal.defaultValues}
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
