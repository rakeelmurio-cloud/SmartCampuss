import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { registerUser } from '../api/authApi'
import { setToken } from '../utils/token'

function getRegisterErrorMessage(err) {
  const validationMessages = err?.response?.data?.messages

  if (validationMessages && typeof validationMessages === 'object') {
    return Object.values(validationMessages).join(' ')
  }

  return (
    err?.response?.data?.message ||
    'Registration failed. Please review your details and try again.'
  )
}

function RegisterPage() {
  const navigate = useNavigate()
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      registrationType: 'STUDENT',
      phoneNumber: '',
      department: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        department: formData.department.trim(),
      }

      const data = await registerUser(payload)

      if (data.token) {
        setToken(data.token)
        navigate('/dashboard')
        return
      }

      navigate('/', {
        replace: true,
        state: {
          notice:
            data.approvalStatus === 'PENDING'
              ? 'Registration submitted. Your account is waiting for admin approval.'
              : 'Account created successfully. You can log in now.',
          },
      })
    } catch (err) {
      setError(getRegisterErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Set up your campus access profile for bookings, support, and notifications."
      sideTitle="Create a trusted smart campus identity."
      sideText="Register once, then move between local sign-in, Google access, protected dashboards, and role-based campus services."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@university.edu"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-slate-700">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
          <div>
            <label htmlFor="department" className="mb-2 block text-sm font-semibold text-slate-700">
              Department
            </label>
            <input
              id="department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Computer Science"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="registrationType" className="mb-2 block text-sm font-semibold text-slate-700">
            Account Type
          </label>
          <select
            id="registrationType"
            name="registrationType"
            value={formData.registrationType}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
          </select>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Student and lecturer accounts require admin approval. Common access is available through Google sign-in.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal-600 py-3.5 font-semibold text-white shadow-lg transition hover:bg-teal-500 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200"></div>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-slate-200"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-600">
          G
        </span>
        Continue with Google
      </button>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
