<template>
  <view class="add-health-container">
    <view class="header">
      <text class="header-title">录入健康数据</text>
      <text class="header-subtitle">{{ elderlyName }}</text>
    </view>

    <view class="module-grid">
      <view class="module-item" @click="showModule('heartRate')">
        <view class="module-icon">🫀</view>
        <text class="module-name">心率</text>
        <text class="module-value" v-if="form.heartRate">{{ form.heartRate }} bpm</text>
        <text class="module-value empty" v-else>未录入</text>
      </view>

      <view class="module-item" @click="showModule('bloodPressure')">
        <view class="module-icon">💉</view>
        <text class="module-name">血压</text>
        <text class="module-value" v-if="form.systolicPressure">{{ form.systolicPressure }}/{{ form.diastolicPressure }} mmHg</text>
        <text class="module-value empty" v-else>未录入</text>
      </view>

      <view class="module-item" @click="showModule('temperature')">
        <view class="module-icon">🌡️</view>
        <text class="module-name">体温</text>
        <text class="module-value" v-if="form.temperature">{{ form.temperature }} ℃</text>
        <text class="module-value empty" v-else>未录入</text>
      </view>

      <view class="module-item" @click="showModule('sleep')">
        <view class="module-icon">😴</view>
        <text class="module-name">睡眠</text>
        <text class="module-value" v-if="form.sleepDuration">{{ form.sleepDuration }} 小时</text>
        <text class="module-value empty" v-else>未录入</text>
      </view>

      <view class="module-item" @click="showModule('steps')">
        <view class="module-icon">👟</view>
        <text class="module-name">步数</text>
        <text class="module-value" v-if="form.steps">{{ form.steps }} 步</text>
        <text class="module-value empty" v-else>未录入</text>
      </view>
    </view>

    <view class="action-area">
      <button class="submit-btn" @click="submitForm">保存数据</button>
    </view>

    <view class="bluetooth-tip" v-if="!isGuardian">
      <text class="tip-icon">💡</text>
      <text class="tip-text">连接手环后数据将自动同步，无需手动录入</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { post } from '@/utils/request'

interface HealthForm {
  elderlyId: number | null
  heartRate: number | null
  systolicPressure: number | null
  diastolicPressure: number | null
  temperature: number | null
  sleepDuration: number | null
  sleepStatus: number
  steps: number | null
}

interface User {
  userId: number
  elderlyId: number
  nickname: string
  userType: string
}

const form = ref<HealthForm>({
  elderlyId: null,
  heartRate: null,
  systolicPressure: null,
  diastolicPressure: null,
  temperature: null,
  sleepDuration: null,
  sleepStatus: 0,
  steps: null
})

const user = ref<User | null>(null)
const isGuardian = ref(false)

const elderlyName = computed(() => {
  return user.value?.nickname || '老人'
})

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
}

const showModule = (type: string) => {
  switch (type) {
    case 'heartRate':
      uni.showModal({
        title: '录入心率',
        editable: true,
        placeholderText: '请输入心率值 (bpm)',
        success: (res) => {
          if (res.confirm && res.content) {
            const value = parseInt(res.content)
            if (!isNaN(value) && value > 0 && value < 300) {
              form.value.heartRate = value
            } else {
              uni.showToast({ title: '请输入有效的心率值', icon: 'none' })
            }
          }
        }
      })
      break

    case 'bloodPressure':
      uni.showModal({
        title: '录入血压',
        editable: true,
        placeholderText: '格式：高压/低压 (如 120/80)',
        success: (res) => {
          if (res.confirm && res.content) {
            const parts = res.content.split('/')
            if (parts.length === 2) {
              const sys = parseInt(parts[0])
              const dia = parseInt(parts[1])
              if (!isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0) {
                form.value.systolicPressure = sys
                form.value.diastolicPressure = dia
              } else {
                uni.showToast({ title: '请输入有效的血压值', icon: 'none' })
              }
            } else {
              uni.showToast({ title: '格式错误，请使用 高压/低压 格式', icon: 'none' })
            }
          }
        }
      })
      break

    case 'temperature':
      uni.showModal({
        title: '录入体温',
        editable: true,
        placeholderText: '请输入体温值 (℃)',
        success: (res) => {
          if (res.confirm && res.content) {
            const value = parseFloat(res.content)
            if (!isNaN(value) && value > 30 && value < 45) {
              form.value.temperature = value
            } else {
              uni.showToast({ title: '请输入有效的体温值', icon: 'none' })
            }
          }
        }
      })
      break

    case 'sleep':
      uni.showModal({
        title: '录入睡眠',
        editable: true,
        placeholderText: '请输入睡眠时长 (小时)',
        success: (res) => {
          if (res.confirm && res.content) {
            const value = parseFloat(res.content)
            if (!isNaN(value) && value >= 0 && value <= 24) {
              form.value.sleepDuration = value
              form.value.sleepStatus = value > 0 ? 0 : 1
            } else {
              uni.showToast({ title: '请输入有效的睡眠时长', icon: 'none' })
            }
          }
        }
      })
      break

    case 'steps':
      uni.showModal({
        title: '录入步数',
        editable: true,
        placeholderText: '请输入今日步数',
        success: (res) => {
          if (res.confirm && res.content) {
            const value = parseInt(res.content)
            if (!isNaN(value) && value >= 0) {
              form.value.steps = value
            } else {
              uni.showToast({ title: '请输入有效的步数', icon: 'none' })
            }
          }
        }
      })
      break
  }
}

const submitForm = async () => {
  if (form.value.elderlyId === null) {
    uni.showToast({ title: '用户信息加载中，请稍后', icon: 'none' })
    return
  }

  const hasData = form.value.heartRate || form.value.systolicPressure ||
    form.value.temperature || form.value.sleepDuration || form.value.steps

  if (!hasData) {
    uni.showToast({ title: '请至少录入一项数据', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })

  try {
    const data = {
      elderlyId: form.value.elderlyId,
      heartRate: form.value.heartRate,
      systolicPressure: form.value.systolicPressure,
      diastolicPressure: form.value.diastolicPressure,
      temperature: form.value.temperature,
      sleepDuration: form.value.sleepDuration,
      sleepStatus: form.value.sleepStatus,
      steps: form.value.steps,
      source: 0
    }

    await post('/health', data)
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
    console.error('Submit failed:', error)
  }
}

onMounted(() => {
  loadUser()

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options || {}

  if (options.elderlyId) {
    form.value.elderlyId = parseInt(options.elderlyId)
  } else if (user.value?.elderlyId) {
    form.value.elderlyId = user.value.elderlyId
  }

  if (user.value?.userType === 'guardian') {
    isGuardian.value = true
  }
})
</script>

<style lang="scss" scoped>
.add-health-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.header {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  color: #fff;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.header-subtitle {
  font-size: 26rpx;
  opacity: 0.9;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.module-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &:nth-child(1) {
    border-left: 8rpx solid #ff4d4f;
  }

  &:nth-child(2) {
    border-left: 8rpx solid #fa8c16;
  }

  &:nth-child(3) {
    border-left: 8rpx solid #faad14;
  }

  &:nth-child(4) {
    border-left: 8rpx solid #1890ff;
  }

  &:nth-child(5) {
    border-left: 8rpx solid #52c41a;
  }
}

.module-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.module-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.module-value {
  font-size: 26rpx;
  color: #1989fa;

  &.empty {
    color: #999;
  }
}

.action-area {
  margin-bottom: 30rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}

.bluetooth-tip {
  background: #f0f9ff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tip-icon {
  font-size: 32rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #1989fa;
  flex: 1;
}
</style>
