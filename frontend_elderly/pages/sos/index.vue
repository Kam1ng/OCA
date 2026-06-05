<template>
  <view class="sos-container">
    <view class="header">
      <text class="title">紧急求助</text>
      <text class="desc">遇到紧急情况时，长按下方按钮</text>
    </view>

    <view class="sos-area">
      <view
        class="sos-btn"
        :class="{ pressing: isPressing }"
        @touchstart="startPress"
        @touchend="endPress"
      >
        <text class="sos-icon">🆘</text>
        <text class="sos-text">紧急求助</text>
        <view class="countdown" v-if="isPressing">
          <text class="countdown-num">{{ countdown }}</text>
        </view>
      </view>

      <view class="cancel-btn" v-if="isPressing" @click="cancelPress">
        取消
      </view>
    </view>

    <view class="tips">
      <text class="tips-title">💡 使用提示</text>
      <text class="tips-text">• 长按SOS按钮3秒触发紧急求助</text>
      <text class="tips-text">• 可随时点击取消按钮终止求助</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { post } from '@/utils/request'

const isPressing = ref(false)
const countdown = ref(3)
let countdownTimer: number | null = null

const startPress = () => {
  isPressing.value = true
  countdown.value = 3

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      triggerSOS()
    }
  }, 1000) as unknown as number
}

const endPress = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  isPressing.value = false
}

const cancelPress = () => {
  endPress()
}

const triggerSOS = async () => {
  endPress()

  const userStr = uni.getStorageSync('user')
  if (!userStr) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const user = JSON.parse(userStr)
  if (!user.elderlyId) {
    uni.showToast({ title: '无法发送求助', icon: 'none' })
    return
  }

  uni.showLoading({ title: '获取位置中...' })
  
  uni.getLocation({
    type: 'gcj02',
    enableHighAccuracy: true,
    timeout: 10000,
    success: async (res) => {
      uni.hideLoading()
      try {
        const result = await post('/alarm/emergency', {
          elderlyId: user.elderlyId,
          latitude: res.latitude,
          longitude: res.longitude
        })
        if (result.code === 200) {
          uni.showToast({ title: '求救信号已发送', icon: 'none', duration: 3000 })
        } else {
          uni.showToast({ title: result.message || '发送失败', icon: 'none' })
        }
      } catch (error) {
        uni.showToast({ title: '发送失败', icon: 'none' })
      }
    },
    fail: async (err) => {
      uni.hideLoading()
      try {
        const result = await post('/alarm/emergency', {
          elderlyId: user.elderlyId,
          latitude: 0,
          longitude: 0
        })
        if (result.code === 200) {
          uni.showToast({ title: '求救信号已发送（位置未知）', icon: 'none', duration: 3000 })
        } else {
          uni.showToast({ title: result.message || '发送失败', icon: 'none' })
        }
      } catch (error) {
        uni.showToast({ title: '发送失败', icon: 'none' })
      }
    }
  })
}

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.sos-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
  text-align: center;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 15rpx;
}

.desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.sos-area {
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sos-btn {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 60rpx rgba(255, 77, 79, 0.4);
  position: relative;

  &.pressing {
    transform: scale(0.95);
  }
}

.sos-icon {
  font-size: 80rpx;
  margin-bottom: 10rpx;
}

.sos-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}

.countdown {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-num {
  font-size: 100rpx;
  font-weight: bold;
  color: #fff;
}

.cancel-btn {
  margin-top: 60rpx;
  background: #fff;
  padding: 20rpx 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tips {
  margin: 0 30rpx;
  background: #fffbe6;
  border-radius: 16rpx;
  padding: 30rpx;
  border: 2rpx solid #ffe58f;
}

.tips-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.tips-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}
</style>