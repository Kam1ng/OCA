<template>
  <view class="detail-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">{{ elderlyName }}</text>
      <view class="header-right"></view>
    </view>

    <view class="info-card">
      <view class="info-header">
        <view class="avatar">{{ avatar }}</view>
        <view class="basic-info">
          <text class="name">{{ elderlyName }}</text>
          <text class="phone">{{ phone }}</text>
        </view>
        <view class="status-badge" :class="{ online: isOnline }">
          <text>{{ isOnline ? '在线' : '离线' }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">📍 实时位置</text>
      <view class="location-card">
        <view class="location-info">
          <text class="location-text">{{ currentLocation }}</text>
          <text class="update-time">更新于 {{ updateTime }}</text>
        </view>
        <button class="location-btn" @click="goMap">查看地图</button>
      </view>
    </view>

    <view class="section">
      <text class="section-title">❤️ 健康数据</text>
      <view class="health-grid">
        <view class="health-item">
          <text class="health-icon">🫀</text>
          <text class="health-value">{{ healthData.heartRate }}</text>
          <text class="health-unit">bpm</text>
          <text class="health-label">心率</text>
        </view>
        <view class="health-item">
          <text class="health-icon">💉</text>
          <text class="health-value">{{ healthData.bp }}</text>
          <text class="health-unit">mmHg</text>
          <text class="health-label">血压</text>
        </view>
        <view class="health-item">
          <text class="health-icon">🌡️</text>
          <text class="health-value">{{ healthData.temperature }}</text>
          <text class="health-unit">℃</text>
          <text class="health-label">体温</text>
        </view>
        <view class="health-item">
          <text class="health-icon">👟</text>
          <text class="health-value">{{ healthData.steps }}</text>
          <text class="health-unit">步</text>
          <text class="health-label">步数</text>
        </view>
        <view class="health-item">
          <text class="health-icon">😴</text>
          <text class="health-value">{{ healthData.sleep }}</text>
          <text class="health-unit">小时</text>
          <text class="health-label">睡眠</text>
        </view>
        <view class="health-item">
          <text class="health-icon">🔋</text>
          <text class="health-value">{{ healthData.battery }}</text>
          <text class="health-unit">%</text>
          <text class="health-label">电量</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">📨 发送消息</text>
      <view class="message-input-area">
        <input class="message-input" v-model="message" placeholder="输入要发送的消息" />
        <button class="send-btn" @click="sendMessage">发送</button>
      </view>
    </view>

    <view class="action-bar">
      <button class="action-btn" @click="goFence">
        <text class="action-icon">🏠</text>
        <text class="action-text">电子围栏</text>
      </button>
      <button class="action-btn" @click="goHealth">
        <text class="action-icon">📊</text>
        <text class="action-text">健康详情</text>
      </button>
      <button class="action-btn" @click="goHistory">
        <text class="action-icon">📍</text>
        <text class="action-text">轨迹历史</text>
      </button>
      <button class="action-btn" @click="makeCall">
        <text class="action-icon">📞</text>
        <text class="action-text">拨打电话</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const elderlyName = ref('李奶奶')
const avatar = ref('👵')
const phone = ref('13900139001')
const isOnline = ref(true)
const currentLocation = ref('北京市朝阳区XX小区')
const updateTime = ref('刚刚')
const message = ref('')

const healthData = ref({
  heartRate: 72,
  bp: '120/80',
  temperature: 36.5,
  steps: 3567,
  sleep: 7.5,
  battery: 85
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  if (currentPage.options) {
    elderlyName.value = currentPage.options.name || '李奶奶'
  }
})

const goBack = () => {
  uni.navigateBack()
}

const goMap = () => {
  uni.switchTab({ url: '/pages/map/index' })
}

const sendMessage = () => {
  if (!message.value.trim()) {
    uni.showToast({ title: '请输入消息内容', icon: 'none' })
    return
  }
  uni.showToast({ title: '消息发送成功', icon: 'success' })
  message.value = ''
}

const goFence = () => {
  uni.navigateTo({ url: '/pages/fence/index' })
}

const goHealth = () => {
  uni.switchTab({ url: '/pages/health/index' })
}

const goHistory = () => {
  uni.switchTab({ url: '/pages/map/index' })
}

const makeCall = () => {
  uni.makePhoneCall({ phoneNumber: phone.value })
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 180rpx;
}

.header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  padding: 60rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 56rpx;
  color: #fff;
  line-height: 1;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.header-right {
  width: 60rpx;
}

.info-card {
  background: #fff;
  margin: -20rpx 20rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  margin-right: 25rpx;
}

.basic-info {
  flex: 1;
}

.name {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.status-badge {
  padding: 10rpx 24rpx;
  border-radius: 25rpx;
  background: #f5f5f5;

  text {
    font-size: 26rpx;
    color: #999;
  }

  &.online {
    background: #f6ffed;

    text {
      color: #52c41a;
    }
  }
}

.section {
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.location-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.location-info {
  flex: 1;
}

.location-text {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.update-time {
  font-size: 24rpx;
  color: #999;
}

.location-btn {
  background: #1989fa;
  color: #fff;
  font-size: 26rpx;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  border: none;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
}

.health-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx 15rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.health-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.health-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.health-unit {
  font-size: 20rpx;
  color: #999;
}

.health-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.message-input-area {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  gap: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.message-input {
  flex: 1;
  height: 70rpx;
  font-size: 28rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 35rpx;
}

.send-btn {
  background: #52c41a;
  color: #fff;
  font-size: 28rpx;
  padding: 0 30rpx;
  border-radius: 35rpx;
  border: none;
}

.action-bar {
  position: fixed;
  bottom: 100rpx;
  left: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx 15rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.action-icon {
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.action-text {
  font-size: 24rpx;
  color: #333;
}
</style>
