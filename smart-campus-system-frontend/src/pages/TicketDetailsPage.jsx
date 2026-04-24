import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  addComment,
  deleteComment,
  getTicket,
  updateComment,
} from '../api/ticketApi'
import { getCurrentUser } from '../api/authApi'
import { getToken, removeToken } from '../utils/token'

function TicketDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [editText, setEditText] = useState('')
  const [attachmentUrls, setAttachmentUrls] = useState({})

  const loadTicket = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTicket(id)
      setTicket(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Ticket not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
        await loadTicket()
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }
        setError(err?.response?.data?.message || 'Unable to load ticket.')
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate])

  // Fetch attachments with auth header so images load from secured endpoint
  useEffect(() => {
    if (!ticket?.attachments || ticket.attachments.length === 0) {
      setAttachmentUrls({})
      return
    }

    const abortController = new AbortController()
    const previousUrls = attachmentUrls

    const loadAttachments = async () => {
      const token = getToken()
      const urlMap = {}

      await Promise.all(
        ticket.attachments.map(async (att) => {
          try {
            const res = await fetch(
              `/api/v1/tickets/${ticket.id}/attachments/${att.storedName}`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                signal: abortController.signal,
              }
            )
            if (!res.ok) return
            const blob = await res.blob()
            urlMap[att.storedName] = URL.createObjectURL(blob)
          } catch (err) {
            // ignore fetch errors; UI will show fallback text
          }
        })
      )

      setAttachmentUrls(urlMap)
    }

    loadAttachments()

    return () => {
      abortController.abort()
      Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id, ticket?.attachments])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSavingComment(true)
    try {
      await addComment(id, { comment: commentText.trim() })
      setCommentText('')
      await loadTicket()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to add comment right now. Please try again.'
      )
    } finally {
      setSavingComment(false)
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditText(comment.comment)
  }

  const handleUpdateComment = async (e) => {
    e.preventDefault()
    if (!editingId) return
    try {
      await updateComment(id, editingId, { comment: editText.trim() })
      setEditingId('')
      setEditText('')
      await loadTicket()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update comment.')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId)
      await loadTicket()
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete comment.')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Navbar
          user={user}
          onLogout={onLogout}
          onProfileClick={() => navigate('/dashboard')}
        />

        <div className="mt-8 rounded-3xl border border-slate-100 bg-white/95 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </button>
            {ticket && (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-800">
                  {ticket.status}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
                  {ticket.priority}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700">
                  {ticket.category}
                </span>
              </div>
            )}
          </div>
          {loading && <p className="text-slate-600">Loading ticket...</p>}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {ticket && (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-slate-900">{ticket.resource}</h2>
                <p className="text-sm text-slate-600">{ticket.description}</p>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Preferred Contact
                  </p>
                  <p className="font-semibold">{ticket.preferredContact}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Assigned Technician
                  </p>
                  <p className="font-semibold">
                    {ticket.assignedTechnicianId || 'Not assigned'}
                  </p>
                </div>
                {ticket.resolutionNotes && (
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Resolution Notes
                    </p>
                    <p className="rounded-xl bg-slate-50 px-4 py-3">
                      {ticket.resolutionNotes}
                    </p>
                  </div>
                )}
                {ticket.rejectionReason && (
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Rejection Reason
                    </p>
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
                      {ticket.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {ticket.attachments?.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Attachments
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {ticket.attachments.map((att) => (
                      <div
                        key={att.storedName}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                      >
                        {attachmentUrls[att.storedName] ? (
                          <img
                            src={attachmentUrls[att.storedName]}
                            alt={att.originalName}
                            className="h-40 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center bg-white text-xs text-slate-500">
                            Unable to load image
                          </div>
                        )}
                        <p className="px-3 py-2 text-xs text-slate-600">{att.originalName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
                </div>

                <form
                  onSubmit={editingId ? handleUpdateComment : handleAddComment}
                  className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <textarea
                    value={editingId ? editText : commentText}
                    onChange={(e) =>
                      editingId
                        ? setEditText(e.target.value)
                        : setCommentText(e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                    placeholder="Add a comment..."
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingComment}
                      className="rounded-full bg-[linear-gradient(135deg,#0b5e63,#113d41)] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,94,99,0.22)] transition hover:brightness-105 disabled:opacity-60"
                    >
                      {editingId
                        ? savingComment
                          ? 'Saving...'
                          : 'Update Comment'
                        : savingComment
                        ? 'Posting...'
                        : 'Post Comment'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId('')
                          setEditText('')
                        }}
                        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="space-y-3">
                  {ticket.comments?.length === 0 && (
                    <p className="text-sm text-slate-600">No comments yet. Start the discussion.</p>
                  )}
                  {ticket.comments?.map((c) => {
                    const isOwner = c.userId === user.userId
                    const canDelete = isOwner || user.role === 'ADMIN'
                    return (
                      <div
                        key={c.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {c.userId}
                          </div>
                          <div className="flex gap-2 text-xs">
                            {isOwner && (
                              <button
                                onClick={() => startEdit(c)}
                                className="text-[#0f6e73]"
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-red-600"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 leading-relaxed text-slate-800">
                          {c.comment}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketDetailsPage
