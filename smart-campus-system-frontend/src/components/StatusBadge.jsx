function StatusBadge({ status, kind = 'status' }) {
  const palettes = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-100',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-100',
    HIGH: 'bg-red-50 text-red-700 border-red-100',
  }

  const tone = palettes[status] || 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone}`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
