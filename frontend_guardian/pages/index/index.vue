<template>
  <view class="home-container">
    <view class="header">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="user-text">
          <text class="greeting">您好，{{ user?.nickname || '监护人' }}</text>
          <text class="date">{{ currentDate }}</text>
        </view>
      </view>
    </view>

    <view class="elderly-selector" v-if="bindElderlyList.length > 0">
      <text class="selector-label">当前查看：</text>
      <picker
        mode="selector"
        :range="bindElderlyList"
        range-key="elderlyName"
        @change="onElderlyChange"
      >
        <view class="picker-btn">
          <text>{{ selectedElderly?.elderlyName || '请选择老人' }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </picker>
    </view>

    <view class="empty-state" v-if="bindElderlyList.length === 0">
      <text class="empty-icon">👴</text>
      <text class="empty-text">暂无绑定老人</text>
      <button class="bind-btn" @click="goBind">添加绑定</button>
    </view>

    <view class="health-section" v-if="selectedElderly && latestHealthData">
      <view class="section-header">
        <text class="section-title">{{ selectedElderly.elderlyName }}的健康数据</text>
      </view>
      <view class="health-card">
        <view class="health-item">
          <view class="health-icon-box heart">🫀</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.heartRate ?? '--' }}<text class="unit">bpm</text></text>
            <text class="health-label">心率</text>
          </view>
        </view>
        <view class="health-item">
          <view class="health-icon-box pressure">💉</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.systolicPressure ?? '--' }}/{{ latestHealthData.diastolicPressure ?? '--' }}<text class="unit">mmHg</text></text>
            <text class="health-label">血压</text>
          </view>
        </view>
        <view class="health-item">
          <view class="health-icon-box temp">🌡️</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.temperature ?? '--' }}<text class="unit">℃</text></text>
            <text class="health-label">体温</text>
          </view>
        </view>
        <view class="health-item">
          <view class="health-icon-box steps">👟</view>
          <view class="health-info">
            <text class="health-value">{{ latestHealthData.steps ?? '--' }}<text class="unit">步</text></text>
            <text class="health-label">步数</text>
          </view>
        </view>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action-item" @click="goLocation">
        <text class="action-icon">📍</text>
        <text class="action-text">实时位置</text>
      </view>
      <view class="action-item" @click="goHistory">
        <text class="action-icon">📜</text>
        <text class="action-text">历史轨迹</text>
      </view>
      <view class="action-item" @click="goFence">
        <text class="action-icon">🏠</text>
        <text class="action-text">电子围栏</text>
      </view>
      <view class="action-item" @click="goHealth">
        <text class="action-icon">📊</text>
        <text class="action-text">健康详情</text>
      </view>
      <view class="action-item" @click="goAlarm">
        <text class="action-icon">🔔</text>
        <text class="action-text">告警记录</text>
      </view>
      <view class="action-item" @click="goBind">
        <text class="action-icon">🔗</text>
        <text class="action-text">绑定管理</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface User {
  userId: number
  username: string
  nickname: string
  userType: string
}

interface BindElderly {
  elderlyId: number
  elderlyName: string
  nickname: string
}

interface HealthData {
  heartRate: number | null
  systolicPressure: number | null
  diastolicPressure: number | null
  temperature: number | null
  steps: number | null
  sleepDuration: number | null
}

const user = ref<User | null>(null)
const bindElderlyList = ref<BindElderly[]>([])
const selectedElderly = ref<BindElderly | null>(null)
const latestHealthData = ref<HealthData | null>(null)

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
  }
}

const loadBindings = async () => {
  if (!user.value?.userId) return

  try {
    const result = await get(`/binding/guardian/list`)
    if (result.code === 200 && result.data) {
      bindElderlyList.value = result.data
      if (bindElderlyList.value.length > 0 && !selectedElderly.value) {
        selectedElderly.value = bindElderlyList.value[0]
        loadHealthData()
      }
    }
  } catch (error) {
    console.error('Load bindings failed:', error)
  }
}

const loadHealthData = async () => {
  if (!selectedElderly.value?.elderlyId) return

  try {
    const result = await get(`/health/elderly/${selectedElderly.value.elderlyId}/latest`)
    if (result.code === 200 && result.data) {
      latestHealthData.value = result.data
    }
  } catch (error) {
    console.error('Load health data failed:', error)
  }
}

const onElderlyChange = (e: any) => {
  const index = e.detail.value
  selectedElderly.value = bindElderlyList.value[index]
  loadHealthData()
}

const goLocation = () => {
  if (!selectedElderly.value) {
    uni.showToast({ title: '请先选择老人', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/location/index?elderlyId=${selectedElderly.value.elderlyId}` })
}

const goHistory = () => {
  if (!selectedElderly.value) {
    uni.showToast({ title: '请先选择老人', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/location/history?elderlyId=${selectedElderly.value.elderlyId}&nickname=${encodeURIComponent(selectedElderly.value.nickname)}` })
}

const goHealth = () => {
  if (!selectedElderly.value) {
    uni.showToast({ title: '请先选择老人', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/health/index?elderlyId=${selectedElderly.value.elderlyId}` })
}

const goAlarm = () => {
  uni.switchTab({ url: '/pages/alarm/index' })
}

const goBind = () => {
  uni.navigateTo({ url: '/pages/bind/index' })
}

const goFence = () => {
  uni.navigateTo({ url: '/pages/fence/index' })
}

onMounted(() => {
  loadUser()
  loadBindings()
})

onShow(() => {
  loadUser()
  loadBindings()
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
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
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.selector-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 15rpx;
}

.picker-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx 30rpx;
  background: #f0f0f0;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  font-size: 20rpx;
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
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 30rpx;
}

.bind-btn {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  color: #fff;
  font-size: 28rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

.health-section {
  padding: 20rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.health-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  flex-wrap: wrap;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.health-item {
  width: 50%;
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.health-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.health-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.health-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.unit {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
  margin-left: 6rpx;
}

.health-label {
  font-size: 26rpx;
  color: #999;
}

.quick-actions {
  padding: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.action-item {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 44rpx;
}

.action-text {
  font-size: 30rpx;
  color: #333;
}
</style>