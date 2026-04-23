import Sidebar from './Sidebar'
import Navbar from './Navbar'

function AppShell({ user, onLogout, onProfileClick, children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col gap-4 px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:flex-row lg:py-8">
        <Sidebar user={user} />
        <main className="flex-1 space-y-4 pb-8 lg:pb-10">
          <Navbar user={user} onLogout={onLogout} onProfileClick={onProfileClick} />
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell
