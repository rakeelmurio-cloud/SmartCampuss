import { Link } from 'react-router-dom'

function Navbar({ user, onLogout, onProfileClick }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
    </header>
  )
}

export default Navbar
