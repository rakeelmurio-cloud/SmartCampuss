import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  getAssignedTickets,
  resolveTicket,
  updateTicketStatus,
} from '../api/ticketApi'
import { getCurrentUser } from '../api/authApi'
import { removeToken } from '../utils/token'

function TechnicianTicketsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState({})

  const loadTickets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAssignedTickets()
      setTickets(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load assigned tickets at the moment.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const current = await getCurrentUser()
        if (current.role !== 'TECHNICIAN') {
          navigate('/dashboard', { replace: true })
          return
        }
        setUser(current)
        await loadTickets()
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    init()
  }, [navigate])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const handleStatus = async (ticketId, status) => {
    try {
      await updateTicketStatus(ticketId, { status })
      await loadTickets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.')
    }
  }

  const handleResolve = async (ticketId) => {
    const note = notes[ticketId] || ''
    if (!note.trim()) return
    try {
      await resolveTicket(ticketId, { resolutionNotes: note })
      await loadTickets()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resolve ticket.')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Navbar
          user={user}
          onLogout={onLogout}
          onProfileClick={() => navigate('/dashboard')}
        />

        <div className="mt-8 rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Module C · Technician
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">Assigned Tickets</h2>
              <p className="text-sm text-slate-500">
                Move tickets forward: update status or add clear resolution notes.
              </p>
            </div>
          </div>

          {loading && <p className="text-slate-600">Loading tickets...</p>}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-800">
                        {ticket.status}
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-700">
                        {ticket.priority}
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-700">
                        {ticket.category}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {ticket.resource}
                    </h3>
                    <p className="text-sm text-slate-600">{ticket.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
                      {ticket.status}
                    </span>
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Details
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Update Status
                    </p>
                    <select
                      onChange={(e) => handleStatus(ticket.id, e.target.value)}
                      defaultValue=""
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Choose status</option>
                      {['IN_PROGRESS', 'CLOSED'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Resolution Notes
                    </p>
                    <textarea
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      placeholder="Add resolution notes"
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [ticket.id]: e.target.value,
                        }))
                      }
                      value={notes[ticket.id] || ''}
                    />
                    <button
                      onClick={() => handleResolve(ticket.id)}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicianTicketsPage
