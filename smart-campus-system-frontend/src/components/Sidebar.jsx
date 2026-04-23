import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { label: 'Resources', to: '/resources', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { label: 'Book Resource', to: '/bookings/create', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { label: 'My Bookings', to: '/bookings/my', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { label: 'Create Ticket', to: '/tickets/create', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { label: 'My Tickets', to: '/tickets/my', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
  { label: 'Admin Tickets', to: '/admin/tickets', roles: ['ADMIN'] },
  { label: 'Admin Bookings', to: '/admin/bookings', roles: ['ADMIN'] },
  { label: 'Assigned Tickets', to: '/technician/tickets', roles: ['TECHNICIAN'] },
]

function Sidebar({ user }) {
  const location = useLocation()
  const role = user?.role || 'USER'

  const links = navItems.filter((item) => item.roles.includes(role))

  return (
    <aside className="hidden min-h-full w-[200px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm lg:flex lg:flex-col lg:w-[220px] lg:px-4 lg:py-5">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-sm font-bold uppercase text-white">
            {user?.name?.slice(0, 2) || 'SC'}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Smart Campus
            </p>
            <p className="text-sm font-semibold text-slate-900">Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((item) => {
          const active = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-teal-100 text-teal-900 border border-teal-200'
                  : 'text-slate-700 hover:bg-teal-50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">Role</p>
        <p className="mt-1 rounded-full bg-white px-3 py-1 text-center text-[11px] font-semibold text-slate-700">
          {role}
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
