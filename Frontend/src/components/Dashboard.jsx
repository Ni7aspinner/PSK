import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import heroMark from '../assets/hero.png'
import { backendApi } from '../api/backendApi'
import { resourceConfig, navItems } from '../models/resourceConfig'
import { asRows, formPayload, replaceById, removeById, contractsForSupplier, servicesForContract, getEnrichedRows } from '../utils/dashboardUtils'
import { ResourceTable } from './ResourceTable'
import { FormModal } from './FormModal'

const initialResources = { suppliers: [], contracts: [], services: [] }

function Dashboard({ session, onSignOut }) {
  const [activePage, setActivePage] = useState('suppliers')
  const [resources, setResources] = useState(initialResources)
  const [selected, setSelected] = useState({})
  const [expandedDetails, setExpandedDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')
  const [formModal, setFormModal] = useState(null)

  const counts = useMemo(() => ({
    suppliers: resources.suppliers.length,
    contracts: resources.contracts.length,
    services: resources.services.length,
  }), [resources])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [suppliers, contracts, services] = await Promise.all([
        backendApi.getSuppliers(session),
        backendApi.getContracts(session),
        backendApi.getServices(session),
      ])
      setResources({ suppliers: asRows(suppliers), contracts: asRows(contracts), services: asRows(services) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load resources.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const runAction = async (label, action) => {
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

  const openCreateModal = (resourceKey) => {
    setSelected((current) => ({ ...current, [resourceKey]: null }))
    setFormModal({ mode: 'create', resourceKey })
  }

  const openEditModal = (resourceKey, item) => {
    setSelected((current) => ({ ...current, [resourceKey]: item }))
    setFormModal({ mode: 'edit', resourceKey })
  }

  const createItem = (resourceKey, event) => {
    event.preventDefault()
    const config = resourceConfig[resourceKey]
    const payload = formPayload(event.currentTarget, config.fields, 'create')

    runAction(`create-${resourceKey}`, async () => {
      const created = await backendApi[`create${config.title.slice(0, -1)}`](session, payload)
      setResources((current) => ({ ...current, [resourceKey]: [...current[resourceKey], created] }))
      closeFormModal()
    })
  }

  const updateItem = (resourceKey, event) => {
    event.preventDefault()
    const config = resourceConfig[resourceKey]
    const item = selected[resourceKey]

    if (!item) return setError(`Select a ${config.singular} before updating.`)

    const payload = formPayload(event.currentTarget, config.fields, 'edit', item)

    runAction(`update-${resourceKey}-${item.id}`, async () => {
      const updated = await backendApi[`update${config.title.slice(0, -1)}`](session, item.id, payload)
      setResources((current) => ({ ...current, [resourceKey]: replaceById(current[resourceKey], updated) }))
      setSelected((current) => ({ ...current, [resourceKey]: updated }))
      setExpandedDetails((current) => current[resourceKey]?.item?.id === updated.id 
        ? { ...current, [resourceKey]: { ...current[resourceKey], item: updated } } 
        : current
      )
      closeFormModal()
    })
  }

  const deleteItem = (resourceKey, item) => {
    const config = resourceConfig[resourceKey]
    runAction(`delete-${resourceKey}-${item.id}`, async () => {
      await backendApi[`delete${config.title.slice(0, -1)}`](session, item.id)
      setResources((current) => ({ ...current, [resourceKey]: removeById(current[resourceKey], item.id) }))
      setSelected((current) => ({ ...current, [resourceKey]: null }))
      setExpandedDetails((current) => current[resourceKey]?.item?.id === item.id ? { ...current, [resourceKey]: null } : current)
    })
  }

  const loadDetails = (resourceKey, item) => {
    const config = resourceConfig[resourceKey]
    runAction(`details-${resourceKey}-${item.id}`, async () => {
      const detail = await backendApi[`get${config.title.slice(0, -1)}`](session, item.id)
      const nextDetail = { item: detail }

      if (resourceKey === 'suppliers') {
        nextDetail.contracts = contractsForSupplier(resources.contracts, detail.id)
        nextDetail.services = await backendApi.getSupplierServices(session, detail.id)
      } else if (resourceKey === 'contracts') {
        nextDetail.supplier = resources.suppliers.find((s) => s.id === detail.supplierId)
        nextDetail.services = servicesForContract(resources.services, detail)
      } else if (resourceKey === 'services') {
        nextDetail.supplier = resources.suppliers.find((s) => s.id === detail.supplierId)
        nextDetail.contract = resources.contracts.find((c) => c.id === detail.contractId)
      }

      setExpandedDetails((current) => ({ ...current, [resourceKey]: nextDetail }))
    })
  }

  const closeDetails = (resourceKey) => setExpandedDetails((current) => ({ ...current, [resourceKey]: null }))

  const terminateContract = (contract) => {
    runAction(`terminate-contract-${contract.id}`, async () => {
      const terminated = await backendApi.terminateContract(session, contract.id)
      const nextContract = { ...contract, ...terminated, status: terminated?.status ?? 'TERMINATED' }
      setResources((current) => ({ ...current, contracts: replaceById(current.contracts, nextContract) }))
      setSelected((current) => ({ ...current, contracts: nextContract }))
      setExpandedDetails((current) => current.contracts?.item?.id === nextContract.id 
        ? { ...current, contracts: { ...current.contracts, item: nextContract } } 
        : current
      )
    })
  }

  const openRelatedDetails = (resourceKey, item) => {
    setActivePage(resourceKey)
    loadDetails(resourceKey, item)
  }

  const config = resourceConfig[activePage]

  return (
    <main className="dashboard-screen">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-title">
            <img src={heroMark} alt="PSK logo" className="dashboard-mark" />
            <div>
              <p className="kicker">Signed in as {session.username}{session.role ? ` · ${session.role}` : ''}</p>
              <h1>PSK projektas</h1>
            </div>
          </div>
          <button type="button" className="link-action dashboard-signout" onClick={onSignOut}>Sign out</button>
        </header>

        <nav className="dashboard-nav" aria-label="Resource pages">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activePage === item.key ? 'nav-tab nav-tab-active' : 'nav-tab'}
              onClick={() => setActivePage(item.key)}
            >
              {item.label}
              <span>{counts[item.key]}</span>
            </button>
          ))}
        </nav>

        {error && <p className="alert-text">{error}</p>}

        {loading ? (
          <section className="dashboard-panel"><p className="empty-state">Loading resources...</p></section>
        ) : (
          <section className="dashboard-panel resource-main" aria-label={config.title}>
            <div className="resource-heading">
              <div>
                <p className="kicker">{config.title}</p>
                <h2>{resources[activePage].length} records</h2>
              </div>
              <button type="button" className="primary-action resource-create" onClick={() => openCreateModal(activePage)}>
                Create {config.singular}
              </button>
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
              rows={getEnrichedRows(activePage, resources)}
              selected={selected[activePage]}
              terminateContract={terminateContract}
            />
          </section>
        )}

        {formModal && (
          <FormModal
            busy={formModal.mode === 'edit' ? busyAction === `update-${formModal.resourceKey}-${selected[formModal.resourceKey]?.id}` : busyAction === `create-${formModal.resourceKey}`}
            config={resourceConfig[formModal.resourceKey]}
            item={selected[formModal.resourceKey]}
            mode={formModal.mode}
            resources={resources}
            onClose={closeFormModal}
            onSubmit={(e) => formModal.mode === 'edit' ? updateItem(formModal.resourceKey, e) : createItem(formModal.resourceKey, e)}
          />
        )}
      </div>
    </main>
  )
}

Dashboard.propTypes = {
  onSignOut: PropTypes.func.isRequired,
  session: PropTypes.shape({
    role: PropTypes.string,
    token: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
}

export { Dashboard }
