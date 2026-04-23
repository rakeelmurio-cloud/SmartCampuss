function StatCard({ label, value, helper, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-slate-50 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  }

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${toneClasses[tone] || toneClasses.default}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-600">{helper}</p>}
    </div>
  )
}

export default StatCard
