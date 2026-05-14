import { useEffect, useState, useCallback } from 'react'
import apiClient from '../../shared/services/apiClient'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await apiClient.get(`/admin/audit-logs?page=${p}&limit=50`)
      setLogs(res?.data || [])
      setPagination(res?.pagination || null)
      setPage(p)
    } catch (e) {
      setError(e?.error || e?.message || 'Failed to load audit logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1) }, [load])

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500 py-8">Loading…</p>
      ) : (
        <>
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Admin', 'Action', 'Details', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{log.admin || '—'}</td>
                    <td className="px-4 py-3 text-gray-800">{log.action}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-md truncate">{log.details || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{log.date ? new Date(log.date).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Page {pagination.page} of {pagination.pages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => load(page + 1)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
