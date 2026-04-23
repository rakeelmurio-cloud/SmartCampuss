import API from './authApi'

export const getNotifications = async () => {
  const response = await API.get('/notifications')
  return response.data
}

export const markNotificationRead = async (id) => {
  await API.patch(`/notifications/${id}/read`)
}

export const markAllNotificationsRead = async () => {
  await API.patch('/notifications/read-all')
}

export default API
