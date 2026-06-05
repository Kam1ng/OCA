<template>
  <view class="health-container">
    <view class="header">
      <text class="header-title">健康数据</text>
      <text class="header-name">{{ nickname }}</text>
    </view>

    <view class="connection-status" v-if="isConnected">
      <view class="status-dot"></view>
      <text class="status-text">已连接 {{ deviceName }}</text>
    </view>

    <view class="data-section">
      <view class="data-card heart-card" v-if="healthData.heartRate">
        <view class="card-header">
          <text class="card-icon">🫀</text>
          <text class="card-label">心率</text>
        </view>
        <view class="card-value">
          <text class="value-num">{{ healthData.heartRate }}</text>
          <text class="value-unit">bpm</text>
        </view>
      </view>

      <view class="data-card bp-card" v-if="healthData.systolicPressure">
        <view class="card-header">
          <text class="card-icon">💉</text>
          <text class="card-label">血压</text>
        </view>
        <view class="card-value">
          <text class="value-num">{{ healthData.systolicPressure }}/{{ healthData.diastolicPressure }}</text>
          <text class="value-unit">mmHg</text>
        </view>
      </view>

      <view class="data-card temp-card" v-if="healthData.temperature">
        <view class="card-header">
          <text class="card-icon">🌡️</text>
          <text class="card-label">体温</text>
        </view>
        <view class="card-value">
          <text class="value-num">{{ healthData.temperature }}</text>
          <text class="value-unit">℃</text>
        </view>
      </view>

      <view class="data-card steps-card" v-if="healthData.steps">
        <view class="card-header">
          <text class="card-icon">👟</text>
          <text class="card-label">步数</text>
        </view>
        <view class="card-value">
          <text class="value-num">{{ healthData.steps }}</text>
          <text class="value-unit">步</text>
        </view>
      </view>

      <view class="data-card sleep-card" v-if="healthData.sleepDuration">
        <view class="card-header">
          <text class="card-icon">😴</text>
          <text class="card-label">睡眠</text>
        </view>
        <view class="card-value">
          <text class="value-num">{{ healthData.sleepDuration }}</text>
          <text class="value-unit">小时</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-if="!hasAnyData">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无健康数据</text>
      <button class="sync-btn" @click="syncData">
        <text class="btn-icon">🔄</text>
        <text class="btn-text">同步数据</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { get } from '@/utils/request.ts'

const healthData = ref({})
const isConnected = ref(false)
const deviceName = ref('')
const nickname = ref('我')

let syncTimer = null

const hasAnyData = computed(() => {
  return Object.keys(healthData.value).length > 0
})

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    nickname.value = user.nickname || '我'
  }
}

const loadHealthData = async () => {
  try {
    const userStr = uni.getStorageSync('user')
    if (!userStr) return
    
    const user = JSON.parse(userStr)
    if (!user.id) return

    const result = await get(`/health/elderly/${user.id}/latest`)
    if (result.code === 200 && result.data) {
      healthData.value = result.data
    }
  } catch (e) {
    console.error('加载健康数据失败:', e)
  }
}

const syncData = () => {
  uni.showLoading({ title: '同步中...' })
  loadHealthData().then(() => {
    uni.hideLoading()
    uni.showToast({ title: '同步成功', icon: 'success' })
  })
}

onMounted(() => {
  loadUser()
  loadHealthData()
  
  syncTimer = setInterval(() => {
    loadHealthData()
  }, 60000)
})

onUnmounted(() => {
  if (syncTimer) {
    clearInterval(syncTimer)
  }
})
</script>

<style lang="scss" scoped>
.health-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  padding: 80rpx 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.header-name {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.connection-status {
  display: flex;
  align-items: center;
  padding: 15rpx 25rpx;
  margin: -15rpx 20rpx 15rpx;
  background: #fff;
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  background: #52c41a;
  border-radius: 50%;
  margin-right: 12rpx;
}

.status-text {
  font-size: 26rpx;
  color: #666;
}

.data-section {
  padding: 20rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border-left: 8rpx solid;

  &.heart-card { border-left-color: #ff4d4f; }
  &.bp-card { border-left-color: #faad14; }
  &.temp-card { border-left-color: #1890ff; }
  &.steps-card { border-left-color: #52c41a; }
  &.sleep-card { border-left-color: #722ed1; }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.card-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.card-label {
  font-size: 28rpx;
  color: #999;
}

.card-value {
  display: flex;
  align-items: baseline;
}

.value-num {
  font-size: 56rpx;
  font-weight: bold;
  color: #333;
}

.value-unit {
  font-size: 26rpx;
  color: #999;
  margin-left: 8rpx;
}

.empty-state {
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  display: block;
  margin-bottom: 30rpx;
}

.sync-btn {
  background: #52c41a;
  color: #fff;
  font-size: 32rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;

  &::after {
    border: none;
  }
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-weight: bold;
}
</style>
