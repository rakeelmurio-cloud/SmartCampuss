import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import LandingPage from '../pages/LandingPage'
import OAuthSuccessPage from '../pages/OAuthSuccessPage'
import DashboardPage from '../pages/DashboardPage'
import CreateTicketPage from '../pages/CreateTicketPage'
import MyTicketsPage from '../pages/MyTicketsPage'
import TicketDetailsPage from '../pages/TicketDetailsPage'
import AdminTicketsPage from '../pages/AdminTicketsPage'
import TechnicianTicketsPage from '../pages/TechnicianTicketsPage'
import ResourcesPage from '../pages/ResourcesPage'
import CreateBookingPage from '../pages/CreateBookingPage'
import MyBookingsPage from '../pages/MyBookingsPage'
import AdminBookingsPage from '../pages/AdminBookingsPage'
import { getToken, hasToken } from '../utils/token'

function ProtectedRoute({ children }) {
  const token = getToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function GuestRoute({ children }) {
  if (hasToken()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route path="/oauth-success" element={<OAuthSuccessPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/create"
        element={
          <ProtectedRoute>
            <CreateBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/my"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/create"
        element={
          <ProtectedRoute>
            <CreateTicketPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/my"
        element={
          <ProtectedRoute>
            <MyTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute>
            <AdminTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <AdminBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/tickets"
        element={
          <ProtectedRoute>
            <TechnicianTicketsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
