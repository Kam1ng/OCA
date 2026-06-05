<template>
  <view class="health-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">健康数据</text>
      </view>
      <text class="subtitle">{{ elderlyInfo?.nickname || '老人' }}的健康记录</text>
    </view>

    <view class="tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'heart' }"
        @click="activeTab = 'heart'"
      >
        心率
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'pressure' }"
        @click="activeTab = 'pressure'"
      >
        血压
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'steps' }"
        @click="activeTab = 'steps'"
      >
        步数
      </view>
    </view>

    <view class="content-area">
      <view class="chart-placeholder" v-if="activeTab === 'heart'">
        <text class="chart-icon">🫀</text>
        <text class="chart-title">心率趋势</text>
        <view class="data-list">
          <view class="data-item" v-for="item in heartRateList" :key="item.id">
            <text class="data-time">{{ formatTime(item.recordTime) }}</text>
            <text class="data-value">{{ item.heartRate }} bpm</text>
          </view>
        </view>
      </view>

      <view class="chart-placeholder" v-if="activeTab === 'pressure'">
        <text class="chart-icon">💉</text>
        <text class="chart-title">血压趋势</text>
        <view class="data-list">
          <view class="data-item" v-for="item in pressureList" :key="item.id">
            <text class="data-time">{{ formatTime(item.recordTime) }}</text>
            <text class="data-value">{{ item.systolicPressure }}/{{ item.diastolicPressure }} mmHg</text>
          </view>
        </view>
      </view>

      <view class="chart-placeholder" v-if="activeTab === 'steps'">
        <text class="chart-icon">👟</text>
        <text class="chart-title">步数统计</text>
        <view class="data-list">
          <view class="data-item" v-for="item in stepsList" :key="item.id">
            <text class="data-time">{{ formatDate(item.recordTime) }}</text>
            <text class="data-value">{{ item.steps }} 步</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface ElderlyInfo {
  elderlyId: number
  nickname: string
}

interface HealthRecord {
  id: number
  recordTime: string
  heartRate: number | null
  systolicPressure: number | null
  diastolicPressure: number | null
  steps: number | null
}

const elderlyId = ref<number | null>(null)
const elderlyInfo = ref<ElderlyInfo | null>(null)
const activeTab = ref('heart')
const heartRateList = ref<HealthRecord[]>([])
const pressureList = ref<HealthRecord[]>([])
const stepsList = ref<HealthRecord[]>([])

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDate = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const loadHealthData = async () => {
  if (!elderlyId.value) return

  try {
    const result = await get(`/health/elderly/${elderlyId.value}/history`)
    if (result.code === 200 && result.data) {
      const data = result.data as HealthRecord[]
      heartRateList.value = data.filter(item => item.heartRate !== null)
      pressureList.value = data.filter(item => item.systolicPressure !== null)
      stepsList.value = data.filter(item => item.steps !== null)
    }
  } catch (error) {
    console.error('Load health data failed:', error)
  }
}

const goBack = () => {
  uni.navigateBack()
}

onLoad((options: any) => {
  if (options.elderlyId) {
    elderlyId.value = parseInt(options.elderlyId)
    elderlyInfo.value = {
      elderlyId: elderlyId.value,
      nickname: options.nickname || '老人'
    }
    loadHealthData()
  }
})

onMounted(() => {
  if (!elderlyId.value) {
    const bindElderlyStr = uni.getStorageSync('selectedElderly')
    if (bindElderlyStr) {
      elderlyInfo.value = JSON.parse(bindElderlyStr)
      elderlyId.value = elderlyInfo.value.elderlyId
      loadHealthData()
    }
  }
})
</script>

<style lang="scss" scoped>
.health-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
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
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 15rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.tabs {
  display: flex;
  padding: 20rpx 30rpx;
  gap: 20rpx;
}

.tab-item {
  padding: 20rpx 40rpx;
  background: #fff;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &.active {
    background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
    color: #fff;
  }
}

.content-area {
  padding: 20rpx;
}

.chart-placeholder {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.chart-icon {
  font-size: 60rpx;
  display: block;
  text-align: center;
  margin-bottom: 20rpx;
}

.chart-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 30rpx;
}

.data-list {
  padding: 20rpx 0;
}

.data-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.data-time {
  font-size: 28rpx;
  color: #666;
}

.data-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #1890ff;
}
</style>