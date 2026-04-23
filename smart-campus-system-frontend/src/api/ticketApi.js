import API from './authApi'

export const createTicket = async (formData) => {
  const response = await API.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const getMyTickets = async () => {
  const response = await API.get('/tickets/my')
  return response.data
}

export const getAssignedTickets = async () => {
  const response = await API.get('/tickets/assigned')
  return response.data
}

export const getTicket = async (id) => {
  const response = await API.get(`/tickets/${id}`)
  return response.data
}

export const getAllTickets = async (params = {}) => {
  const response = await API.get('/tickets', { params })
  return response.data
}

export const assignTechnician = async (ticketId, data) => {
  const response = await API.patch(`/tickets/${ticketId}/assign`, data)
  return response.data
}

export const updateTicketStatus = async (ticketId, data) => {
  const response = await API.patch(`/tickets/${ticketId}/status`, data)
  return response.data
}

export const resolveTicket = async (ticketId, data) => {
  const response = await API.patch(`/tickets/${ticketId}/resolve`, data)
  return response.data
}

export const rejectTicket = async (ticketId, data) => {
  const response = await API.patch(`/tickets/${ticketId}/reject`, data)
  return response.data
}

export const addComment = async (ticketId, data) => {
  const response = await API.post(`/tickets/${ticketId}/comments`, data)
  return response.data
}

export const updateComment = async (ticketId, commentId, data) => {
  const response = await API.put(
    `/tickets/${ticketId}/comments/${commentId}`,
    data
  )
  return response.data
}

export const deleteComment = async (ticketId, commentId) => {
  await API.delete(`/tickets/${ticketId}/comments/${commentId}`)
}
