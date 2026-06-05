<template>
  <view class="floating-sos" :class="{ pressing: isPressing }" @touchstart="startPress" @touchend="endPress" @touchcancel="endPress">
    <view class="sos-icon">🆘</view>
    <view class="sos-text" v-if="!isPressing">SOS</view>
    <view class="countdown" v-else>
      <view class="countdown-circle" :style="{ animationDuration: '3s' }"></view>
      <text class="countdown-num">{{ countdown }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

  uni.showLoading({ title: '发送中...' })
  
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
</script>

<style lang="scss" scoped>
.floating-sos {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.4);
  z-index: 9999;
  transition: all 0.2s ease;
  
  &:active, &.pressing {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.6);
  }
}

.sos-icon {
  font-size: 40rpx;
}

.sos-text {
  font-size: 20rpx;
  color: #fff;
  margin-top: 4rpx;
}

.countdown {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.countdown-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin linear forwards;
}

.countdown-num {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  z-index: 1;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>