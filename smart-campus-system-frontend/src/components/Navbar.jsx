import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi'

function Navbar({ user, onLogout, onProfileClick }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    refreshNotifications()
  }, [])

  const refreshNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Unable to load notifications right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-600 text-sm font-bold uppercase text-white">
            {user?.name?.slice(0, 2) || 'SC'}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Smart Campus
            </p>
            <h1 className="text-xl font-semibold text-slate-900">Operations</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            Overview
          </Link>
          <button
            onClick={onProfileClick}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            Profile
          </button>
          <button
            onClick={() => {
              setOpen((p) => !p)
              if (!open) {
                refreshNotifications()
              }
            }}
            className="relative rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
            {user?.role || 'USER'}
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
          >
            Logout
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute right-4 top-16 z-20 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500">
                Booking approvals, ticket updates, comments
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleMarkAll}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                Mark all read
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 pb-2 text-xs text-red-600">{error}</div>
          )}

          <div className="max-h-80 space-y-1 overflow-y-auto px-2 pb-3">
            {loading && (
              <div className="px-3 py-2 text-sm text-slate-500">
                Loading notifications...
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-500">
                No notifications yet.
              </div>
            )}
            {notifications.map((note) => (
              <div
                key={note.id}
                className={`flex flex-col gap-1 rounded-xl px-3 py-2 ${
                  note.read ? 'bg-white' : 'bg-teal-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{note.title}</p>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    {note.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{note.message}</p>
                <div className="flex items-center gap-2">
                  {!note.read && (
                    <button
                      onClick={() => handleMarkRead(note.id)}
                      className="text-xs font-semibold text-teal-700"
                    >
                      Mark read
                    </button>
                  )}
                  <span className="text-xs text-slate-400">
                    {note.createdAt?.replace('T', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
