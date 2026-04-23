import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  assignTechnician,
  getAllTickets,
  rejectTicket,
  resolveTicket,
  updateTicketStatus,
} from '../api/ticketApi'
import { getAllUsers, getCurrentUser } from '../api/authApi'
import { removeToken } from '../utils/token'

const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']
const priorities = ['LOW', 'MEDIUM', 'HIGH']
const categories = ['ELECTRICAL', 'NETWORK', 'FACILITY', 'SOFTWARE', 'OTHER']

function AdminTicketsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [actionState, setActionState] = useState({})

  const loadTickets = async (params = {}) => {
    const query = {}
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query[key] = value
      }
    })
    setLoading(true)
    setError('')
    try {
      const data = await getAllTickets(query)
      setTickets(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const current = await getCurrentUser()
        if (current.role !== 'ADMIN') {
          navigate('/dashboard', { replace: true })
          return
        }
        setUser(current)

        const users = await getAllUsers()
        setTechnicians(users.filter((u) => u.role === 'TECHNICIAN'))
        await loadTickets()
      } catch (err) {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    loadTickets(filters)
  }

  const handleAssign = async (ticketId, technicianId) => {
    if (!technicianId) return
    setActionState((prev) => ({ ...prev, [ticketId]: 'assigning' }))
    try {
      await assignTechnician(ticketId, { technicianId })
      await loadTickets(filters)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to assign technician.')
    } finally {
      setActionState((prev) => ({ ...prev, [ticketId]: '' }))
    }
  }

  const handleStatus = async (ticketId, status) => {
    setActionState((prev) => ({ ...prev, [ticketId]: 'status' }))
    try {
      await updateTicketStatus(ticketId, { status })
      await loadTickets(filters)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.')
    } finally {
      setActionState((prev) => ({ ...prev, [ticketId]: '' }))
    }
  }

  const handleResolve = async (ticketId, notes) => {
    if (!notes.trim()) return
    setActionState((prev) => ({ ...prev, [ticketId]: 'resolve' }))
    try {
      await resolveTicket(ticketId, { resolutionNotes: notes })
      await loadTickets(filters)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to resolve ticket.')
    } finally {
      setActionState((prev) => ({ ...prev, [ticketId]: '' }))
    }
  }

  const handleReject = async (ticketId, reason) => {
    if (!reason.trim()) return
    setActionState((prev) => ({ ...prev, [ticketId]: 'reject' }))
    try {
      await rejectTicket(ticketId, { rejectionReason: reason })
      await loadTickets(filters)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to reject ticket.')
    } finally {
      setActionState((prev) => ({ ...prev, [ticketId]: '' }))
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Navbar
          user={user}
          onLogout={onLogout}
          onProfileClick={() => navigate('/dashboard')}
        />

        <div className="mt-8 rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
 
            <div className="flex gap-2">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="">Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="">Priority</option>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={applyFilters}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Apply
              </button>
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
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
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{ticket.resource}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                    <p className="mt-2 text-xs text-slate-500">Created by {ticket.createdBy}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      View
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Assign Technician
                    </p>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          handleAssign(ticket.id, e.target.value)
                        }
                        defaultValue=""
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select technician</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name || t.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Update Status
                    </p>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          handleStatus(ticket.id, e.target.value)
                        }
                        defaultValue=""
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">Select status</option>
                        {['OPEN', 'IN_PROGRESS', 'CLOSED'].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Resolve / Reject
                    </p>
                    <textarea
                      placeholder="Resolution notes or rejection reason"
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      onChange={(e) =>
                        setActionState((prev) => ({
                          ...prev,
                          [`notes-${ticket.id}`]: e.target.value,
                        }))
                      }
                      value={actionState[`notes-${ticket.id}`] || ''}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleResolve(
                            ticket.id,
                            actionState[`notes-${ticket.id}`] || ''
                          )
                        }
                        className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() =>
                          handleReject(
                            ticket.id,
                            actionState[`notes-${ticket.id}`] || ''
                          )
                        }
                        className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Reject
                      </button>
                    </div>
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

export default AdminTicketsPage
