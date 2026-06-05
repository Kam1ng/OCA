const BASE_URL = 'http://10.200.193.70:8080/api'

console.log('API Base URL:', BASE_URL)

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

const request = (options: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const header: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.header
    }
    
    if (token) {
      header['Authorization'] = 'Bearer ' + token  // 添加 Bearer 前缀
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('user')
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error('Unauthorized'))
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('Request failed:', err)
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export const get = (url: string, data?: any) => request({ url, method: 'GET', data })
export const post = (url: string, data?: any) => request({ url, method: 'POST', data })
export const put = (url: string, data?: any) => request({ url, method: 'PUT', data })
export const del = (url: string, data?: any) => request({ url, method: 'DELETE', data })

export default { get, post, put, del }