<template>
  <view class="health-container">
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

    <view class="header-card">
      <view class="card-title">
        <text class="title-icon">❤️</text>
        <text class="title-text">{{ elderlyName }}的健康数据</text>
      </view>
    </view>

    <view class="module-section" v-if="latestHealthData">
      <view class="module-card heart-card">
        <view class="module-header">
          <text class="module-icon">🫀</text>
          <text class="module-title">心率血压</text>
        </view>
        <view class="module-content">
          <view class="metric-item">
            <text class="metric-value">{{ latestHealthData.heartRate ?? '--' }}</text>
            <text class="metric-unit">bpm</text>
            <text class="metric-label">心率</text>
          </view>
          <view class="metric-item">
            <text class="metric-value">{{ latestHealthData.systolicPressure ?? '--' }}/{{ latestHealthData.diastolicPressure ?? '--' }}</text>
            <text class="metric-unit">mmHg</text>
            <text class="metric-label">血压</text>
          </view>
        </view>
      </view>

      <view class="module-card temp-card">
        <view class="module-header">
          <text class="module-icon">🌡️</text>
          <text class="module-title">体温</text>
        </view>
        <view class="module-content">
          <view class="metric-item single">
            <text class="metric-value">{{ latestHealthData.temperature ?? '--' }}</text>
            <text class="metric-unit">℃</text>
            <text class="metric-label">当前体温</text>
          </view>
        </view>
      </view>

      <view class="module-card sleep-card">
        <view class="module-header">
          <text class="module-icon">😴</text>
          <text class="module-title">睡眠</text>
        </view>
        <view class="module-content">
          <view class="metric-item">
            <text class="metric-value">{{ latestHealthData.sleepDuration ?? '--' }}</text>
            <text class="metric-unit">小时</text>
            <text class="metric-label">睡眠时长</text>
          </view>
          <view class="metric-item">
            <text class="metric-value">{{ latestHealthData.sleepStatus === 1 ? '睡眠中' : '清醒' }}</text>
            <text class="metric-unit"></text>
            <text class="metric-label">睡眠状态</text>
          </view>
        </view>
      </view>

      <view class="module-card steps-card" v-if="latestHealthData.steps">
        <view class="module-header">
          <text class="module-icon">👟</text>
          <text class="module-title">运动</text>
        </view>
        <view class="module-content">
          <view class="metric-item single">
            <text class="metric-value">{{ latestHealthData.steps ?? '--' }}</text>
            <text class="metric-unit">步</text>
            <text class="metric-label">今日步数</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-modules" v-else>
      <text class="empty-text">暂无健康数据</text>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">历史记录</text>
        <view class="header-actions">
          <view
            class="bluetooth-btn"
            :class="{ connected: isBluetoothConnected, scanning: isScanning }"
            @click="toggleBluetooth"
            v-if="!isGuardian && userElderlyId"
          >
            <text class="bluetooth-icon">{{ isScanning ? '🔍' : (isBluetoothConnected ? '🔗' : '📴') }}</text>
            <text class="bluetooth-text">{{ isScanning ? '扫描中...' : (isBluetoothConnected ? '已连接' : '连接设备') }}</text>
          </view>
          <text class="add-btn" @click="goAddHealth">+ 录入数据</text>
        </view>
      </view>

      <view class="bluetooth-status" v-if="isBluetoothConnected && !isGuardian">
        <view class="status-info">
          <text class="status-device">{{ bluetoothDeviceName }}</text>
          <text class="status-protocol">{{ getProtocolName(currentProtocol) }}</text>
          <view class="status-battery" v-if="batteryLevel > 0">
            <text class="battery-icon">🔋</text>
            <text class="battery-text">{{ batteryLevel }}%</text>
          </view>
        </view>
        <view class="status-actions">
          <text class="sync-btn" @click="syncDataManually">🔄 同步数据</text>
          <text class="disconnect-btn" @click="disconnectBluetooth">断开</text>
        </view>
      </view>

      <view class="history-list" v-if="healthHistory.length > 0">
        <view class="history-item" v-for="item in healthHistory" :key="item.id">
          <view class="item-header">
            <text class="item-time">{{ formatTime(item.recordTime) }}</text>
          </view>

          <view class="item-data-grid">
            <view class="data-block" v-if="item.heartRate">
              <view class="data-row">
                <text class="data-icon">❤️</text>
                <text class="data-label">心率</text>
              </view>
              <text class="data-value">{{ item.heartRate }}<text class="data-unit">bpm</text></text>
            </view>

            <view class="data-block" v-if="item.systolicPressure">
              <view class="data-row">
                <text class="data-icon">💉</text>
                <text class="data-label">血压</text>
              </view>
              <text class="data-value">{{ item.systolicPressure }}/{{ item.diastolicPressure }}<text class="data-unit">mmHg</text></text>
            </view>

            <view class="data-block" v-if="item.temperature">
              <view class="data-row">
                <text class="data-icon">🌡️</text>
                <text class="data-label">体温</text>
              </view>
              <text class="data-value">{{ item.temperature }}<text class="data-unit">℃</text></text>
            </view>

            <view class="data-block" v-if="item.steps">
              <view class="data-row">
                <text class="data-icon">👟</text>
                <text class="data-label">步数</text>
              </view>
              <text class="data-value">{{ item.steps }}<text class="data-unit">步</text></text>
            </view>

            <view class="data-block" v-if="item.sleepDuration">
              <view class="data-row">
                <text class="data-icon">😴</text>
                <text class="data-label">睡眠</text>
              </view>
              <text class="data-value">{{ item.sleepDuration }}<text class="data-unit">小时</text></text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-state" v-else>
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无历史记录</text>
        <text class="empty-btn" @click="goAddHealth">立即录入</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { get } from '@/utils/request'
import { bluetoothService, type DeviceInfo } from '@/utils/bluetooth-service'

interface HealthData {
  id: number
  heartRate: number | null
  systolicPressure: number | null
  diastolicPressure: number | null
  temperature: number | null
  sleepDuration: number | null
  sleepStatus: number
  recordTime: string
  source?: number
  steps?: number | null
}

interface BindElderly {
  id: number
  nickname: string
  phone: string
  gender: number
}

interface User {
  userId: number
  elderlyId: number | null
  username: string
  nickname: string
  userType: string
}

const latestHealthData = ref<HealthData | null>(null)
const healthHistory = ref<HealthData[]>([])
const bindElderlyList = ref<BindElderly[]>([])
const selectedElderly = ref<BindElderly | null>(null)
const selectedElderlyId = ref<number | null>(null)
const isGuardian = ref(false)
const user = ref<User | null>(null)
const userElderlyId = ref<number | null>(null)
const isBluetoothConnected = ref(false)
const bluetoothDeviceName = ref('')
const bluetoothDevices = ref<DeviceInfo[]>([])
const isScanning = ref(false)
const batteryLevel = ref(0)
const currentProtocol = ref<string>('unknown')
let syncTimer: number | null = null
let batteryTimer: number | null = null

const elderlyName = computed(() => {
  if (isGuardian.value && selectedElderly.value) {
    return selectedElderly.value.nickname
  }
  return user.value?.nickname || '老人'
})

const formatTime = (timeStr: string) => {
  if (!timeStr) return '未知'
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
    userElderlyId.value = user.value?.elderlyId || null
  }
}

const loadBindings = async () => {
  try {
    const guardianResult = await get('/binding/guardian')
    if (guardianResult.code === 200 && guardianResult.data && guardianResult.data.length > 0) {
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
      await loadMyHealthData()
      await loadMyHealthHistory()
    }
  } catch (error) {
    console.error('Load bindings failed:', error)
    isGuardian.value = false
    await loadMyHealthData()
    await loadMyHealthHistory()
  }
}

const selectElderly = (elderly: BindElderly) => {
  selectedElderly.value = elderly
  selectedElderlyId.value = elderly.id
  uni.setStorageSync('selectedElderly', JSON.stringify(elderly))
  loadElderlyHealthData(elderly.id)
  loadElderlyHealthHistory(elderly.id)
}

const loadElderlyHealthData = async (elderlyId: number) => {
  try {
    const result = await get(`/health/elderly/${elderlyId}/latest`)
    if (result.code === 200 && result.data) {
      latestHealthData.value = result.data
    } else {
      latestHealthData.value = null
    }
  } catch (error) {
    console.error('Load health data failed:', error)
    latestHealthData.value = null
  }
}

const loadElderlyHealthHistory = async (elderlyId: number) => {
  try {
    const result = await get(`/health/elderly/${elderlyId}`)
    if (result.code === 200 && result.data) {
      healthHistory.value = result.data.slice(0, 10)
    } else {
      healthHistory.value = []
    }
  } catch (error) {
    console.error('Load health history failed:', error)
    healthHistory.value = []
  }
}

const loadMyHealthData = async () => {
  const elderlyId = isGuardian.value ? selectedElderlyId.value : userElderlyId.value
  if (!elderlyId) return

  try {
    const result = await get(`/health/elderly/${elderlyId}/latest`)
    if (result.code === 200 && result.data) {
      latestHealthData.value = result.data
    } else {
      latestHealthData.value = null
    }
  } catch (error) {
    console.error('Load health data failed:', error)
    latestHealthData.value = null
  }
}

const loadMyHealthHistory = async () => {
  const elderlyId = isGuardian.value ? selectedElderlyId.value : userElderlyId.value
  if (!elderlyId) return

  try {
    const result = await get(`/health/elderly/${elderlyId}`)
    if (result.code === 200 && result.data) {
      healthHistory.value = result.data.slice(0, 10)
    } else {
      healthHistory.value = []
    }
  } catch (error) {
    console.error('Load health history failed:', error)
    healthHistory.value = []
  }
}

const goAddHealth = () => {
  const targetId = isGuardian.value ? selectedElderlyId.value : userElderlyId.value

  if (!targetId) {
    uni.showToast({ title: '请先选择老人', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `/pages/health/add?elderlyId=${targetId}` })
}

const toggleBluetooth = () => {
  if (isBluetoothConnected.value) {
    disconnectBluetooth()
  } else {
    scanBluetoothDevices()
  }
}

const scanBluetoothDevices = async () => {
  try {
    await bluetoothService.init()
    isScanning.value = true
    await bluetoothService.startScan()
    isScanning.value = false

    const state = bluetoothService.getState()
    bluetoothDevices.value = state.devices

    if (bluetoothDevices.value.length === 0) {
      uni.showToast({ title: '未找到蓝牙设备', icon: 'none' })
      return
    }

    showDeviceSelector()
  } catch (error) {
    console.error('Scan failed:', error)
    isScanning.value = false
    uni.showToast({ title: '蓝牙初始化失败', icon: 'none' })
  }
}

const showDeviceSelector = () => {
  const deviceNames = bluetoothDevices.value.map((d, index) => {
    const protocolName = getProtocolName(d.protocol)
    const status = d.protocol === 'unknown' ? '(检测失败，请手动选择)' : ''
    return `${index + 1}. ${d.name} ${status}`
  })
  uni.showActionSheet({
    itemList: deviceNames,
    success: async (res) => {
      const selectedDevice = bluetoothDevices.value[res.tapIndex]

      if (selectedDevice.protocol === 'unknown') {
        showProtocolSelector(selectedDevice)
      } else {
        await connectToDevice(selectedDevice)
      }
    }
  })
}

const showProtocolSelector = (device: DeviceInfo) => {
  const protocols = bluetoothService.getAvailableProtocols()
  const protocolNames = protocols.map(p => p.label)

  uni.showActionSheet({
    title: `请为 ${device.name} 选择协议类型`,
    itemList: protocolNames,
    success: async (res) => {
      const selectedProtocol = protocols[res.tapIndex].value
      await connectToDevice(device, selectedProtocol)
    }
  })
}

const getProtocolName = (protocol: string) => {
  const names: Record<string, string> = {
    miband: '小米手环',
    huawei: '华为手环',
    m4: 'M4/M5手环',
    generic: '通用BLE',
    unknown: '未知设备'
  }
  return names[protocol] || '未知'
}

const connectToDevice = async (device: DeviceInfo, customProtocol?: DeviceInfo['protocol']) => {
  try {
    await bluetoothService.connect(device.deviceId, customProtocol)
    isBluetoothConnected.value = true
    bluetoothDeviceName.value = device.name
    currentProtocol.value = customProtocol || device.protocol
    const protocolName = getProtocolName(currentProtocol.value)
    uni.showToast({ title: `已连接 ${device.name} (${protocolName})`, icon: 'success' })

    await startBatteryMonitoring()
    startDataSync()
  } catch (error) {
    console.error('Connect failed:', error)
    uni.showToast({ title: '连接失败', icon: 'none' })
  }
}

const disconnectBluetooth = async () => {
  stopBatteryMonitoring()
  await bluetoothService.disconnect()
  isBluetoothConnected.value = false
  bluetoothDeviceName.value = ''
  currentProtocol.value = 'unknown'
  batteryLevel.value = 0
  stopDataSync()
  uni.showToast({ title: '已断开连接', icon: 'none' })
}

const startBatteryMonitoring = async () => {
  stopBatteryMonitoring()

  await updateBatteryLevel()

  batteryTimer = setInterval(async () => {
    await updateBatteryLevel()
  }, 60000) as unknown as number
}

const stopBatteryMonitoring = () => {
  if (batteryTimer) {
    clearInterval(batteryTimer)
    batteryTimer = null
  }
}

const updateBatteryLevel = async () => {
  try {
    const level = await bluetoothService.readBatteryLevel()
    batteryLevel.value = level
  } catch (error) {
    console.error('Update battery failed:', error)
  }
}

const startDataSync = () => {
  stopDataSync()

  const state = bluetoothService.getState()
  watch(() => state.healthData, async (newData) => {
    if (!newData) return

    const elderlyId = isGuardian.value ? selectedElderlyId.value : userElderlyId.value
    if (!elderlyId) return

    const success = await bluetoothService.sendToServer(elderlyId)
    if (success) {
      await loadElderlyHealthData(elderlyId)
      await loadElderlyHealthHistory(elderlyId)
    }
  }, { immediate: true })

  syncTimer = setInterval(async () => {
    const elderlyId = isGuardian.value ? selectedElderlyId.value : userElderlyId.value
    if (!elderlyId) return

    const state = bluetoothService.getState()
    if (!state.healthData) return

    const success = await bluetoothService.sendToServer(elderlyId)
    if (success) {
      await loadElderlyHealthData(elderlyId)
      await loadElderlyHealthHistory(elderlyId)
    }
  }, 30000) as unknown as number
}

const syncDataManually = async () => {
  const elderlyId = isGuardian.value ? selectedElderlyId.value : userElderlyId.value
  if (!elderlyId) return

  uni.showLoading({ title: '同步中...' })

  try {
    const success = await bluetoothService.sendToServer(elderlyId)
    if (success) {
      await loadElderlyHealthData(elderlyId)
      await loadElderlyHealthHistory(elderlyId)
      uni.showToast({ title: '同步成功', icon: 'success' })
    } else {
      uni.showToast({ title: '同步失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '同步失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const stopDataSync = () => {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
  }
}

onMounted(() => {
  loadUser()
  loadBindings()
})
</script>

<style lang="scss" scoped>
.health-container {
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
    background: #1989fa;

    .tab-text {
      color: #fff;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  color: #333;
}

.header-card {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  color: #fff;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-icon {
  font-size: 36rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
}

.module-section {
  padding: 0 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty-modules {
  padding: 40rpx 20rpx;
  text-align: center;
}

.empty-modules .empty-text {
  font-size: 28rpx;
  color: #999;
}

.module-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);

  &.heart-card {
    border-left: 8rpx solid #ff4d4f;
  }

  &.temp-card {
    border-left: 8rpx solid #faad14;
  }

  &.sleep-card {
    border-left: 8rpx solid #1890ff;
  }

  &.steps-card {
    border-left: 8rpx solid #52c41a;
  }
}

.module-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.module-icon {
  font-size: 32rpx;
}

.module-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.module-content {
  display: flex;
  gap: 30rpx;
}

.metric-item {
  flex: 1;
  text-align: center;

  &.single {
    flex: none;
    width: 100%;
  }
}

.metric-value {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.metric-unit {
  font-size: 22rpx;
  color: #999;
  margin-left: 6rpx;
}

.metric-label {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 8rpx;
}

.section {
  padding: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bluetooth-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border: 2rpx solid #ddd;
  border-radius: 30rpx;
  transition: all 0.3s;

  &.connected {
    border-color: #52c41a;
    background: #f6ffed;

    .bluetooth-text {
      color: #52c41a;
    }
  }

  &.scanning {
    border-color: #1989fa;
    background: #e6f7ff;

    .bluetooth-text {
      color: #1989fa;
    }
  }
}

.bluetooth-icon {
  font-size: 28rpx;
}

.bluetooth-text {
  font-size: 24rpx;
  color: #666;
}

.add-btn {
  font-size: 28rpx;
  color: #1989fa;
}

.bluetooth-status {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.status-device {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.status-protocol {
  font-size: 24rpx;
  color: #1989fa;
  padding: 4rpx 12rpx;
  background: #e6f7ff;
  border-radius: 10rpx;
}

.status-battery {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.battery-icon {
  font-size: 24rpx;
}

.battery-text {
  font-size: 24rpx;
  color: #666;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.sync-btn {
  font-size: 26rpx;
  color: #52c41a;
  padding: 8rpx 16rpx;
  background: #f6ffed;
  border-radius: 20rpx;
}

.disconnect-btn {
  font-size: 26rpx;
  color: #ff4d4f;
  padding: 8rpx 16rpx;
  background: #fff2f0;
  border-radius: 20rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.history-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.item-time {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.item-data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.data-block {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 16rpx;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.data-icon {
  font-size: 24rpx;
}

.data-label {
  font-size: 24rpx;
  color: #999;
}

.data-value {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.data-unit {
  font-size: 20rpx;
  color: #999;
  margin-left: 4rpx;
}

.empty-state {
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
</style>
