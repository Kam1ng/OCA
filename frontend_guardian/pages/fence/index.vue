<template>
  <view class="fence-container">
    <view class="header">
      <text class="header-back" @click="goBack">‹</text>
      <text class="header-title">电子围栏</text>
      <text class="header-placeholder"></text>
    </view>

    <view class="elderly-select">
      <picker :value="selectedIndex" :range="elderlyOptions" range-key="name" @change="onElderlyChange">
        <view class="picker-content">
          <text class="picker-text">{{ elderlyOptions[selectedIndex]?.name || '选择老人' }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </picker>
    </view>

    <view class="map-section">
      <view class="map-placeholder">
        <view class="fence-marker">📍</view>
        <view class="fence-circle"></view>
        <text class="map-text">围栏区域</text>
        <view class="fence-info">
          <text class="info-text">半径：{{ fenceRadius }} 米</text>
        </view>
      </view>
    </view>

    <view class="status-card" :class="fenceStatus">
      <view class="status-icon">{{ fenceStatus === 'active' ? '✅' : '❌' }}</view>
      <view class="status-content">
        <text class="status-title">{{ fenceStatus === 'active' ? '围栏已开启' : '围栏已关闭' }}</text>
        <text class="status-desc">{{ fenceStatus === 'active' ? '老人离开安全区域将收到告警' : '请开启围栏保护老人安全' }}</text>
      </view>
      <switch 
        :checked="fenceStatus === 'active'" 
        @change="toggleFence"
        color="#1890ff"
      />
    </view>

    <view class="settings-section">
      <text class="section-title">围栏设置</text>
      
      <view class="setting-item">
        <text class="setting-label">安全半径</text>
        <view class="radius-control">
          <view class="radius-btn" @click="decreaseRadius">‹</view>
          <text class="radius-value">{{ fenceRadius }} 米</text>
          <view class="radius-btn" @click="increaseRadius">›</view>
        </view>
      </view>

      <view class="setting-item" @click="goToSetCenter">
        <text class="setting-label">中心位置</text>
        <view class="setting-value-wrap">
          <text class="setting-value">{{ centerAddress || '点击设置' }}</text>
          <text class="setting-arrow">›</text>
        </view>
      </view>

      <view class="setting-item">
        <text class="setting-label">告警通知</text>
        <switch :checked="notifications" color="#1890ff" @change="toggleNotifications" />
      </view>
    </view>

    <view class="history-section">
      <text class="section-title">越界记录</text>
      <view class="history-list">
        <view class="history-item" v-for="(item, index) in history" :key="index">
          <view class="history-icon">🚶</view>
          <view class="history-info">
            <text class="history-title">{{ item.title }}</text>
            <text class="history-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get, post, put } from '@/utils/request'

const selectedIndex = ref(0)
const fenceStatus = ref('inactive')
const fenceRadius = ref(500)
const notifications = ref(true)
const fenceId = ref(null)
const centerAddress = ref('望京SOHO')

interface ElderlyOption {
  id: number
  name: string
}

interface HistoryItem {
  title: string
  time: string
}

const elderlyOptions = ref<ElderlyOption[]>([])
const history = ref<HistoryItem[]>([])

const goBack = () => {
  uni.navigateBack()
}

const onElderlyChange = async (e) => {
  selectedIndex.value = e.detail.value
  await loadFence()
}

const loadElderlyList = async () => {
  try {
    const userStr = uni.getStorageSync('user')
    if (!userStr) return
    
    const user = JSON.parse(userStr)
    const guardianId = user.id
    
    const result = await get(`/binding/guardian/list/${guardianId}`)
    if (result.code === 200 && result.data) {
      elderlyOptions.value = result.data.map((item: any) => ({
        id: item.elderlyId,
        name: item.elderlyName || '老人'
      }))
      if (elderlyOptions.value.length > 0) {
        await loadFence()
      }
    }
  } catch (error) {
    console.log('Load elderly list failed:', error)
  }
}

const loadFence = async () => {
  if (elderlyOptions.value.length === 0) return
  
  const elderlyId = elderlyOptions.value[selectedIndex.value].id
  try {
    const result = await get(`/fence/elderly/${elderlyId}`)
    if (result.code === 200 && result.data && result.data.length > 0) {
      const fence = result.data[0]
      fenceId.value = fence.id
      fenceStatus.value = fence.enabled === 1 ? 'active' : 'inactive'
      fenceRadius.value = fence.radius
      centerAddress.value = fence.name || '安全区域'
    } else {
      fenceId.value = null
      fenceStatus.value = 'inactive'
      fenceRadius.value = 500
    }
  } catch (error) {
    console.log('Load fence failed:', error)
  }
}

const loadHistory = async () => {
  if (elderlyOptions.value.length === 0) return
  
  const elderlyId = elderlyOptions.value[selectedIndex.value].id
  try {
    const result = await get(`/alarm/elderly/${elderlyId}`)
    if (result.code === 200 && result.data) {
      history.value = result.data
        .filter((item: any) => item.type === 2)
        .map((item: any) => ({
          title: item.message,
          time: item.createTime
        }))
    }
  } catch (error) {
    console.log('Load history failed:', error)
  }
}

const toggleFence = async (e) => {
  const isActive = e.detail.value
  fenceStatus.value = isActive ? 'active' : 'inactive'
  
  if (elderlyOptions.value.length === 0) return
  
  const elderlyId = elderlyOptions.value[selectedIndex.value].id
  
  try {
    if (fenceId.value) {
      await put(`/fence/${fenceId.value}`, {
        enabled: isActive ? 1 : 0,
        radius: fenceRadius.value,
        name: centerAddress.value
      })
    } else {
      await post('/fence', {
        elderlyId: elderlyId,
        name: centerAddress.value || '安全区域',
        centerLatitude: 39.9904,
        centerLongitude: 116.4706,
        radius: fenceRadius.value,
        enabled: isActive ? 1 : 0
      })
      await loadFence()
    }
    uni.showToast({ title: isActive ? '围栏已开启' : '围栏已关闭', icon: 'none' })
  } catch (error) {
    fenceStatus.value = isActive ? 'inactive' : 'active'
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const increaseRadius = async () => {
  if (fenceRadius.value < 2000) {
    fenceRadius.value += 100
    await saveRadius()
  }
}

const decreaseRadius = async () => {
  if (fenceRadius.value > 100) {
    fenceRadius.value -= 100
    await saveRadius()
  }
}

const saveRadius = async () => {
  if (fenceId.value) {
    try {
      await put(`/fence/${fenceId.value}`, {
        radius: fenceRadius.value
      })
    } catch (error) {
      console.log('Save radius failed:', error)
    }
  }
}

const toggleNotifications = (e) => {
  notifications.value = e.detail.value
}

const goToSetCenter = () => {
  uni.navigateTo({ url: '/pages/fence/add' })
}

onMounted(() => {
  loadElderlyList()
  loadHistory()
})
</script>

<style lang="scss" scoped>
.fence-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  padding: 60rpx 30rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-back {
  font-size: 56rpx;
  color: #fff;
  width: 60rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.header-placeholder {
  width: 60rpx;
}

.elderly-select {
  padding: 20rpx;
  background: #fff;
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
}

.picker-text {
  font-size: 32rpx;
  color: #333;
}

.picker-arrow {
  font-size: 24rpx;
  color: #999;
}

.map-section {
  padding: 20rpx;
}

.map-placeholder {
  background: #fff;
  border-radius: 20rpx;
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

.fence-marker {
  font-size: 60rpx;
  z-index: 1;
}

.fence-circle {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  border: 4rpx dashed #1890ff;
  border-radius: 50%;
  opacity: 0.5;
}

.map-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 30rpx;
  z-index: 1;
}

.fence-info {
  background: rgba(24, 144, 255, 0.1);
  padding: 15rpx 30rpx;
  border-radius: 20rpx;
  margin-top: 15rpx;
  z-index: 1;
}

.info-text {
  font-size: 26rpx;
  color: #1890ff;
}

.status-card {
  margin: 0 20rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border-left: 8rpx solid;

  &.active {
    border-left-color: #52c41a;
  }

  &.inactive {
    border-left-color: #999;
  }
}

.status-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.status-desc {
  font-size: 26rpx;
  color: #999;
}

.settings-section {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.setting-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 15rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.setting-label {
  font-size: 32rpx;
  color: #333;
  flex: 1;
}

.setting-value-wrap {
  display: flex;
  align-items: center;
}

.setting-value {
  font-size: 30rpx;
  color: #666;
}

.setting-arrow {
  font-size: 36rpx;
  color: #ccc;
  margin-left: 10rpx;
}

.radius-control {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.radius-btn {
  width: 50rpx;
  height: 50rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666;
}

.radius-value {
  font-size: 30rpx;
  color: #1890ff;
  font-weight: bold;
  min-width: 120rpx;
  text-align: center;
}

.history-section {
  padding: 20rpx;
}

.history-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.history-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.history-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.history-info {
  flex: 1;
}

.history-title {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}
</style>
