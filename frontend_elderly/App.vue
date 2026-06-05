<script>
import { getAddressFromCoords } from './utils/geocoder'
import { post } from './utils/request'

export default {
  onLaunch: function() {
    console.log('App Launch')
    this.checkLoginStatus()
  },
  onShow: function() {
    console.log('App Show')
    uni.setStorageSync('isAppActive', 'true')
    this.startBackgroundLocation()
  },
  onHide: function() {
    console.log('App Hide')
    uni.setStorageSync('isAppActive', 'false')
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.reLaunch({
          url: '/pages/login/index'
        })
      } else {
        uni.setStorageSync('isElderlyUser', 'true')
      }
    },
    startBackgroundLocation() {
      const userStr = uni.getStorageSync('user')
      if (!userStr) return

      const user = JSON.parse(userStr)
      if (user.userType !== 'elderly') return

      this.uploadLocationLoop()
    },
    async uploadLocationLoop() {
      const uploadOnce = async () => {
        const userStr = uni.getStorageSync('user')
        if (!userStr) return

        const user = JSON.parse(userStr)
        const elderlyId = user.elderlyId || user.id
        if (!elderlyId) return

        try {
          const [latitude, longitude] = await this.getLocation()
          const address = await getAddressFromCoords(longitude, latitude)

          await post('/location', {
            elderlyId: elderlyId,
            latitude: latitude,
            longitude: longitude,
            address: address
          })

          console.log('Location uploaded:', latitude, longitude)
        } catch (err) {
          console.error('Upload location failed:', err)
        }
      }

      await uploadOnce()

      setInterval(async () => {
        await uploadOnce()
      }, 30000)
    },
    getLocation() {
      return new Promise((resolve, reject) => {
        uni.getLocation({
          type: 'gcj02',
          enableHighAccuracy: true,
          geocode: false,
          timeout: 10,
          success: (res) => {
            resolve([res.latitude, res.longitude])
          },
          fail: (err) => {
            console.log('Get location failed, retry with low power mode')
            uni.getLocation({
              type: 'gcj02',
              enableHighAccuracy: false,
              geocode: false,
              success: (res) => {
                resolve([res.latitude, res.longitude])
              },
              fail: (err2) => {
                reject(err2)
              }
            })
          }
        })
      })
    }
  }
}
</script>

<style>
page {
  font-size: 32rpx;
  background-color: #f5f5f5;
}
</style>