<template>
  <view class="home-container">
    <view class="header">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="user-text">
          <text class="greeting">您好，{{ user?.nickname || user?.username }}</text>
          <text class="date">{{ currentDate }}</text>
        </view>
      </view>
    </view>

    <view class="elderly-selector" v-if="isGuardian && bindElderlyList.length > 0">
      <view class="selector-header">
        <text class="selector-label">选择监护老人</text>
      </view>
      <scroll-view scroll-x class="elderly-scroll">
        <view class="elderly-tabs">
          <view
            class="elderly-tab"
            :class="{ active: selectedElderlyId === elderly.elderlyId }"
            v-for="elderly in bindElderlyList"
            :key="elderly.elderlyId"
            @click="selectElderly(elderly)"
          >
            <text class="elderly-tab-icon">👴</text>
            <text class="elderly-tab-name">{{ elderly.nickname }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="quick-actions">
      <view class="action-item" @click="goMap">
        <view class="action-icon map-icon">📍</view>
        <text class="action-text">实时定位</text>
      </view>
      <view class="action-item" @click="goHealth">
        <view class="action-icon health-icon">❤️</view>
        <text class="action-text">健康数据</text>
      </view>
      <view class="action-item" @click="goAlarm">
        <view class="action-icon alarm-icon">🔔</view>
        <text class="action-text">告警中心</text>
        <view class="badge" v-if="unhandledAlarmCount > 0">{{ unhandledAlarmCount }}</view>
      </view>
      <view class="action-item" @click="goFence">
        <view class="action-icon fence-icon">🏠</view>
        <text class="action-text">电子围栏</text>
      </view>
    </view>

    <view class="health-section" v-if="latestHealthData">
      <view class="section-header">
        <text class="section-title">{{ isGuardian ? selectedElderly?.nickname + '的' : '我的' }}最新健康数据</text>
      </view>
      <view class="health-card">
        <view class="health-item">
          <view class="health-icon-box heart">❤️</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.heartRate }}<text class="unit">次/分</text></text>
            <text class="health-label">心率</text>
          </view>
        </view>
        <view class="health-item">
          <view class="health-icon-box pressure">💉</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.systolicPressure }}/{{ latestHealthData.diastolicPressure }}<text class="unit">mmHg</text></text>
            <text class="health-label">血压</text>
          </view>
        </view>
        <view class="health-item">
          <view class="health-icon-box temp">🌡️</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.temperature }}<text class="unit">℃</text></text>
            <text class="health-label">体温</text>
          </view>
        </view>
        <view class="health-item">
          <view class="health-icon-box sleep">😴</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.sleepDuration }}<text class="unit">小时</text></text>
            <text class="health-label">睡眠</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else-if="isGuardian && bindElderlyList.length === 0">
      <text class="empty-icon">👵</text>
      <text class="empty-text">暂无监护老人</text>
      <text class="empty-btn" @click="goBinding">立即绑定</text>
    </view>

    <view class="empty-state" v-else-if="!isGuardian && !latestHealthData">
      <text class="empty-icon">📊</text>
      <text class="empty-text">暂无健康数据</text>
    </view>

    <view class="emergency-btn" @click="emergencyCall" v-if="!isGuardian">
      <text class="emergency-icon">🆘</text>
      <text class="emergency-text">紧急求助</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'

interface User {
  userId: number
  username: string
  nickname: string
  userType: string
}

interface BindElderly {
  id: number
  elderlyId: number
  userId: number
  nickname: string
  phone: string
}

interface HealthData {
  heartRate: number
  systolicPressure: number
  diastolicPressure: number
  temperature: number
  sleepDuration: number
}

const user = ref<User | null>(null)
const bindElderlyList = ref<BindElderly[]>([])
const selectedElderly = ref<BindElderly | null>(null)
const selectedElderlyId = ref<number | null>(null)
const latestHealthData = ref<HealthData | null>(null)
const unhandledAlarmCount = ref(0)
const isGuardian = ref(false)
const myElderlyId = ref<number | null>(null)

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
    isGuardian.value = user.value?.userType === 'guardian'
  }
}

const loadBindings = async () => {
  if (isGuardian.value) {
    try {
      const result = await get('/binding/guardian/list')
      console.log('Guardian bindings:', result)
      if (result.code === 200 && result.data && result.data.length > 0) {
        bindElderlyList.value = result.data
        selectElderly(bindElderlyList.value[0])
      }
    } catch (error) {
      console.error('Load bindings failed:', error)
    }
  } else {
    try {
      const result = await get('/binding/my-elderly')
      console.log('My elderly info:', result)
      if (result.code === 200 && result.data) {
        myElderlyId.value = result.data.id
        await loadMyHealthData()
        await loadMyAlarmCount()
      }
    } catch (error) {
      console.error('Load my elderly failed:', error)
    }
  }
}

const selectElderly = (elderly: BindElderly) => {
  selectedElderly.value = elderly
  selectedElderlyId.value = elderly.elderlyId
  uni.setStorageSync('selectedElderly', JSON.stringify(elderly))
  loadElderlyHealthData(elderly.elderlyId)
  loadElderlyAlarmCount(elderly.elderlyId)
}

const loadElderlyHealthData = async (elderlyId: number) => {
  try {
    const result = await get(`/health/elderly/${elderlyId}/latest`)
    console.log('Health data:', result)
    if (result.code === 200) {
      latestHealthData.value = result.data
    }
  } catch (error) {
    console.error('Load health data failed:', error)
    latestHealthData.value = null
  }
}

const loadElderlyAlarmCount = async (elderlyId: number) => {
  try {
    const result = await get(`/alarm/elderly/${elderlyId}/unhandled`)
    if (result.code === 200) {
      unhandledAlarmCount.value = result.data?.length || 0
    }
  } catch (error) {
    console.error('Load alarm count failed:', error)
    unhandledAlarmCount.value = 0
  }
}

const loadMyHealthData = async () => {
  if (!myElderlyId.value) return

  try {
    const result = await get(`/health/elderly/${myElderlyId.value}/latest`)
    console.log('My health data:', result)
    if (result.code === 200) {
      latestHealthData.value = result.data
    }
  } catch (error) {
    console.error('Load my health data failed:', error)
    latestHealthData.value = null
  }
}

const loadMyAlarmCount = async () => {
  if (!myElderlyId.value) return

  try {
    const result = await get(`/alarm/elderly/${myElderlyId.value}/unhandled`)
    if (result.code === 200) {
      unhandledAlarmCount.value = result.data?.length || 0
    }
  } catch (error) {
    console.error('Load my alarm count failed:', error)
    unhandledAlarmCount.value = 0
  }
}

const goMap = () => {
  uni.switchTab({ url: '/pages/map/index' })
}

const goHealth = () => {
  uni.switchTab({ url: '/pages/health/index' })
}

const goAlarm = () => {
  uni.switchTab({ url: '/pages/alarm/index' })
}

const goFence = () => {
  uni.navigateTo({ url: '/pages/fence/index' })
}

const goBinding = () => {
  uni.navigateTo({ url: '/pages/binding/index' })
}

const emergencyCall = () => {
  const targetId = myElderlyId.value

  if (!targetId) {
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
            elderlyId: targetId,
            latitude: 39.9042,
            longitude: 116.4074
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
  loadBindings()
})

onShow(() => {
  loadUser()
  if (isGuardian.value) {
    loadBindings()
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.header {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 50rpx;
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.greeting {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
}

.date {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.elderly-selector {
  margin: -30rpx 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.selector-header {
  margin-bottom: 16rpx;
}

.selector-label {
  font-size: 26rpx;
  color: #999;
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
  padding: 16rpx 24rpx;
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
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.elderly-tab-name {
  font-size: 24rpx;
  color: #333;
}

.quick-actions {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.action-item {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  position: relative;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.map-icon {
  background: #e6f7ff;
}

.health-icon {
  background: #fff1f0;
}

.alarm-icon {
  background: #fff7e6;
}

.fence-icon {
  background: #f6ffed;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}

.badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
}

.health-section {
  padding: 0 20rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.health-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  flex-wrap: wrap;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.health-item {
  width: 50%;
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.health-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.health-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.health-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.unit {
  font-size: 22rpx;
  color: #999;
  font-weight: normal;
  margin-left: 6rpx;
}

.health-label {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  margin: 40rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-btn {
  font-size: 28rpx;
  color: #1989fa;
  padding: 16rpx 40rpx;
  border: 2rpx solid #1989fa;
  border-radius: 40rpx;
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
  font-size: 20rpx;
  color: #fff;
  margin-top: 4rpx;
}
</style>