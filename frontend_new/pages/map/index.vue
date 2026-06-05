<template>
  <view class="map-container">
    <view class="custom-navbar">
      <text class="navbar-title">实时定位</text>
    </view>

    <view class="elderly-selector-map" v-if="isGuardian && bindElderlyList.length > 0">
      <scroll-view scroll-x class="elderly-scroll">
        <view class="elderly-tabs">
          <view
            class="elderly-tab"
            :class="{ active: selectedElderlyId === elderly.id }"
            v-for="elderly in bindElderlyList"
            :key="elderly.id"
            @click="selectElderly(elderly)"
          >
            <text class="elderly-tab-icon">{{ elderly.gender === 0 ? '👴' : '👵' }}</text>
            <text class="elderly-tab-name">{{ elderly.nickname }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <map-container
      :latitude="latitude"
      :longitude="longitude"
      :markers="markers"
      :zoom="16"
      @markerTap="onMarkerTap"
      @mapClick="onMapClick"
    />

    <view class="location-info" v-if="locationData">
      <view class="info-header">
        <text class="elderly-name">{{ elderlyName }}的位置</text>
        <text class="update-time">更新时间：{{ formatTime(locationData.updateTime) }}</text>
      </view>
      <view class="address">📍 {{ locationData.address || '地址获取中...' }}</view>
      <view class="coords">
        <text>纬度：{{ locationData.latitude.toFixed(6) }}</text>
        <text>经度：{{ locationData.longitude.toFixed(6) }}</text>
      </view>
    </view>

    <view class="refresh-btn" @click="refreshLocation">
      <text class="refresh-icon">🔄</text>
      <text class="refresh-text">刷新定位</text>
    </view>

    <view class="emergency-btn-map" @click="emergencyCall">
      <text class="emergency-icon">🆘</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { get } from '@/utils/request'
import mapContainer from '@/components/map-container/index.vue'

interface LocationData {
  latitude: number
  longitude: number
  address: string
  updateTime: string
}

interface BindElderly {
  id: number
  nickname: string
  phone: string
  gender: number
}

interface User {
  userId: number
  username: string
  nickname: string
}

const latitude = ref(39.9042)
const longitude = ref(116.4074)
const locationData = ref<LocationData | null>(null)
const bindElderlyList = ref<BindElderly[]>([])
const selectedElderly = ref<BindElderly | null>(null)
const selectedElderlyId = ref<number | null>(null)
const isGuardian = ref(false)
const user = ref<User | null>(null)

const elderlyName = computed(() => {
  if (isGuardian.value && selectedElderly.value) {
    return selectedElderly.value.nickname
  }
  return user.value?.nickname || user.value?.username || '老人'
})

const markers = computed(() => {
  if (!locationData.value) return []
  return [{
    id: 1,
    latitude: locationData.value.latitude,
    longitude: locationData.value.longitude,
    title: elderlyName.value
  }]
})

const formatTime = (timeStr: string) => {
  if (!timeStr) return '未知'
  return timeStr.replace('T', ' ')
}

const loadLocation = async (elderlyId: number) => {
  try {
    const result = await get(`/location/elderly/${elderlyId}`)
    locationData.value = result.data
    latitude.value = result.data.latitude
    longitude.value = result.data.longitude
  } catch (error) {
    console.error('Load location failed:', error)
  }
}

const loadBindings = async () => {
  try {
    const guardianResult = await get('/binding/guardian')
    if (guardianResult.data && guardianResult.data.length > 0) {
      isGuardian.value = true
      bindElderlyList.value = guardianResult.data.map((item: any) => ({
        id: item.elderlyId,
        nickname: item.elderlyNickname,
        phone: item.elderlyPhone,
        gender: 0
      }))
      
      const stored = uni.getStorageSync('selectedElderly')
      if (stored) {
        const storedElderly = JSON.parse(stored)
        const existing = bindElderlyList.value.find(e => e.id === storedElderly.id)
        if (existing) {
          selectElderly(existing)
          return
        }
      }
      
      if (bindElderlyList.value.length > 0) {
        selectElderly(bindElderlyList.value[0])
      }
    } else {
      isGuardian.value = false
      if (user.value) {
        await loadLocation(user.value.userId)
      }
    }
  } catch (error) {
    console.error('Load bindings failed:', error)
    isGuardian.value = false
    if (user.value) {
      await loadLocation(user.value.userId)
    }
  }
}

const selectElderly = (elderly: BindElderly) => {
  selectedElderly.value = elderly
  selectedElderlyId.value = elderly.id
  uni.setStorageSync('selectedElderly', JSON.stringify(elderly))
  loadLocation(elderly.id)
}

const refreshLocation = async () => {
  uni.showLoading({ title: '刷新中...' })
  
  if (isGuardian.value && selectedElderlyId.value) {
    await loadLocation(selectedElderlyId.value)
  } else if (user.value) {
    await loadLocation(user.value.userId)
  }
  
  uni.hideLoading()
  uni.showToast({ title: '刷新成功', icon: 'success' })
}

const emergencyCall = () => {
  const targetId = isGuardian.value && selectedElderlyId.value ? selectedElderlyId.value : (user.value?.userId || 0)
  
  if (!targetId) {
    uni.showToast({ title: '请先添加监护老人', icon: 'none' })
    return
  }
  
  uni.showModal({
    title: '紧急求助',
    content: '确认要发送紧急求助信号吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.request({
            url: 'http://10.200.195.245:8080/api/alarm/emergency',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${uni.getStorageSync('token')}`
            },
            data: {
              elderlyId: targetId,
              latitude: latitude.value,
              longitude: longitude.value
            },
            success: () => {
              uni.showToast({ title: '求助信号已发送', icon: 'success' })
            }
          })
        } catch (error) {
          console.error('Emergency call failed:', error)
        }
      }
    }
  })
}

const onMarkerTap = (marker: any) => {
  console.log('Marker tapped:', marker)
}

const onMapClick = (e: any) => {
  console.log('Map clicked:', e)
}

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
}

onMounted(() => {
  loadUser()
  loadBindings()
})
</script>

<style lang="scss" scoped>
.map-container {
  height: 100vh;
  position: relative;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.navbar-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.elderly-selector-map {
  position: fixed;
  top: 100rpx;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 16rpx 20rpx;
  z-index: 99;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.elderly-scroll {
  white-space: nowrap;
}

.elderly-tabs {
  display: inline-flex;
  gap: 20rpx;
}

.elderly-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  transition: all 0.3s;

  &.active {
    background: #1989fa;

    .elderly-tab-name {
      color: #fff;
    }
  }
}

.elderly-tab-icon {
  font-size: 40rpx;
  margin-bottom: 6rpx;
}

.elderly-tab-name {
  font-size: 24rpx;
  color: #333;
}

.location-info {
  position: fixed;
  bottom: 200rpx;
  left: 20rpx;
  right: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.elderly-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.update-time {
  font-size: 24rpx;
  color: #999;
}

.address {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.coords {
  display: flex;
  gap: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.refresh-btn {
  position: fixed;
  top: 180rpx;
  right: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 98;
}

.refresh-icon {
  font-size: 28rpx;
}

.refresh-text {
  font-size: 26rpx;
  color: #666;
}

.emergency-btn-map {
  position: fixed;
  bottom: 200rpx;
  right: 20rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 77, 79, 0.4);
}

.emergency-icon {
  font-size: 44rpx;
}
</style>