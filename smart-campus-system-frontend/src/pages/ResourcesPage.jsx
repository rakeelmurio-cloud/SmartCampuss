import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import {
  createResource,
  getResources,
  updateResource,
} from '../api/resourceApi'
import { removeToken } from '../utils/token'

const resourceTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const resourceStatuses = ['ACTIVE', 'OUT_OF_SERVICE']
const days = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

function ResourcesPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: '',
    minCapacity: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 30,
    location: '',
    description: '',
    status: 'ACTIVE',
    availability: [
      { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '18:00' },
    ],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
        await fetchResources()
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    load()
  }, [navigate])

  const fetchResources = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getResources({
        type: filters.type || undefined,
        status: filters.status || undefined,
        location: filters.location || undefined,
        minCapacity: filters.minCapacity || undefined,
      })
      setResources(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load resources right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  // const filteredSummary = useMemo(
  //   () => ({
  //     total: resources.length,
  //     active: resources.filter((r) => r.status === 'ACTIVE').length,
  //     out: resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
  //   }),
  //   [resources]
  // )

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAvailability = () => {
    setForm((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '18:00' },
      ],
    }))
  }

  const handleAvailabilityChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.availability]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, availability: next }
    })
  }

  const handleRemoveAvailability = (index) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, idx) => idx !== index),
    }))
  }

  const handleCreateResource = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await createResource({
        ...form,
        capacity: Number(form.capacity),
        availability: form.availability.map((row) => ({
          dayOfWeek: row.dayOfWeek,
          startTime: row.startTime,
          endTime: row.endTime,
        })),
      })
      setNotice('Resource added to catalogue.')
      setForm({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 30,
        location: '',
        description: '',
        status: 'ACTIVE',
        availability: [
          { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '18:00' },
        ],
      })
      await fetchResources()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to create the resource right now.'
      )
    }
  }

  const handleToggleStatus = async (resource) => {
    try {
      await updateResource(resource.id, {
        status: resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE',
      })
      await fetchResources()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.')
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Facilities Catalogue
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Manage and search resources
            </h2>
            <p className="text-sm text-slate-600">
              Rooms, labs, equipment with availability windows.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              Total {filteredSummary.total}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">
              Active {filteredSummary.active}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">
              Out {filteredSummary.out}
            </span>
          </div>
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

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Search by location
            </label>
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="e.g., Engineering building"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Any</option>
              {resourceTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            >
              <option value="">Any</option>
              {resourceStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Min capacity
            </label>
            <input
              type="number"
              name="minCapacity"
              value={filters.minCapacity}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              min="1"
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              onClick={fetchResources}
              className="flex-1 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
            >
              Apply filters
            </button>
            <button
              onClick={() => {
                setFilters({ type: '', status: '', location: '', minCapacity: '' })
                fetchResources()
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              Reset
            </button>
          </div>
        </div>

        {user.role === 'ADMIN' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Admin
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add or update a resource
                </h3>
              </div>
            </div>
            <form
              onSubmit={handleCreateResource}
              className="mt-4 grid gap-4 md:grid-cols-2"
            >
              <input
                name="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Resource name"
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 md:col-span-2"
              />
              <select
                name="type"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              >
                {resourceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="capacity"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: e.target.value }))
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              />
              <input
                name="location"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Location"
                required
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 md:col-span-2"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Optional description"
                className="h-20 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 md:col-span-2"
              />

              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    Availability windows
                  </p>
                  <button
                    type="button"
                    onClick={handleAddAvailability}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    Add window
                  </button>
                </div>
                <div className="space-y-2">
                  {form.availability.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                    >
                      <select
                        value={row.dayOfWeek}
                        onChange={(e) =>
                          handleAvailabilityChange(idx, 'dayOfWeek', e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      >
                        {days.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange(idx, 'startTime', e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      />
                      <input
                        type="time"
                        value={row.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange(idx, 'endTime', e.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAvailability(idx)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                >
                  {resourceStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
                >
                  Save resource
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}

          {!loading && resources.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No resources found. Adjust filters or add a resource.
            </div>
          )}

          {!loading &&
            resources.map((res) => (
              <div
                key={res.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {res.type}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {res.name}
                    </h3>
                    <p className="text-sm text-slate-500">{res.location}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      res.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">
                  {res.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Capacity {res.capacity}
                  </span>
                  {res.availability.slice(0, 2).map((slot, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-teal-50 px-3 py-1 text-teal-800"
                    >
                      {slot.dayOfWeek} {slot.startTime} - {slot.endTime}
                    </span>
                  ))}
                  {res.availability.length > 2 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      +{res.availability.length - 2} more
                    </span>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      navigate(`/bookings/create?resourceId=${res.id}`)
                    }
                    className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500"
                  >
                    Book
                  </button>
                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => handleToggleStatus(res)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                    >
                      {res.status === 'ACTIVE' ? 'Mark out' : 'Mark active'}
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

export default ResourcesPage
