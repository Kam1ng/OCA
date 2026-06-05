<template>
  <view class="location-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">实时位置</text>
      </view>
      <text class="subtitle">{{ elderlyInfo?.nickname || '老人' }}的位置信息</text>
    </view>

    <view class="map-area">
      <web-view
        id="locationWebView"
        :src="mapUrl"
        :key="mapKey"
        @message="onMapMessage"
        :style="{ width: '100%', height: '100%' }"
      ></web-view>
    </view>

    <view class="fence-status" v-if="activeFence">
      <view class="fence-icon">🏠</view>
      <view class="fence-info">
        <text class="fence-name">{{ activeFence.name }}</text>
        <text class="fence-desc">半径 {{ activeFence.radius }} 米</text>
      </view>
      <view class="fence-action" @click="goToFence">
        <text class="action-text">管理</text>
      </view>
    </view>

    <view class="location-info">
      <view class="info-item">
        <text class="info-icon">📍</text>
        <view class="info-content">
          <text class="info-label">当前位置</text>
          <text class="info-text">{{ locationText }}</text>
        </view>
      </view>
      <view class="info-item">
        <text class="info-icon">🕐</text>
        <view class="info-content">
          <text class="info-label">更新时间</text>
          <text class="info-text">{{ updateTime }}</text>
        </view>
      </view>
    </view>

    <view class="action-buttons">
      <button class="refresh-btn" @click="refreshLocation">
        <text class="btn-icon">🔄</text>
        <text class="btn-text">刷新位置</text>
      </button>
      <button class="history-btn" @click="viewHistory">
        <text class="btn-icon">📜</text>
        <text class="btn-text">历史轨迹</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface ElderlyInfo {
  elderlyId: number
  nickname: string
}

interface LocationData {
  latitude: number
  longitude: number
  updateTime: string
  address?: string
}

interface Fence {
  id: number
  elderlyId: number
  name: string
  centerLatitude: number
  centerLongitude: number
  radius: number
  enabled: number
}

const elderlyId = ref<number | null>(null)
const elderlyInfo = ref<ElderlyInfo | null>(null)
const currentLocation = ref<LocationData>({
  latitude: 39.90469,
  longitude: 116.40717,
  updateTime: ''
})
const fences = ref<Fence[]>([])
const mapReady = ref(false)
const webViewContext = ref<any>(null)
const mapKey = ref(0)

const mapUrl = computed(() => {
  const lng = currentLocation.value.longitude
  const lat = currentLocation.value.latitude
  const nickname = elderlyInfo.value?.nickname || '老人'

  if (lng && lat) {
    return `/static/tianditu.html?lng=${lng}&lat=${lat}&title=${encodeURIComponent(nickname)}`
  }
  return '/static/tianditu.html'
})

const activeFence = computed(() => {
  return fences.value.find(f => f.enabled === 1)
})

const locationText = computed(() => {
  if (!currentLocation.value.latitude) return '加载中...'
  return currentLocation.value.address || `${currentLocation.value.latitude.toFixed(6)}, ${currentLocation.value.longitude.toFixed(6)}`
})

const updateTime = computed(() => {
  if (!currentLocation.value.updateTime) return '未知'
  const date = new Date(currentLocation.value.updateTime.replace('T', ' '))
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
})

const goBack = () => {
  uni.navigateBack()
}

const onMapMessage = (e: any) => {
  const data = e.detail.data[0]
  if (data && data.type === 'mapReady') {
    console.log('Map ready, hasLocation:', data.hasLocation)
  }
}

const updateMapMarker = () => {
  // now handled via URL params
}

const loadLocation = async () => {
  if (!elderlyId.value) return

  try {
    const result = await get(`/location/elderly/${elderlyId.value}`)
    if (result.code === 200 && result.data) {
      currentLocation.value = {
        latitude: result.data.latitude || 39.90469,
        longitude: result.data.longitude || 116.40717,
        updateTime: result.data.updateTime || new Date().toISOString(),
        address: result.data.address
      }
      updateMapMarker()
    }
  } catch (error) {
    console.error('Load location failed:', error)
    currentLocation.value.updateTime = new Date().toISOString()
  }
}

const loadFences = async () => {
  if (!elderlyId.value) return

  try {
    const result = await get(`/fence/elderly/${elderlyId.value}`)
    if (result.code === 200 && result.data) {
      fences.value = result.data
    }
  } catch (error) {
    console.error('Load fences failed:', error)
  }
}

const refreshLocation = () => {
  loadLocation()
  loadFences()
  uni.showToast({ title: '位置已刷新', icon: 'success' })
}

const viewHistory = () => {
  if (!elderlyId.value) {
    uni.showToast({ title: '请先选择老人', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/location/history?elderlyId=${elderlyId.value}&nickname=${elderlyInfo.value?.nickname || ''}`
  })
}

const goToFence = () => {
  uni.navigateTo({ url: '/pages/fence/index' })
}

onLoad((options: any) => {
  if (options.elderlyId) {
    elderlyId.value = parseInt(options.elderlyId)
    elderlyInfo.value = {
      elderlyId: elderlyId.value,
      nickname: options.nickname || '老人'
    }
  }
})

onMounted(() => {
  if (!elderlyId.value) {
    const bindElderlyStr = uni.getStorageSync('selectedElderly')
    if (bindElderlyStr) {
      elderlyInfo.value = JSON.parse(bindElderlyStr)
      elderlyId.value = elderlyInfo.value.elderlyId
    }
  }
  loadLocation()
  loadFences()
  
  nextTick(() => {
    webViewContext.value = uni.createWebViewContext('locationWebView')
  })
})

watch(currentLocation, () => {
  mapKey.value++
}, { deep: true })
</script>

<style lang="scss" scoped>
.location-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 300rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
  position: relative;
  z-index: 10;
}

.header-top {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.back-btn {
  font-size: 60rpx;
  color: #fff;
  margin-right: 20rpx;
  position: relative;
  z-index: 20;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.map-area {
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  height: 450rpx;
}

.fence-status {
  margin: 0 20rpx 20rpx;
  background: linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.fence-icon {
  font-size: 48rpx;
}

.fence-info {
  flex: 1;
}

.fence-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.fence-desc {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.fence-action {
  padding: 12rpx 24rpx;
  background: #1890ff;
  border-radius: 24rpx;
}

.action-text {
  font-size: 26rpx;
  color: #fff;
}

.location-info {
  margin: 0 20rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.info-text {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.action-buttons {
  display: flex;
  margin: 20rpx;
  gap: 20rpx;
}

.refresh-btn,
.history-btn {
  flex: 1;
  height: 88rpx;
  background: #fff;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.btn-text {
  font-size: 28rpx;
  color: #333;
}
</style>