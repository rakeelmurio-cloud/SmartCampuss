import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { setToken } from '../utils/token'

function OAuthSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const token = params.get('token')
  const profileCompleted = params.get('profileCompleted')

  useEffect(() => {
    if (token) {
      setToken(token)
      const destination =
        profileCompleted === 'true' ? '/dashboard' : '/dashboard?setup=pending'
      const timeout = window.setTimeout(() => navigate(destination, { replace: true }), 1200)
      return () => window.clearTimeout(timeout)
    }

    const timeout = window.setTimeout(() => navigate('/', { replace: true }), 1600)
    return () => window.clearTimeout(timeout)
  }, [navigate, profileCompleted, token])

  return (
    <AuthLayout
      title="Completing Sign-In"
      subtitle="We are securing your Google session and preparing your campus workspace."
      sideTitle="Google access connected successfully."
      sideText="Your account is being synchronized with campus identity services so you can continue into the dashboard."
    >
      <div className="space-y-4">
        <div className="rounded-[26px] bg-[linear-gradient(135deg,#0b5e63,#113d41)] p-6 text-white shadow-[0_20px_35px_rgba(15,94,99,0.28)]">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            OAuth Success
          </p>
          <p className="mt-3 font-serif text-3xl">
            {token ? 'Redirecting to your dashboard...' : 'Finalizing session...'}
          </p>
          <p className="mt-3 text-sm leading-6 text-white/78">
            {profileCompleted === 'true'
              ? 'Your profile is complete and ready to use.'
              : 'Your token is ready. Profile completion can continue after sign-in.'}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
          {token
            ? 'Please wait while we store your token and open the protected dashboard.'
            : 'We could not find a token in the redirect URL, so we are sending you back to login.'}
        </div>
      </div>
    </AuthLayout>
  )
}

export default OAuthSuccessPage
