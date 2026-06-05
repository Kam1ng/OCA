const TIANDITU_KEY = 'a1e68e34cbd7db27211f04c694a614ff'

// 天地图逆地理编码API
export const getAddressFromCoords = (longitude: number, latitude: number): Promise<string> => {
  return new Promise((resolve) => {
    // 使用正确的天地图逆地理编码接口
    const url = `https://api.tianditu.gov.cn/geocoder?postStr={"lon":${longitude},"lat":${latitude},"ver":1}&type=geocode&tk=${TIANDITU_KEY}`
    
    uni.request({
      url: url,
      method: 'GET',
      success: (res: any) => {
        console.log('Geocoder response:', res.data)
        if (res.statusCode === 200 && res.data && res.data.result) {
          const address = res.data.result.formatted_address || res.data.result.address
          resolve(address || '')
        } else {
          resolve('')
        }
      },
      fail: (err: any) => {
        console.error('Geocoder request failed:', err)
        resolve('')
      }
    })
  })
}