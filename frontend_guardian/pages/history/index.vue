<template>
  <view class="content">
    <view class="header">
      <text class="back" @click="goBack">‹</text>
      <text class="title">历史轨迹</text>
      <text class="placeholder"></text>
    </view>

    <view class="elderly-select">
      <picker :value="selectedIndex" :range="elderlyList" range-key="name" @change="onElderlyChange">
        <view class="picker-content">
          <text class="picker-text">{{ elderlyList[selectedIndex]?.name || '选择老人' }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </picker>
    </view>

    <view class="date-selector">
      <view class="date-btn" @click="prevDay">‹</view>
      <picker mode="date" :value="selectedDate" @change="onDateChange">
        <view class="date-value">{{ selectedDate }}</view>
      </picker>
      <view class="date-btn" @click="nextDay">›</view>
    </view>

    <view class="map-area">
      <view class="map-placeholder">
        <view class="route-line">
          <text class="route-point">🚶</text>
          <view class="route-path"></view>
          <text class="route-point">🏠</text>
        </view>
        <text class="map-text">今日出行轨迹</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-value">3.5公里</text>
          <text class="stats-label">行走距离</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-value">1小时20分</text>
          <text class="stats-label">出行时长</text>
        </view>
        <view class="stats-divider"></view>
        <view class="stats-item">
          <text class="stats-value">6个</text>
          <text class="stats-label">途经点</text>
        </view>
      </view>
    </view>

    <view class="record-section">
      <text class="section-title">出行记录</text>
      <view class="record-list">
        <view class="record-item" v-for="(item, index) in records" :key="index">
          <text class="record-time">{{ item.time }}</text>
          <view class="record-info">
            <text class="record-location">{{ item.location }}</text>
            <text class="record-type">{{ item.type }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedIndex: 0,
      selectedDate: new Date().toISOString().split('T')[0],
      elderlyList: [
        { id: 1, name: '张大爷' },
        { id: 2, name: '李大妈' },
        { id: 3, name: '王爷爷' }
      ],
      records: [
        { time: '08:30', location: '望京SOHO', type: '出发' },
        { time: '08:45', location: '望京地铁站', type: '途经' },
        { time: '09:15', location: '奥林匹克公园', type: '到达' },
        { time: '11:00', location: '奥林匹克公园', type: '离开' },
        { time: '11:30', location: '望京SOHO', type: '返回' }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    onElderlyChange(e) {
      this.selectedIndex = e.detail.value
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value
    },
    prevDay() {
      const date = new Date(this.selectedDate)
      date.setDate(date.getDate() - 1)
      this.selectedDate = date.toISOString().split('T')[0]
    },
    nextDay() {
      const today = new Date().toISOString().split('T')[0]
      if (this.selectedDate < today) {
        const date = new Date(this.selectedDate)
        date.setDate(date.getDate() + 1)
        this.selectedDate = date.toISOString().split('T')[0]
      }
    }
  }
}
</script>

<style>
.content {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 30rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  padding: 140rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back {
  font-size: 60rpx;
  color: #fff;
  width: 60rpx;
}

.title {
  font-size: 42rpx;
  font-weight: bold;
  color: #fff;
}

.placeholder {
  width: 60rpx;
}

.elderly-select {
  padding: 25rpx;
  background: #fff;
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.picker-text {
  font-size: 34rpx;
  color: #333;
}

.picker-arrow {
  font-size: 26rpx;
  color: #999;
}

.date-selector {
  padding: 20rpx 25rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.date-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #666;
}

.date-value {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  min-width: 220rpx;
  text-align: center;
}

.map-area {
  padding: 25rpx;
}

.map-placeholder {
  background: #fff;
  border-radius: 20rpx;
  height: 300rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.route-line {
  display: flex;
  align-items: center;
  width: 80%;
  margin-bottom: 20rpx;
}

.route-point {
  font-size: 42rpx;
}

.route-path {
  flex: 1;
  height: 4rpx;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  margin: 0 20rpx;
}

.map-text {
  font-size: 28rpx;
  color: #999;
}

.stats-section {
  padding: 0 25rpx 25rpx;
}

.stats-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  text-align: center;
}

.stats-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #999;
}

.stats-divider {
  width: 2rpx;
  height: 60rpx;
  background: #f0f0f0;
}

.record-section {
  padding: 0 25rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.record-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.record-item {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-time {
  font-size: 32rpx;
  font-weight: bold;
  color: #1890ff;
  width: 110rpx;
}

.record-info {
  flex: 1;
}

.record-location {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 5rpx;
}

.record-type {
  font-size: 24rpx;
  color: #999;
}
</style>
