<template>
  <view class="home-container">
    <view class="header">
      <view class="user-info">
        <view class="avatar">
          <text class="avatar-icon">👴</text>
        </view>
        <view class="user-text">
          <text class="greeting">您好，{{ user?.nickname || '老人' }}</text>
          <text class="date">{{ currentDate }}</text>
        </view>
      </view>
      <view class="bluetooth-status" v-if="isBluetoothConnected" @click="showBluetoothMenu">
        <text class="bt-icon">📱</text>
        <text class="bt-text">{{ connectedDeviceName }}</text>
        <text class="bt-status">已连接</text>
      </view>
    </view>

    <view class="health-section">
      <view class="section-header">
        <text class="section-title">我的健康数据</text>
        <text class="section-tip">点击卡片录入数据</text>
      </view>

      <view class="health-grid">
        <view class="health-card" @click="goToHealthDetail('heart')">
          <view class="card-icon heart">🫀</view>
          <view class="card-info">
            <text class="card-label">心率</text>
            <text class="card-value">{{ latestHealthData?.heartRate ?? '--' }}<text class="card-unit">bpm</text></text>
          </view>
          <text class="card-arrow">›</text>
        </view>

        <view class="health-card" @click="goToHealthDetail('pressure')">
          <view class="card-icon pressure">💉</view>
          <view class="card-info">
            <text class="card-label">血压</text>
            <text class="card-value">{{ latestHealthData?.systolicPressure ?? '--' }}/{{ latestHealthData?.diastolicPressure ?? '--' }}<text class="card-unit">mmHg</text></text>
          </view>
          <text class="card-arrow">›</text>
        </view>

        <view class="health-card" @click="goToHealthDetail('temperature')">
          <view class="card-icon temp">🌡️</view>
          <view class="card-info">
            <text class="card-label">体温</text>
            <text class="card-value">{{ latestHealthData?.temperature ?? '--' }}<text class="card-unit">℃</text></text>
          </view>
          <text class="card-arrow">›</text>
        </view>

        <view class="health-card" @click="goToHealthDetail('steps')">
          <view class="card-icon steps">👟</view>
          <view class="card-info">
            <text class="card-label">步数</text>
            <text class="card-value">{{ latestHealthData?.steps ?? '--' }}<text class="card-unit">步</text></text>
          </view>
          <text class="card-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="device-section">
      <view class="section-header">
        <text class="section-title">设备连接</text>
      </view>
      <view class="device-card" @click="scanBluetooth">
        <view class="device-icon">📲</view>
        <view class="device-info">
          <text class="device-name">{{ isBluetoothConnected ? connectedDeviceName : '蓝牙手环' }}</text>
          <text class="device-desc">{{ isBluetoothConnected ? '点击管理设备' : '点击连接设备自动同步数据' }}</text>
        </view>
        <text class="card-arrow">›</text>
      </view>
    </view>

    <view class="location-section">
      <view class="section-header">
        <text class="section-title">位置共享</text>
      </view>
      <view class="device-card" @click="goToLocation">
        <view class="device-icon location">📍</view>
        <view class="device-info">
          <text class="device-name">位置共享</text>
          <text class="device-desc">实时同步位置给监护人</text>
        </view>
        <text class="card-arrow">›</text>
      </view>
    </view>

    <view class="emergency-btn" @click="emergencyCall">
      <text class="emergency-icon">🆘</text>
      <text class="emergency-text">紧急求助</text>
    </view>

    <FloatingSOS />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import FloatingSOS from '@/components/FloatingSOS.vue'
import { get, post } from '@/utils/request'
import { bluetoothService } from '@/utils/bluetooth-service'

interface User {
  userId: number
  username: string
  nickname: string
  userType: string
  elderlyId: number | null
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
const latestHealthData = ref<HealthData | null>(null)
const isBluetoothConnected = ref(false)
const connectedDeviceName = ref('')

let syncTimer: number | null = null

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

const loadHealthData = async () => {
  if (!user.value?.elderlyId) return

  try {
    const result = await get(`/health/elderly/${user.value.elderlyId}/latest`)
    if (result.code === 200 && result.data) {
      latestHealthData.value = result.data
    }
  } catch (error) {
    console.error('Load health data failed:', error)
  }
}

const goToHealthDetail = (type: string) => {
  uni.navigateTo({
    url: `/pages/health/detail?type=${type}`
  })
}

const goToLocation = () => {
  uni.navigateTo({
    url: '/pages/location/index'
  })
}

const showBluetoothMenu = () => {
  const btState = bluetoothService.getState()

  uni.showActionSheet({
    itemList: ['断开连接', '取消'],
    success: async (res) => {
      if (res.tapIndex === 0) {
        await bluetoothService.disconnect()
        isBluetoothConnected.value = false
        connectedDeviceName.value = ''
        if (syncTimer) {
          clearInterval(syncTimer)
          syncTimer = null
        }
      }
    }
  })
}

const scanBluetooth = async () => {
  const btState = bluetoothService.getState()

  if (btState.isConnected) {
    showBluetoothMenu()
    return
  }

  try {
    uni.showLoading({ title: '初始化蓝牙...' })

    await bluetoothService.init()

    uni.showLoading({ title: '扫描设备中...' })
    await bluetoothService.startScan()

    if (btState.devices.length === 0) {
      uni.hideLoading()
      uni.showToast({ title: '未发现蓝牙设备', icon: 'none' })
      return
    }

    uni.hideLoading()

    const deviceNames = btState.devices.map(d => `${d.name} (${d.rssi}dBm)`)

    uni.showActionSheet({
      itemList: deviceNames,
      success: async (res) => {
        const selectedDevice = btState.devices[res.tapIndex]
        uni.showLoading({ title: '连接设备...' })

        try {
          await bluetoothService.connect(selectedDevice.deviceId)
          isBluetoothConnected.value = true
          connectedDeviceName.value = selectedDevice.name

          uni.showToast({ title: '连接成功，开始同步', icon: 'success' })

          startAutoSync()

        } catch (error) {
          uni.showToast({ title: '连接失败', icon: 'none' })
        }
      }
    })

  } catch (error: any) {
    uni.hideLoading()
    if (error.message.includes('not available')) {
      uni.showToast({ title: '请开启手机蓝牙', icon: 'none' })
    } else {
      uni.showToast({ title: error.message || '蓝牙初始化失败', icon: 'none' })
    }
  }
}

const startAutoSync = () => {
  if (syncTimer) {
    clearInterval(syncTimer)
  }

  syncTimer = setInterval(async () => {
    const healthData = bluetoothService.getState().healthData
    if (healthData && user.value?.elderlyId) {
      const dto: any = {
        elderlyId: user.value.elderlyId,
        source: 2,
        heartRate: healthData.heartRate,
        systolicPressure: healthData.systolicPressure,
        diastolicPressure: healthData.diastolicPressure,
        temperature: healthData.temperature,
        steps: healthData.steps
      }

      try {
        await post('/health/device', dto)
        loadHealthData()
      } catch (error) {
        console.error('Auto sync failed:', error)
      }
    }
  }, 30000) as unknown as number
}

const emergencyCall = () => {
  if (!user.value?.elderlyId) {
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
            elderlyId: user.value!.elderlyId
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
  loadHealthData()

  const btState = bluetoothService.getState()
  if (btState.isConnected && btState.connectedDevice) {
    isBluetoothConnected.value = true
    connectedDeviceName.value = btState.connectedDevice.name
    startAutoSync()
  }
})

onShow(() => {
  loadUser()
  loadHealthData()
})

onUnmounted(() => {
  if (syncTimer) {
    clearInterval(syncTimer)
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
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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

.bluetooth-status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  margin-top: 30rpx;
  width: fit-content;
}

.bt-icon {
  font-size: 28rpx;
}

.bt-text {
  font-size: 24rpx;
  color: #fff;
}

.bt-status {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.health-section {
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.section-tip {
  font-size: 24rpx;
  color: #999;
}

.health-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.health-card {
  width: calc(50% - 10rpx);
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.card-icon.heart {
  background: #fff2f0;
}

.card-icon.pressure {
  background: #fff7e6;
}

.card-icon.temp {
  background: #fff1f0;
}

.card-icon.steps {
  background: #f6ffed;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.card-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.card-unit {
  font-size: 24rpx;
  font-weight: normal;
  color: #999;
  margin-left: 4rpx;
}

.card-arrow {
  font-size: 40rpx;
  color: #ccc;
}

.device-section {
  padding: 20rpx;
}

.location-section {
  padding: 20rpx;
}

.device-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.device-icon {
  width: 80rpx;
  height: 80rpx;
  background: #e6f7ff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.device-icon.location {
  background: #fff7e6;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.device-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
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