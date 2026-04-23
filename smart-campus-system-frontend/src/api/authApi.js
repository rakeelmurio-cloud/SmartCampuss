import axios from 'axios'
import { getToken } from '../utils/token'

const API = axios.create({
  baseURL: '/api/v1',
})

API.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const registerUser = async (data) => {
  const response = await API.post('/auth/register', data)
  return response.data
}

export const loginUser = async (data) => {
  const response = await API.post('/auth/login', data)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await API.get('/auth/me')
  return response.data
}

export const submitAccessRequest = async (data) => {
  const response = await API.post('/auth/request-access', data)
  return response.data
}

export const updateCurrentUserProfile = async (data) => {
  const response = await API.patch('/auth/profile', data)
  return response.data
}

export const getAllUsers = async () => {
  const response = await API.get('/auth/users')
  return response.data
}

export const createManagedUser = async (data) => {
  const response = await API.post('/auth/users', data)
  return response.data
}

export const updateUserRole = async (userId, data) => {
  const response = await API.patch(`/auth/users/${userId}/role`, data)
  return response.data
}

export const updateApprovalStatus = async (userId, data) => {
  const response = await API.patch(`/auth/users/${userId}/approval`, data)
  return response.data
}

export const updateUserStatus = async (userId, data) => {
  const response = await API.patch(`/auth/users/${userId}/status`, data)
  return response.data
}

export default API
