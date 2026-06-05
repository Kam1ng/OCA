const BASE_URL = 'http://10.200.195.113:8080/api'

console.log('API Base URL:', BASE_URL)

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export const get = async (url: string, data?: any, requireAuth: boolean = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (requireAuth) {
    headers['Authorization'] = `Bearer ${uni.getStorageSync('token')}`
  }
  const response = await uni.request({
    url: BASE_URL + url,
    method: 'GET',
    data,
    header: headers
  })
  return response.data
}

export const post = async (url: string, data?: any) => {
  const response = await uni.request({
    url: BASE_URL + url,
    method: 'POST',
    data,
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
  return response.data
}

export const put = async (url: string, data?: any) => {
  const response = await uni.request({
    url: BASE_URL + url,
    method: 'PUT',
    data,
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
  return response.data
}

export const del = async (url: string, data?: any) => {
  const response = await uni.request({
    url: BASE_URL + url,
    method: 'DELETE',
    data,
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${uni.getStorageSync('token')}`
    }
  })
  return response.data
}