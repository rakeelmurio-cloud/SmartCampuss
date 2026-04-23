import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import { cancelBooking, getMyBookings } from '../api/bookingApi'
import { removeToken } from '../utils/token'

const statusTone = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  REJECTED: 'bg-red-50 text-red-700 border-red-100',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
}

function MyBookingsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
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
      const data = await getMyBookings()
      setBookings(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load your bookings right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId, { reason: 'Cancelled by user' })
      setNotice('Booking cancelled.')
      await fetchBookings()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to cancel this booking right now.'
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              My Bookings
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Requests and approvals
            </h2>
            <p className="text-sm text-slate-600">
              Track approval status and cancel if plans change.
            </p>
          </div>
          <button
            onClick={() => navigate('/bookings/create')}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            New booking
          </button>
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

        <div className="space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-20 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}

          {!loading && bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              You have no bookings yet.
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
                  <p className="text-sm text-slate-700">{booking.purpose}</p>
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
                  {(booking.status === 'APPROVED' ||
                    booking.status === 'PENDING') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </AppShell>
  )
}

export default MyBookingsPage
