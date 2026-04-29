import { useMemo, useState } from 'react'
import './App.css'
import { DataTable } from './components/DataTable'
import { DataModel } from './models/dataModel'
import {
  buildTableData,
  formatCellValue,
} from './utils/modelUtils'

function App() {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tableData = useMemo(
    () => buildTableData(DataModel, response),
    [response],
  )

  const fetchDataAs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(DataModel.path)
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      setResponse(data)
    } catch (err) {
      const details =
        err instanceof Error
          ? err.message
          : 'Unknown error while loading data.'
      setError(
        err instanceof TypeError
          ? `Cannot reach API getData.`
          : details,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1 className="eyebrow">PSK projektas</h1>
      </header>

      <section className="panel">
        <div className="result-box" role="tabpanel">
          <div className="result-meta">
            <span>Rows: {tableData.rowCount}</span>
            <button
              type="button"
              className="fetch-button"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? 'Fetching...' : 'Fetch data'}
            </button>
          </div>

          {loading && <p>Loading data...</p>}

          {!loading && error && <p className="error-text">{error}</p>}

          {!loading && !error && tableData.rowCount > 0 && (
            <DataTable
              tableData={tableData}
              formatCellValue={formatCellValue}
              rowKeyPrefix="data-row"
            />
          )}

          {!loading && !error && tableData.rowCount === 0 && <p>No data loaded yet.</p>}
        </div>
      </section>
    </main>
  )
}

export default App
