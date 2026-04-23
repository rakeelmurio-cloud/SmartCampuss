import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createTicket } from '../api/ticketApi'
import { getCurrentUser } from '../api/authApi'
import { removeToken } from '../utils/token'

const categories = ['ELECTRICAL', 'NETWORK', 'FACILITY', 'SOFTWARE', 'OTHER']
const priorities = ['LOW', 'MEDIUM', 'HIGH']

const priorityTone = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-100',
  HIGH: 'bg-red-50 text-red-700 border-red-100',
}

function CreateTicketPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    resource: '',
    category: 'ELECTRICAL',
    description: '',
    priority: 'MEDIUM',
    preferredContact: '',
    attachments: [],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    load()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) {
      setError('You can upload up to 3 images only.')
      return
    }
    setError('')
    setForm((prev) => ({ ...prev, attachments: files }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    if (form.attachments.length > 3) {
      setError('You can upload up to 3 images only.')
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append('resource', form.resource)
      data.append('category', form.category)
      data.append('description', form.description)
      data.append('priority', form.priority)
      data.append('preferredContact', form.preferredContact)
      form.attachments.forEach((file) => data.append('attachments', file))

      await createTicket(data)
      setNotice('Ticket created successfully.')
      setForm({
        resource: '',
        category: 'ELECTRICAL',
        description: '',
        priority: 'MEDIUM',
        preferredContact: '',
        attachments: [],
      })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to create the ticket right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Navbar
          user={user}
          onLogout={onLogout}
          onProfileClick={() => navigate('/dashboard')}
        />

        <div className="mt-8 space-y-6">
          <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

            <div className="flex gap-2">
              <span
                className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${priorityTone[form.priority]}`}
              >
                {form.priority} priority
              </span>
              <button
                onClick={() => navigate('/tickets/my')}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                My Tickets
              </button>
            </div>
          </header>

          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
              {notice}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Resource / Location
              </label>
              <input
                name="resource"
                value={form.resource}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g., Lab 2 - Projector, Library - 2nd floor router"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Briefly describe the issue and any steps already taken."
              />
            </div>

            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred Contact
                </label>
                <input
                  name="preferredContact"
                  value={form.preferredContact}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="Email or phone number"
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Submission tips</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Share the best number/email to reach you.</li>
                  <li>Attach photos only if they help identify the issue.</li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attach Images (max 3)
              </label>
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Image files only. Up to three attachments.
                </p>
                {form.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    {form.attachments.map((file) => (
                      <span
                        key={file.name + file.size}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                Cancel
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateTicketPage
