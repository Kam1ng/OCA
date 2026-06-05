export const BackgroundService = {
  timer: null,
  locationTimer: null,
  
  start() {
    this.startLocationTracking()
    this.startHeartbeat()
    console.log('后台服务已启动')
  },
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.locationTimer) {
      clearInterval(this.locationTimer)
      this.locationTimer = null
    }
    console.log('后台服务已停止')
  },
  
  startLocationTracking() {
    this.locationTimer = setInterval(() => {
      this.reportLocation()
    }, 60000)
    
    this.reportLocation()
  },
  
  reportLocation() {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        uni.request({
          url: 'http://localhost:8080/api/location/report',
          method: 'POST',
          data: {
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          },
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${uni.getStorageSync('token')}`
          },
          success: () => {
            console.log('位置上报成功')
          },
          fail: (err) => {
            console.error('位置上报失败:', err)
          }
        })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
      }
    })
  },
  
  startHeartbeat() {
    this.timer = setInterval(() => {
      uni.request({
        url: 'http://localhost:8080/api/user/heartbeat',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: () => {
          console.log('心跳上报成功')
        }
      })
    }, 300000)
  }
}
