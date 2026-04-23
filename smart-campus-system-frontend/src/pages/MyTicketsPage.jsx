import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getMyTickets } from '../api/ticketApi'
import { getCurrentUser } from '../api/authApi'
import { removeToken } from '../utils/token'

function MyTicketsPage() {
  const statusStyle = (status) => {
    const map = {
      OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
      IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
      RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-100',
    }
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const priorityStyle = (priority) => {
    const map = {
      LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-100',
      HIGH: 'bg-red-50 text-red-700 border-red-100',
    }
    return map[priority] || 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const current = await getCurrentUser()
        setUser(current)
        const data = await getMyTickets()
        setTickets(data)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }
        setError(
          err?.response?.data?.message || 'Unable to load your tickets now.'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
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
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Module C · My Queue
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">My Incident Tickets</h2>
              <p className="text-sm text-slate-500">
                Track issues you opened. Status updates appear here first.
              </p>
            </div>
            <button
              onClick={() => navigate('/tickets/create')}
              className="rounded-full bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,94,99,0.22)] transition hover:brightness-105"
            >
              New Ticket
            </button>
          </div>

          {loading && <p className="text-slate-600">Loading tickets...</p>}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && tickets.length === 0 && (
            <p className="text-slate-600">You have no tickets yet.</p>
          )}

          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle(ticket.status)}`}
                      >
                        {ticket.status}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priorityStyle(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {ticket.category}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                      {ticket.resource}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                    >
                      View
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

export default MyTicketsPage
