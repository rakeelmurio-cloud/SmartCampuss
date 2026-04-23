import API from './authApi'

export const createBooking = async (data) => {
  const response = await API.post('/bookings', data)
  return response.data
}

export const getMyBookings = async () => {
  const response = await API.get('/bookings/my')
  return response.data
}

export const getAllBookings = async (params = {}) => {
  const response = await API.get('/bookings', { params })
  return response.data
}

export const getBooking = async (id) => {
  const response = await API.get(`/bookings/${id}`)
  return response.data
}

export const updateBookingStatus = async (id, data) => {
  const response = await API.patch(`/bookings/${id}/status`, data)
  return response.data
}

export const cancelBooking = async (id, data = {}) => {
  const response = await API.patch(`/bookings/${id}/cancel`, data)
  return response.data
}

export default API
