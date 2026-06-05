<template>
  <view class="history-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">历史轨迹</text>
      </view>
      <text class="subtitle">{{ elderlyInfo?.nickname || '老人' }}的活动轨迹</text>
    </view>

    <view class="date-selector">
      <view class="date-tabs">
        <view
          v-for="date in dateOptions"
          :key="date.value"
          class="date-tab"
          :class="{ active: selectedDate === date.value }"
          @click="selectDate(date.value)"
        >
          <text class="tab-text">{{ date.label }}</text>
        </view>
      </view>
    </view>

    <view class="map-area">
      <web-view
        ref="webview"
        :src="trackUrl"
        :key="mapKey"
        @message="onWebviewMessage"
        @load="onWebviewLoad"
      ></web-view>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <text class="stat-value">{{ totalPoints }}</text>
        <text class="stat-label">记录点数</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ distance }}km</text>
        <text class="stat-label">移动距离</text>
      </view>
      <view class="stat-card">
        <text class="stat-value">{{ duration }}</text>
        <text class="stat-label">活动时长</text>
      </view>
    </view>

    <view class="location-list">
      <view class="list-header">
        <text class="list-title">位置记录</text>
        <text class="list-count">{{ locationList.length }}条</text>
      </view>
      <scroll-view scroll-y class="list-body">
        <view class="list-item" v-for="(item, index) in locationList" :key="index">
          <view class="item-time">
            <text class="time-text">{{ formatTime(item.updateTime) }}</text>
          </view>
          <view class="item-info">
            <text class="item-address">{{ item.address || '未知位置' }}</text>
            <text class="item-coord">{{ item.latitude.toFixed(6) }}, {{ item.longitude.toFixed(6) }}</text>
          </view>
        </view>
        <view class="empty-list" v-if="locationList.length === 0">
          <text>暂无位置记录</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface LocationData {
  latitude: number
  longitude: number
  updateTime: string
  address?: string
}

interface ElderlyInfo {
  elderlyId: number
  nickname: string
}

const elderlyId = ref<number | null>(null)
const elderlyInfo = ref<ElderlyInfo | null>(null)
const selectedDate = ref('today')
const locationList = ref<LocationData[]>([])

const webview = ref<any>(null)
let webviewReady = false
const mapKey = ref(0)

const dateOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '近7天', value: 'week' }
]

const totalPoints = computed(() => locationList.value.length)

const distance = computed(() => {
  if (locationList.value.length < 2) return '0'

  let total = 0
  for (let i = 1; i < locationList.value.length; i++) {
    const prev = locationList.value[i - 1]
    const curr = locationList.value[i]
    total += calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
  }
  return (total / 1000).toFixed(2)
})

const duration = computed(() => {
  if (locationList.value.length < 2) return '0分钟'

  const first = new Date(locationList.value[0].updateTime.replace('T', ' '))
  const last = new Date(locationList.value[locationList.value.length - 1].updateTime.replace('T', ' '))
  const diff = Math.floor((last.getTime() - first.getTime()) / 1000 / 60)

  if (diff < 60) return `${diff}分钟`
  const hours = Math.floor(diff / 60)
  const mins = diff % 60
  return `${hours}小时${mins}分钟`
})

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
}

const goBack = () => {
  uni.navigateBack()
}

const onWebviewLoad = () => {
  console.log('Webview loaded')
}

const onWebviewMessage = (e: any) => {
  const data = e.detail.data[0]
  if (data && data.type === 'mapReady') {
    webviewReady = true
    loadHistory()
  }
}

const selectDate = (date: string) => {
  selectedDate.value = date
  loadHistory()
}

const loadHistory = async () => {
  if (!elderlyId.value) return

  try {
    uni.showLoading({ title: '加载中...' })

    let url = ''
    if (selectedDate.value === 'today') {
      url = `/location/elderly/${elderlyId.value}/today`
    } else {
      url = `/location/elderly/${elderlyId.value}/history`
    }

    const result = await get(url)
    if (result.code === 200 && result.data) {
      locationList.value = result.data
      mapKey.value++
    } else {
      locationList.value = []
    }
  } catch (error) {
    console.error('Load history failed:', error)
    locationList.value = []
  } finally {
    uni.hideLoading()
  }
}

const trackUrl = computed(() => {
  if (locationList.value.length === 0) {
    return '/static/tianditu.html'
  }

  const points = locationList.value.map(loc => ({
    lat: loc.latitude,
    lng: loc.longitude
  }))

  return `/static/tianditu.html?track=${encodeURIComponent(JSON.stringify(points))}`
})

onLoad((options: any) => {
  if (options.elderlyId) {
    elderlyId.value = parseInt(options.elderlyId)
  }
  if (options.nickname) {
    elderlyInfo.value = {
      elderlyId: elderlyId.value,
      nickname: options.nickname
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
})
</script>

<style lang="scss" scoped>
.history-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 300rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
  padding: 80rpx 40rpx 40rpx;
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

.date-selector {
  margin: 20rpx;
}

.date-tabs {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.date-tab {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  border-radius: 12rpx;
}

.date-tab.active {
  background: #1890ff;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.date-tab.active .tab-text {
  color: #fff;
}

.map-area {
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  height: 500rpx;
}

web-view {
  width: 100%;
  height: 100%;
}

.stats-section {
  display: flex;
  margin: 20rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #1890ff;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.location-list {
  margin: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.list-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.list-count {
  font-size: 24rpx;
  color: #999;
}

.list-body {
  max-height: 400rpx;
}

.list-item {
  display: flex;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.list-item:last-child {
  border-bottom: none;
}

.item-time {
  width: 140rpx;
}

.time-text {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

.item-info {
  flex: 1;
}

.item-address {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.item-coord {
  font-size: 22rpx;
  color: #999;
}

.empty-list {
  padding: 60rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}
</style>