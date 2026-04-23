import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import SectionCard from '../components/SectionCard'
import {
  createManagedUser,
  getAllUsers,
  getCurrentUser,
  submitAccessRequest,
  updateApprovalStatus,
  updateCurrentUserProfile,
  updateUserRole,
  updateUserStatus,
} from '../api/authApi'
import { removeToken } from '../utils/token'

function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [error, setError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    department: '',
    requestedUserType: '',
  })
  const [managedUserForm, setManagedUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
    phoneNumber: '',
    department: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setProfileForm({
          name: currentUser.name || '',
          phoneNumber: currentUser.phoneNumber || '',
          department: currentUser.department || '',
          requestedUserType: currentUser.requestedUserType || '',
        })

        if (currentUser.role === 'ADMIN') {
          setAdminLoading(true)
          const allUsers = await getAllUsers()
          setUsers(allUsers)
        }
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }

        setError(
          err?.response?.data?.message ||
            'Unable to load your dashboard right now.'
        )
      } finally {
        setLoading(false)
        setAdminLoading(false)
      }
    }

    load()
  }, [navigate])

  const isCommonUser = user?.role === 'USER' && !user?.userType
  const hasAcademicAccess = user?.role === 'USER' && Boolean(user?.userType)
  const hasPendingAcademicRequest = Boolean(user?.requestedUserType)

  const summaryCards = useMemo(
    () => [
      { label: 'Role', value: user?.role || 'USER' },
      { label: 'Approval', value: user?.approvalStatus || 'APPROVED' },
      {
        label: 'Access',
        value: user?.role !== 'USER' ? user?.role : user?.userType || 'COMMON',
      },
    ],
    [user]
  )

  const handleLogout = () => {
    removeToken()
    window.location.href = '/'
  }

  const refreshUsers = async () => {
    if (user?.role !== 'ADMIN') {
      return
    }

    setAdminLoading(true)
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target
    setProfileMessage({ type: '', text: '' })
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber,
        department: profileForm.department,
        requestedUserType: profileForm.requestedUserType || null,
      })

      setUser(updatedUser)
      setProfileForm({
        name: updatedUser.name || '',
        phoneNumber: updatedUser.phoneNumber || '',
        department: updatedUser.department || '',
        requestedUserType: updatedUser.requestedUserType || '',
      })
      setProfileMessage({
        type: 'success',
        text:
          updatedUser.requestedUserType
            ? 'Profile saved. Your student or lecturer request is waiting for admin approval.'
            : 'Profile details updated successfully.',
      })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Unable to update your profile right now.',
      })
    }
  }

  const handleQuickTypeRequest = async (requestedUserType) => {
    setProfileMessage({ type: '', text: '' })

    try {
      const updatedUser = await submitAccessRequest({ requestedUserType })
      setUser(updatedUser)
      setProfileForm((prev) => ({
        ...prev,
        requestedUserType: updatedUser.requestedUserType || '',
      }))
      setProfileMessage({
        type: 'success',
        text: 'Your request was sent to the admin for approval.',
      })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Unable to submit your request right now.',
      })
    }
  }

  const handleManagedUserChange = (e) => {
    const { name, value } = e.target
    setManagedUserForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateManagedUser = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminNotice('')

    try {
      await createManagedUser({
        ...managedUserForm,
        phoneNumber: managedUserForm.phoneNumber || null,
        department: managedUserForm.department || null,
      })
      await refreshUsers()
      setManagedUserForm({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        phoneNumber: '',
        department: '',
      })
      setAdminNotice('Managed account created successfully.')
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to create the managed account.'
      )
    }
  }

  const handleApprovalUpdate = async (targetUserId, approvalStatus) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateApprovalStatus(targetUserId, { approvalStatus })
      await refreshUsers()
      setAdminNotice(`User marked as ${approvalStatus.toLowerCase()}.`)
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Unable to update the approval status.'
      )
    }
  }

  const handleAcademicApproval = async (targetUserId, userType) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateUserRole(targetUserId, { role: 'USER', userType })
      await refreshUsers()
      setAdminNotice(`${userType} access approved successfully.`)
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Unable to approve this academic access request.'
      )
    }
  }

  const handleStatusToggle = async (targetUserId, isActive) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateUserStatus(targetUserId, { isActive: !isActive })
      await refreshUsers()
      setAdminNotice(
        isActive ? 'User account deactivated.' : 'User account activated.'
      )
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to update the user status.'
      )
    }
  }

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      onProfileClick={() => setShowProfile((prev) => !prev)}
    >
      {/* Error Display */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Account Summary Section */}
        <SectionCard
          title={loading ? "" : "Account summary"}
          action={!loading && (
            <button
              onClick={() => setShowProfile((prev) => !prev)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              {showProfile ? 'Hide profile' : 'Edit profile'}
            </button>
          )}
        >
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                <div className="h-24 bg-slate-200 rounded-xl"></div>
                <div className="h-24 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Account Information</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{user?.email}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 p-2">
                    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Access Level</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {user?.role !== 'USER' ? user?.role : user?.userType || 'COMMON'}
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 p-2">
                    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Role Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{user?.role}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 p-2">
                    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Approval Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{user?.approvalStatus || 'APPROVED'}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 p-2">
                    <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Profile Edit Section */}
        {showProfile && (
          <div className="xl:col-span-2">
            <SectionCard title="Edit your details">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-12 bg-slate-200 rounded-lg"></div>
                  <div className="h-12 bg-slate-200 rounded-lg"></div>
                  <div className="h-12 bg-slate-200 rounded-lg sm:col-span-2"></div>
                </div>
                <div className="h-12 bg-slate-200 rounded-lg"></div>
                <div className="flex gap-3">
                  <div className="h-12 bg-slate-200 rounded-lg flex-1"></div>
                  <div className="h-12 bg-slate-200 rounded-lg flex-1"></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileFieldChange}
                  placeholder="Full name"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 sm:col-span-2 lg:col-span-1"
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={handleProfileFieldChange}
                  placeholder="Phone number"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 sm:col-span-2 lg:col-span-1"
                />
                <input
                  type="text"
                  name="department"
                  value={profileForm.department}
                  onChange={handleProfileFieldChange}
                  placeholder="Department"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 sm:col-span-2"
                />

                {user?.role === 'USER' && (
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Request student or lecturer access
                    </label>
                    <select
                      name="requestedUserType"
                      value={profileForm.requestedUserType}
                      onChange={handleProfileFieldChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    >
                      <option value="">Keep current access</option>
                      <option value="STUDENT">Student</option>
                      <option value="LECTURER">Lecturer</option>
                    </select>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Any student or lecturer request needs admin approval.
                    </p>
                  </div>
                )}

                {profileMessage.text && (
                  <div
                    className={`rounded-lg px-4 py-3 text-sm sm:col-span-2 ${
                      profileMessage.type === 'error'
                        ? 'border border-red-200 bg-red-50 text-red-700'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
                  >
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfile(false)}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </SectionCard>
          </div>
        )}

        {/* Common User Access Section */}
        {isCommonUser && !showProfile && (
          <div className="xl:col-span-2">
            <section className="rounded-2xl bg-white/95 p-4 sm:p-6 lg:p-8 shadow-[0_30px_80px_rgba(15,23,42,0.1)]">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="flex gap-3">
                  <div className="h-10 bg-slate-200 rounded-full w-32"></div>
                  <div className="h-10 bg-slate-200 rounded-full w-32"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-400">
                  Common Access
                </p>
                <h3 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl leading-none text-slate-900">
                  You are using common access
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Google users start here. If you need academic access, open Profile
                  from the top-right menu and request student or lecturer approval.
                </p>

                {hasPendingAcademicRequest && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    Your current request is waiting for admin approval:{' '}
                    <span className="font-semibold">{user?.requestedUserType}</span>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    onClick={() => handleQuickTypeRequest('STUDENT')}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    Request Student Access
                  </button>
                  <button
                    onClick={() => handleQuickTypeRequest('LECTURER')}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    Request Lecturer Access
                  </button>
                </div>
              </>
            )}
          </section>
          </div>
        )}

        {/* Admin Section */}
        {user?.role === 'ADMIN' && (
          <div className="xl:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Admin Controls
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">User Management</h3>
                <p className="text-sm text-slate-600">
                  Approve student/lecturer requests and create managed admin or technician accounts.
                </p>
              </div>
              {adminLoading && (
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Refreshing users...
                </div>
              )}
            </div>

            {adminError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {adminError}
              </div>
            )}

            {adminNotice && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {adminNotice}
              </div>
            )}

            <form
              onSubmit={handleCreateManagedUser}
              className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
            >
              <input
                type="text"
                name="name"
                value={managedUserForm.name}
                onChange={handleManagedUserChange}
                placeholder="Name"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="email"
                name="email"
                value={managedUserForm.email}
                onChange={handleManagedUserChange}
                placeholder="Email"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="password"
                name="password"
                value={managedUserForm.password}
                onChange={handleManagedUserChange}
                placeholder="Temporary password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
                required
              />
              <input
                type="text"
                name="department"
                value={managedUserForm.department}
                onChange={handleManagedUserChange}
                placeholder="Department (optional)"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              />
              <select
                name="role"
                value={managedUserForm.role}
                onChange={handleManagedUserChange}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0f6e73] focus:ring-4 focus:ring-teal-100"
              >
                <option value="TECHNICIAN">Technician</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                type="submit"
                className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500"
              >
                Create
              </button>
            </form>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
              <div className="min-w-[800px] lg:min-w-[1000px] xl:min-w-[1180px]">
                <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1.2fr] gap-3 sm:gap-4 bg-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <span>User</span>
                  <span>Details</span>
                  <span>Role</span>
                  <span>Approval</span>
                  <span>Request</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {users.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1.2fr] gap-3 sm:gap-4 px-4 py-4 text-sm text-slate-600"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {entry.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {entry.authProvider}
                        </p>
                      </div>

                      <div>
                        <p>{entry.email}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {entry.role === 'USER'
                            ? entry.userType || 'Common User'
                            : 'Managed account'}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {entry.role}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                            entry.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : entry.approvalStatus === 'PENDING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {entry.approvalStatus}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-slate-500">
                        {entry.requestedUserType || 'No request'}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.requestedUserType && (
                          <button
                            onClick={() =>
                              handleAcademicApproval(
                                entry.id,
                                entry.requestedUserType
                              )
                            }
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                          >
                            Approve {entry.requestedUserType}
                          </button>
                        )}

                        {entry.approvalStatus === 'PENDING' &&
                          entry.role === 'USER' &&
                          entry.userType &&
                          !entry.requestedUserType && (
                            <button
                              onClick={() =>
                                handleApprovalUpdate(entry.id, 'APPROVED')
                              }
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
                            >
                              Approve
                            </button>
                          )}

                        <button
                          onClick={() => handleApprovalUpdate(entry.id, 'REJECTED')}
                          className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleStatusToggle(entry.id, entry.isActive)}
                          className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-500"
                        >
                          {entry.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default DashboardPage
