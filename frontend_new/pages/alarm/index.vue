<template>
  <view class="alarm-container">
    <view class="elderly-tabs" v-if="isGuardian && bindElderlyList.length > 0">
      <scroll-view scroll-x class="tabs-scroll">
        <view class="tabs-inner">
          <view
            v-for="elderly in bindElderlyList"
            :key="elderly.id"
            :class="['tab-item', { active: selectedElderlyId === elderly.id }]"
            @click="selectElderly(elderly)"
          >
            <text class="tab-text">{{ elderly.nickname }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <view class="alarm-header">
      <view class="alarm-summary">
        <view class="summary-item">
          <text class="summary-num">{{ alarmList.length }}</text>
          <text class="summary-label">全部告警</text>
        </view>
        <view class="summary-item highlight">
          <text class="summary-num">{{ unhandledCount }}</text>
          <text class="summary-label">待处理</text>
        </view>
      </view>
    </view>
    
    <view class="alarm-list" v-if="alarmList.length > 0">
      <view 
        class="alarm-item" 
        :class="{ unhandled: alarm.status === 0 }"
        v-for="alarm in alarmList" 
        :key="alarm.id"
      >
        <view class="alarm-icon">
          <text>{{ alarm.type === 1 ? '🆘' : '⚠️' }}</text>
        </view>
        <view class="alarm-content">
          <view class="alarm-title">
            <text class="type-text">{{ alarm.type === 1 ? '紧急求助' : '电子围栏' }}</text>
            <text class="status-tag" :class="{ handled: alarm.status === 1 }">
              {{ alarm.status === 0 ? '待处理' : '已处理' }}
            </text>
          </view>
          <text class="alarm-message">{{ alarm.message }}</text>
          <view class="alarm-footer">
            <text class="alarm-time">{{ formatTime(alarm.createdAt) }}</text>
            <text class="alarm-location" v-if="alarm.latitude">📍 {{ alarm.latitude }}, {{ alarm.longitude }}</text>
          </view>
        </view>
        <view class="alarm-action" v-if="alarm.status === 0">
          <text class="action-btn" @click="handleAlarm(alarm.id)">处理</text>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <text class="empty-icon">✅</text>
      <text class="empty-text">暂无告警信息</text>
      <text class="empty-hint">老人一切安好，无需担心</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { get, put } from '@/utils/request'

interface Alarm {
  id: number
  elderlyId: number
  type: number
  status: number
  message: string
  latitude: number
  longitude: number
  createdAt: string
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

const alarmList = ref<Alarm[]>([])
const bindElderlyList = ref<BindElderly[]>([])
const selectedElderly = ref<BindElderly | null>(null)
const selectedElderlyId = ref<number | null>(null)
const isGuardian = ref(false)
const user = ref<User | null>(null)

const unhandledCount = computed(() => {
  return alarmList.value.filter(a => a.status === 0).length
})

const formatTime = (timeStr: string) => {
  if (!timeStr) return '未知'
  const date = new Date(timeStr.replace('T', ' '))
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
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
      if (bindElderlyList.value.length > 0) {
        selectElderly(bindElderlyList.value[0])
      }
    } else {
      isGuardian.value = false
      await loadMyAlarms()
    }
  } catch (error) {
    console.error('Load bindings failed:', error)
    isGuardian.value = false
    await loadMyAlarms()
  }
}

const selectElderly = (elderly: BindElderly) => {
  selectedElderly.value = elderly
  selectedElderlyId.value = elderly.id
  uni.setStorageSync('selectedElderly', JSON.stringify(elderly))
  loadElderlyAlarms(elderly.id)
}

const loadElderlyAlarms = async (elderlyId: number) => {
  try {
    const result = await get(`/alarm/elderly/${elderlyId}`)
    alarmList.value = result.data
  } catch (error) {
    console.error('Load alarms failed:', error)
    alarmList.value = []
  }
}

const loadMyAlarms = async () => {
  if (!user.value) return
  
  try {
    const result = await get(`/alarm/elderly/${user.value.userId}`)
    alarmList.value = result.data
  } catch (error) {
    console.error('Load alarms failed:', error)
    alarmList.value = []
  }
}

const handleAlarm = async (id: number) => {
  try {
    await put(`/alarm/${id}/handle`)
    uni.showToast({ title: '处理成功', icon: 'success' })
    const targetId = isGuardian.value && selectedElderlyId.value ? selectedElderlyId.value : (user.value?.userId || 0)
    if (targetId) {
      await loadElderlyAlarms(targetId)
    }
  } catch (error) {
    console.error('Handle alarm failed:', error)
  }
}

onMounted(() => {
  loadUser()
  loadBindings()
})
</script>

<style lang="scss" scoped>
.alarm-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.elderly-tabs {
  background: #fff;
  padding: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-inner {
  display: inline-flex;
  gap: 20rpx;
  padding: 0 20rpx;
}

.tab-item {
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  background: #f5f5f5;
  transition: all 0.3s;
  
  &.active {
    background: #ff4d4f;
    
    .tab-text {
      color: #fff;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  color: #333;
}

.alarm-header {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  color: #fff;
}

.alarm-summary {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  text-align: center;
}

.summary-num {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
}

.summary-label {
  font-size: 26rpx;
  opacity: 0.9;
  display: block;
  margin-top: 8rpx;
}

.summary-item.highlight .summary-num {
  color: #ffeb3b;
}

.alarm-list {
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.alarm-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.alarm-item.unhandled {
  border-left: 6rpx solid #ff4d4f;
}

.alarm-icon {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.alarm-content {
  flex: 1;
}

.alarm-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.type-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  background: #fff1f0;
  color: #ff4d4f;
  border-radius: 20rpx;
}

.status-tag.handled {
  background: #f6ffed;
  color: #52c41a;
}

.alarm-message {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.alarm-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.alarm-time {
  font-size: 24rpx;
  color: #999;
}

.alarm-location {
  font-size: 24rpx;
  color: #999;
}

.alarm-action {
  display: flex;
  align-items: center;
}

.action-btn {
  font-size: 26rpx;
  color: #1989fa;
  padding: 12rpx 24rpx;
  border: 2rpx solid #1989fa;
  border-radius: 30rpx;
}

.empty-state {
  background: #fff;
  border-radius: 16rpx;
  padding: 80rpx 40rpx;
  margin: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #999;
}
</style>