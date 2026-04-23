function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Branding Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
            <span className="text-2xl font-bold">SC</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Smart Campus</h1>
          <p className="mt-2 text-sm text-slate-600">Operations Portal</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
