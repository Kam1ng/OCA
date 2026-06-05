<template>
  <view class="map-container">
    <view class="header">
      <text class="header-title">实时定位</text>
      <view class="elderly-selector" @click="showElderlyPicker">
        <text class="selector-text">{{ selectedElderly }}</text>
        <text class="selector-arrow">▼</text>
      </view>
    </view>

    <view class="map-area">
      <view class="map-placeholder">
        <view class="map-marker">📍</view>
        <text class="map-text">{{ currentLocation }}</text>
        <view class="map-radar">
          <view class="radar-ring"></view>
          <view class="radar-ring delay-1"></view>
          <view class="radar-ring delay-2"></view>
        </view>
      </view>
    </view>

    <view class="location-info">
      <view class="info-row">
        <text class="info-label">当前位置</text>
        <text class="info-value">{{ currentLocation }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">定位时间</text>
        <text class="info-value">{{ lastUpdateTime }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">定位精度</text>
        <text class="info-value">{{ accuracy }}米</text>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">历史轨迹</text>
        <view class="time-filter">
          <view 
            class="filter-item" 
            v-for="filter in timeFilters" 
            :key="filter.value"
            :class="{ active: selectedFilter === filter.value }"
            @click="selectedFilter = filter.value"
          >
            <text>{{ filter.label }}</text>
          </view>
        </view>
      </view>

      <view class="trajectory-list">
        <view class="trajectory-item" v-for="item in trajectoryData" :key="item.id">
          <view class="trajectory-time">{{ item.time }}</view>
          <view class="trajectory-path">
            <view class="path-dot start"></view>
            <view class="path-line"></view>
            <view class="path-dot end"></view>
          </view>
          <view class="trajectory-location">{{ item.location }}</view>
        </view>
      </view>
    </view>

    <view class="action-bar">
      <button class="action-btn secondary" @click="refreshLocation">
        <text class="btn-icon">🔄</text>
        <text class="btn-text">刷新定位</text>
      </button>
      <button class="action-btn primary" @click="navigateTo">
        <text class="btn-icon">🚗</text>
        <text class="btn-text">导航前往</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedElderly = ref('李奶奶')
const currentLocation = ref('北京市朝阳区XX小区')
const lastUpdateTime = ref('2024-01-15 14:30:25')
const accuracy = ref(15)
const selectedFilter = ref('today')

const timeFilters = [
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const trajectoryData = ref([
  { id: 1, time: '14:30', location: '北京市朝阳区XX小区' },
  { id: 2, time: '12:00', location: 'XX超市' },
  { id: 3, time: '10:30', location: 'XX公园' },
  { id: 4, time: '08:00', location: '北京市朝阳区XX小区' }
])

const showElderlyPicker = () => {
  uni.showActionSheet({
    itemList: ['李奶奶', '张爷爷', '王阿姨'],
    success: (res) => {
      const names = ['李奶奶', '张爷爷', '王阿姨']
      selectedElderly.value = names[res.tapIndex]
    }
  })
}

const refreshLocation = () => {
  uni.showLoading({ title: '刷新中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '定位已更新', icon: 'success' })
    lastUpdateTime.value = new Date().toLocaleString()
  }, 1500)
}

const navigateTo = () => {
  uni.showToast({ title: '正在打开导航', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.map-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.header {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  padding: 80rpx 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.elderly-selector {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.selector-text {
  font-size: 28rpx;
  color: #fff;
  margin-right: 8rpx;
}

.selector-arrow {
  font-size: 20rpx;
  color: #fff;
}

.map-area {
  height: 500rpx;
  background: #e6f7ff;
  position: relative;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.map-marker {
  font-size: 80rpx;
  z-index: 2;
}

.map-text {
  font-size: 28rpx;
  color: #333;
  margin-top: 20rpx;
  z-index: 2;
}

.map-radar {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
}

.radar-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid rgba(25, 137, 250, 0.3);
  border-radius: 50%;
  animation: radar-pulse 2s infinite;

  &.delay-1 { animation-delay: 0.5s; }
  &.delay-2 { animation-delay: 1s; }
}

@keyframes radar-pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.location-info {
  background: #fff;
  margin: -20rpx 20rpx 20rpx;
  border-radius: 16rpx;
  padding: 25rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.section {
  padding: 0 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.time-filter {
  display: flex;
  gap: 15rpx;
}

.filter-item {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background: #fff;
  font-size: 24rpx;
  color: #666;

  &.active {
    background: #1989fa;
    color: #fff;
  }
}

.trajectory-list {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.trajectory-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.trajectory-time {
  font-size: 26rpx;
  color: #666;
  width: 100rpx;
}

.trajectory-path {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 20rpx;
}

.path-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #1989fa;

  &.start {
    background: #52c41a;
    width: 20rpx;
    height: 20rpx;
  }

  &.end {
    background: #ff4d4f;
  }
}

.path-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, #52c41a, #1989fa, #ff4d4f);
  margin: 0 10rpx;
}

.trajectory-location {
  font-size: 26rpx;
  color: #333;
  width: 200rpx;
  text-align: right;
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
  height: 90rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  border: none;

  &.primary {
    background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
    .btn-text { color: #fff; }
  }

  &.secondary {
    background: #fff;
    border: 2rpx solid #1989fa;
    .btn-text { color: #1989fa; }
  }
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 30rpx;
  font-weight: bold;
}
</style>
