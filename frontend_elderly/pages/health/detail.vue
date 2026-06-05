<template>
  <view class="detail-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">{{ pageTitle }}</text>
      </view>
      <text class="subtitle">点击录入您的健康数据</text>
    </view>

    <view class="current-value" v-if="latestValue">
      <text class="current-label">最新值</text>
      <text class="current-num">{{ latestValue }}</text>
      <text class="current-unit">{{ unit }}</text>
    </view>

    <view class="input-section">
      <view class="input-card">
        <input
          v-model="inputValue"
          type="number"
          :placeholder="`请输入${pageTitle}`"
          class="value-input"
        />
        <text class="input-unit">{{ unit }}</text>
      </view>
      <button class="submit-btn" @click="submitData">确认录入</button>
    </view>

    <view class="history-section">
      <view class="history-header">
        <text class="history-title">历史记录</text>
      </view>
      <view class="history-table">
        <view class="table-head">
          <text class="th time-col">时间</text>
          <text class="th value-col">数值</text>
        </view>
        <scroll-view scroll-y class="table-body">
          <view class="table-row" v-for="item in historyList" :key="item.id">
            <text class="td time-col">{{ formatTime(item.recordTime) }}</text>
            <text class="td value-col">{{ getValue(item) }} {{ unit }}</text>
          </view>
          <view class="empty-table" v-if="historyList.length === 0">
            <text>暂无历史记录</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="device-status" v-if="isBluetoothConnected">
      <view class="device-info">
        <text class="device-icon">📱</text>
        <text class="device-name">{{ connectedDeviceName }}</text>
        <text class="device-status-text">自动同步中</text>
      </view>
    </view>

    <view class="emergency-btn" @click="emergencyCall">
      <text class="emergency-icon">🆘</text>
      <text class="emergency-text">紧急求助</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { bluetoothService } from '@/utils/bluetooth-service'

interface HealthRecord {
  id: number
  recordTime: string
  heartRate: number | null
  systolicPressure: number | null
  diastolicPressure: number | null
  temperature: number | null
  steps: number | null
}

const type = ref('')
const inputValue = ref('')
const historyList = ref<HealthRecord[]>([])
const latestValue = ref<number | null>(null)
const isBluetoothConnected = ref(false)
const connectedDeviceName = ref('')

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    heart: '心率',
    pressure: '血压',
    temperature: '体温',
    steps: '步数'
  }
  return titles[type.value] || '健康数据'
})

const unit = computed(() => {
  const units: Record<string, string> = {
    heart: 'bpm',
    pressure: 'mmHg',
    temperature: '℃',
    steps: '步'
  }
  return units[type.value] || ''
})

const elderlyId = ref<number | null>(null)

const getValue = (item: HealthRecord): string => {
  switch (type.value) {
    case 'heart': return item.heartRate?.toString() || '--'
    case 'pressure': return item.systolicPressure && item.diastolicPressure ? `${item.systolicPressure}/${item.diastolicPressure}` : '--'
    case 'temperature': return item.temperature?.toString() || '--'
    case 'steps': return item.steps?.toString() || '--'
    default: return '--'
  }
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const goBack = () => {
  uni.navigateBack()
}

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    elderlyId.value = user.elderlyId
  }
}

const loadHistory = async () => {
  if (!elderlyId.value) return

  try {
    const result = await get(`/health/elderly/${elderlyId.value}/history`)
    if (result.code === 200 && result.data) {
      const data = result.data as HealthRecord[]
      historyList.value = data.filter(item => {
        switch (type.value) {
          case 'heart': return item.heartRate !== null
          case 'pressure': return item.systolicPressure !== null
          case 'temperature': return item.temperature !== null
          case 'steps': return item.steps !== null
          default: return false
        }
      }).slice(0, 50)

      if (historyList.value.length > 0) {
        const latest = historyList.value[0]
        switch (type.value) {
          case 'heart': latestValue.value = latest.heartRate; break
          case 'pressure': latestValue.value = latest.systolicPressure; break
          case 'temperature': latestValue.value = latest.temperature as number; break
          case 'steps': latestValue.value = latest.steps; break
        }
      }
    }
  } catch (error) {
    console.error('Load history failed:', error)
  }
}

const submitData = async () => {
  if (!inputValue.value || !elderlyId.value) {
    uni.showToast({ title: '请输入数值', icon: 'none' })
    return
  }

  const dto: any = {
    elderlyId: elderlyId.value,
    source: 1
  }

  switch (type.value) {
    case 'heart':
      dto.heartRate = parseInt(inputValue.value)
      break
    case 'pressure':
      const values = inputValue.value.split('/')
      if (values.length !== 2) {
        uni.showToast({ title: '请输入格式：收缩压/舒张压', icon: 'none' })
        return
      }
      dto.systolicPressure = parseInt(values[0])
      dto.diastolicPressure = parseInt(values[1])
      break
    case 'temperature':
      dto.temperature = parseFloat(inputValue.value)
      break
    case 'steps':
      dto.steps = parseInt(inputValue.value)
      break
  }

  try {
    const result = await post('/health', dto)
    if (result.code === 200) {
      uni.showToast({ title: '录入成功', icon: 'success' })
      inputValue.value = ''
      loadHistory()
    } else {
      uni.showToast({ title: result.message || '录入失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '录入失败', icon: 'none' })
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

let syncTimer: number | null = null

const startBluetoothSync = () => {
  const state = bluetoothService.getState()
  if (state.isConnected && state.connectedDevice) {
    isBluetoothConnected.value = true
    connectedDeviceName.value = state.connectedDevice.name

    syncTimer = setInterval(() => {
      const healthData = bluetoothService.getState().healthData
      if (healthData && elderlyId.value) {
        const dto: any = {
          elderlyId: elderlyId.value,
          source: 2
        }

        switch (type.value) {
          case 'heart':
            if (healthData.heartRate) {
              dto.heartRate = healthData.heartRate
              post('/health', dto)
              loadHistory()
            }
            break
          case 'pressure':
            if (healthData.systolicPressure && healthData.diastolicPressure) {
              dto.systolicPressure = healthData.systolicPressure
              dto.diastolicPressure = healthData.diastolicPressure
              post('/health', dto)
              loadHistory()
            }
            break
          case 'temperature':
            if (healthData.temperature) {
              dto.temperature = healthData.temperature
              post('/health', dto)
              loadHistory()
            }
            break
          case 'steps':
            if (healthData.steps) {
              dto.steps = healthData.steps
              post('/health', dto)
              loadHistory()
            }
            break
        }
      }
    }, 30000) as unknown as number
  }
}

onLoad((options: any) => {
  if (options.type) {
    type.value = options.type
  }
})

onMounted(() => {
  loadUser()
  loadHistory()
  startBluetoothSync()
})

onUnmounted(() => {
  if (syncTimer) {
    clearInterval(syncTimer)
  }
})
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 200rpx;
}

.header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.current-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  padding: 60rpx 40rpx 40rpx;
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.current-label {
  font-size: 28rpx;
  color: #999;
  margin-right: 20rpx;
}

.current-num {
  font-size: 72rpx;
  font-weight: bold;
  color: #52c41a;
}

.current-unit {
  font-size: 28rpx;
  color: #666;
  margin-left: 10rpx;
}

.input-section {
  padding: 20rpx;
}

.input-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 30rpx;
}

.value-input {
  flex: 1;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.input-unit {
  font-size: 32rpx;
  color: #666;
  margin-left: 20rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-section {
  padding: 20rpx;
}

.history-header {
  margin-bottom: 20rpx;
}

.history-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.history-table {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.table-head {
  display: flex;
  background: #f5f5f5;
  padding: 20rpx 30rpx;
}

.th {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
}

.time-col {
  flex: 1;
}

.value-col {
  width: 200rpx;
  text-align: right;
}

.table-body {
  max-height: 500rpx;
}

.table-row {
  display: flex;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.td {
  font-size: 28rpx;
  color: #333;
}

.empty-table {
  padding: 60rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.device-status {
  position: fixed;
  bottom: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(82, 196, 26, 0.9);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.device-icon {
  font-size: 32rpx;
}

.device-name {
  font-size: 26rpx;
  color: #fff;
}

.device-status-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
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