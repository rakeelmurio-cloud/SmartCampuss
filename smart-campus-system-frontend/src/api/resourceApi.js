import API from './authApi'

export const getResources = async (params = {}) => {
  const response = await API.get('/resources', { params })
  return response.data
}

export const getResource = async (id) => {
  const response = await API.get(`/resources/${id}`)
  return response.data
}

export const createResource = async (data) => {
  const response = await API.post('/resources', data)
  return response.data
}

export const updateResource = async (id, data) => {
  const response = await API.put(`/resources/${id}`, data)
  return response.data
}

export default API
