<template>
  <view class="location-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">位置共享</text>
      </view>
      <text class="subtitle">实时位置同步给监护人</text>
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

    <view class="status-section">
      <view class="status-item" :class="{ active: isSharing }">
        <text class="status-icon">{{ isSharing ? '📡' : '⏸️' }}</text>
        <text class="status-text">{{ isSharing ? '位置共享中' : '位置共享已暂停' }}</text>
      </view>
    </view>

    <view class="action-buttons">
      <button class="share-btn" :class="{ active: isSharing }" @click="toggleSharing">
        <text class="btn-text">{{ isSharing ? '停止共享' : '开始共享' }}</text>
      </button>
    </view>

    <view class="emergency-btn" @click="emergencyCall">
      <text class="emergency-icon">🆘</text>
      <text class="emergency-text">紧急求助</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { get, post } from '@/utils/request'
import { getAddressFromCoords } from '@/utils/geocoder'

interface LocationData {
  latitude: number
  longitude: number
  updateTime: string
  address?: string
}

const currentLocation = ref<LocationData>({
  latitude: 0,
  longitude: 0,
  updateTime: ''
})

const isSharing = ref(false)
let locationTimer: number | null = null
const elderlyId = ref<number | null>(null)
const mapReady = ref(false)
const mapKey = ref(0)

const mapUrl = computed(() => {
  const lng = currentLocation.value.longitude
  const lat = currentLocation.value.latitude

  if (lng && lat) {
    return `/static/tianditu.html?lng=${lng}&lat=${lat}&title=${encodeURIComponent('我的位置')}`
  }
  return '/static/tianditu.html'
})

const locationText = computed(() => {
  if (!currentLocation.value.latitude) return '正在获取位置...'
  return currentLocation.value.address || `${currentLocation.value.latitude.toFixed(6)}, ${currentLocation.value.longitude.toFixed(6)}`
})

const updateTime = computed(() => {
  if (!currentLocation.value.updateTime) return '未知'
  const date = new Date(currentLocation.value.updateTime.replace('T', ' '))
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
})

const goBack = () => {
  stopLocationSharing()
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

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    elderlyId.value = user.elderlyId || user.id
  }
}

const getCurrentLocation = () => {
  return new Promise<void>((resolve) => {
    uni.getLocation({
      type: 'gcj02',
      enableHighAccuracy: true,
      geocode: false,
      timeout: 10000,
      success: async (res) => {
        console.log('Location success:', res)
        const address = await getAddressFromCoords(res.longitude, res.latitude)
        currentLocation.value = {
          latitude: res.latitude,
          longitude: res.longitude,
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
          address: address
        }
        updateMapMarker()
        resolve()
      },
      fail: (err) => {
        console.log('High accuracy location failed:', err)
        uni.getLocation({
          type: 'gcj02',
          enableHighAccuracy: false,
          geocode: false,
          success: async (res) => {
            console.log('Low accuracy location success:', res)
            const address = await getAddressFromCoords(res.longitude, res.latitude)
            currentLocation.value = {
              latitude: res.latitude,
              longitude: res.longitude,
              updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
              address: address
            }
            updateMapMarker()
            resolve()
          },
          fail: (err2) => {
            console.log('Low accuracy location also failed:', err2)
            uni.showToast({ title: '定位失败，请检查权限或使用真机', icon: 'none', duration: 3000 })
            resolve()
          }
        })
      }
    })
  })
}

const uploadLocation = async () => {
  if (!elderlyId.value || !currentLocation.value.latitude) return

  try {
    await post('/location', {
      elderlyId: elderlyId.value,
      latitude: currentLocation.value.latitude,
      longitude: currentLocation.value.longitude
    })
  } catch (error) {
    console.error('Upload location failed:', error)
  }
}

const startLocationSharing = async () => {
  await getCurrentLocation()
  await uploadLocation()

  isSharing.value = true

  locationTimer = setInterval(async () => {
    await getCurrentLocation()
    await uploadLocation()
  }, 30000) as unknown as number
}

const stopLocationSharing = () => {
  if (locationTimer) {
    clearInterval(locationTimer)
    locationTimer = null
  }
  isSharing.value = false
}

const toggleSharing = async () => {
  if (isSharing.value) {
    stopLocationSharing()
    uni.showToast({ title: '已停止位置共享', icon: 'success' })
  } else {
    await startLocationSharing()
    uni.showToast({ title: '已开始位置共享', icon: 'success' })
  }
}

const loadLatestLocation = async () => {
  if (!elderlyId.value) return

  try {
    const result = await get(`/location/elderly/${elderlyId.value}`)
    if (result.code === 200 && result.data) {
      currentLocation.value = {
        latitude: result.data.latitude,
        longitude: result.data.longitude,
        updateTime: result.data.updateTime,
        address: result.data.address
      }
    }
  } catch (error) {
    console.error('Load location failed:', error)
  }
}

const emergencyCall = () => {
  if (!elderlyId.value) {
    uni.showToast({ title: '无法发送求助', icon: 'none' })
    return
  }

  uni.showModal({
    title: '紧急求助',
    content: '确认要发送紧急求助信号吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await post('/alarm/emergency', {
            elderlyId: elderlyId.value
          })
          if (result.code === 200) {
            uni.showToast({ title: '求助信号已发送', icon: 'success' })
          }
        } catch (error) {
          console.error('Emergency call failed:', error)
        }
      }
    }
  })
}

onMounted(() => {
  loadUser()
  loadLatestLocation()
  
  nextTick(() => {
    uni.createWebViewContext('locationWebView')
  })
})

onUnmounted(() => {
  stopLocationSharing()
})

watch(currentLocation, () => {
  mapKey.value++
}, { deep: true })
</script>

<style lang="scss" scoped>
.location-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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

.location-info {
  margin: 20rpx;
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

.status-section {
  margin: 20rpx;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.status-item.active {
  background: #f6ffed;
  border: 2rpx solid #52c41a;
}

.status-icon {
  font-size: 36rpx;
}

.status-text {
  font-size: 28rpx;
  color: #666;
}

.status-item.active .status-text {
  color: #52c41a;
  font-weight: bold;
}

.action-buttons {
  margin: 20rpx;
}

.share-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  border: 2rpx solid #52c41a;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn.active {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border: none;
}

.btn-text {
  font-size: 32rpx;
  color: #52c41a;
}

.share-btn.active .btn-text {
  color: #fff;
}

.emergency-btn {
  position: fixed;
  bottom: 200rpx;
  right: 40rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 77, 79, 0.4);
  z-index: 100;
}

.emergency-icon {
  font-size: 48rpx;
}

.emergency-text {
  font-size: 22rpx;
  color: #fff;
  margin-top: 4rpx;
}
</style>