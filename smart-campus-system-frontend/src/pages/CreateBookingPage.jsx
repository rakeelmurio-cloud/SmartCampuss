import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import { getResources } from '../api/resourceApi'
import { createBooking } from '../api/bookingApi'
import { removeToken } from '../utils/token'

function CreateBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    resourceId: '',
    startDateTime: '',
    endDateTime: '',
    purpose: '',
    expectedAttendees: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
        const res = await getResources({ status: 'ACTIVE' })
        setResources(res)

        const preselected = searchParams.get('resourceId')
        if (preselected) {
          setForm((prev) => ({ ...prev, resourceId: preselected }))
        }
      } catch {
        removeToken()
        navigate('/', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate, searchParams])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!form.resourceId) {
      setError('Select a resource to book.')
      return
    }

  //   try {
  //     await createBooking({
  //       ...form,
  //       expectedAttendees: form.expectedAttendees
  //         ? Number(form.expectedAttendees)
  //         : null,
  //     })
  //     setNotice('Booking request submitted. Awaiting approval.')
  //     setForm({
  //       resourceId: form.resourceId,
  //       startDateTime: '',
  //       endDateTime: '',
  //       purpose: '',
  //       expectedAttendees: '',
  //     })
  //   } catch (err) {
  //     setError(
  //       err?.response?.data?.message ||
  //         'Unable to submit the booking right now.'
  //     )
  //   }
  // }

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
            Booking
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Request a resource booking
          </h2>
          <p className="text-sm text-slate-600">
            Pick a room, lab, meeting space, or equipment with start/end times.
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

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Resource
            </label>
            <select
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Select a resource</option>
              {resources.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.name} — {res.location} ({res.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Start
            </label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={form.startDateTime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              End
            </label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={form.endDateTime}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Purpose
            </label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              className="h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              placeholder="e.g., Team meeting, lab session, equipment setup"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Expected attendees
            </label>
            <input
              type="number"
              name="expectedAttendees"
              min="1"
              value={form.expectedAttendees}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              placeholder="Optional"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Submit booking
            </button>
            <button
              type="button"
              onClick={() => navigate('/bookings/my')}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              View my bookings
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}

export default CreateBookingPage
