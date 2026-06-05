<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    this.checkLoginStatus()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.reLaunch({
          url: '/pages/login/index'
        })
      } else {
        uni.setStorageSync('isGuardianUser', 'true')
      }
    }
  }
}
</script>

<style>
page {
  font-size: 28rpx;
  background-color: #f5f5f5;
}
</style>
