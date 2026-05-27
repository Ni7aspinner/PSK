import type { ActiveSupplierRow, ActiveSuppliersReport } from '../models/resourceConfig'

type ActiveSuppliersReportPanelProps = Readonly<{
  error: string
  loading: boolean
  onRefresh: () => void
  onSearchChange: (value: string) => void
  report: ActiveSuppliersReport | null
  rows: ActiveSupplierRow[]
  searchQuery: string
}>

const formatGeneratedAt = (generatedAt?: string) => {
  if (!generatedAt) return 'Not generated yet'

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(generatedAt))
  } catch {
    return generatedAt
  }
}

const sum = (rows: ActiveSupplierRow[], key: 'activeContracts' | 'activeServices') =>
  rows.reduce((total, row) => total + row[key], 0)

export function ActiveSuppliersReportPanel({
  error,
  loading,
  onRefresh,
  onSearchChange,
  report,
  rows,
  searchQuery,
}: ActiveSuppliersReportPanelProps) {
  const allRows = report?.rows ?? []
  const activeSuppliers = allRows.filter((row) => row.activeContracts > 0 || row.activeServices > 0).length

  return (
    <section className="dashboard-panel report-panel" aria-label="Active suppliers report">
      <div className="resource-heading report-heading">
        <div>
          <p className="kicker">Reports</p>
          <h2>Active suppliers report</h2>
          <p className="report-generated">Generated {formatGeneratedAt(report?.generatedAt)}</p>
        </div>
        <div className="heading-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <button type="button" className="primary-action" disabled={loading} onClick={onRefresh}>
            {loading ? 'Refreshing...' : 'Refresh report'}
          </button>
        </div>
      </div>

      {error && <p className="alert-text">{error}</p>}

      <div className="report-summary-grid" aria-label="Report summary">
        <ReportMetric label="Suppliers" value={allRows.length} />
        <ReportMetric label="With active work" value={activeSuppliers} />
        <ReportMetric label="Active contracts" value={sum(allRows, 'activeContracts')} />
        <ReportMetric label="Active services" value={sum(allRows, 'activeServices')} />
      </div>

      {loading && !report ? (
        <p className="empty-state">Loading report...</p>
      ) : rows.length === 0 ? (
        <p className="empty-state">No suppliers match this report.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table report-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Registration Code</th>
                <th>Active Contracts</th>
                <th>Active Services</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.supplierId}>
                  <td>{row.name}</td>
                  <td>{row.registrationCode}</td>
                  <td>{row.activeContracts}</td>
                  <td>{row.activeServices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function ReportMetric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="report-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
