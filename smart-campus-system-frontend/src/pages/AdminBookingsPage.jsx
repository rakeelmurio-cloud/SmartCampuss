import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import {
  getAllBookings,
  updateBookingStatus,
} from '../api/bookingApi'
import { getResources } from '../api/resourceApi'
import { removeToken } from '../utils/token'

const statusTone = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
}

function AdminBookingsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState({ status: '', resourceId: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        if (current.role !== 'ADMIN') {
          navigate('/dashboard', { replace: true })
          return
        }
        setUser(current)
        const res = await getResources()
        setResources(res)
        await fetchBookings()
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    load()
  }, [navigate])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAllBookings({
        status: filters.status || undefined,
        resourceId: filters.resourceId || undefined,
      })
      setBookings(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load bookings right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    try {
      await updateBookingStatus(bookingId, { status: 'APPROVED' })
      setNotice('Booking approved.')
      await fetchBookings()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to approve this booking right now.'
      )
    }
  }

  const handleReject = async (bookingId) => {
    const reason = window.prompt('Enter rejection reason', 'Not available')
    if (reason === null) return
    try {
      await updateBookingStatus(bookingId, { status: 'REJECTED', reason })
      setNotice('Booking rejected.')
      await fetchBookings()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to reject this booking right now.'
      )
    }
  }

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  if (!user) return null

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onProfileClick={() => navigate('/dashboard')}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Booking approvals
          </h2>
          <p className="text-sm text-slate-600">
            Approve, reject, and monitor conflicts.
          </p>
        </div>

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
          <select
            name="status"
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">Any status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            name="resourceId"
            value={filters.resourceId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, resourceId: e.target.value }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">Any resource</option>
            {resources.map((res) => (
              <option key={res.id} value={res.id}>
                {res.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={fetchBookings}
              className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setFilters({ status: '', resourceId: '' })
                fetchBookings()
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-20 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}

          {!loading && bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              No bookings match the filters.
            </div>
          )}

          {!loading &&
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>{booking.resourceName || 'Resource'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{booking.resourceLocation || 'Location'}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {booking.startDateTime?.replace('T', ' ')} →{' '}
                    {booking.endDateTime?.replace('T', ' ')}
                  </p>
                  <p className="text-sm text-slate-700">
                    {booking.purpose} — Requested by {booking.userId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusTone[booking.status] ||
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(booking.id)}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </AppShell>
  )
}

export default AdminBookingsPage
