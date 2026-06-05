<template>
  <view class="alarm-container">
    <view class="header">
      <text class="title">告警记录</text>
    </view>

    <view class="alarm-list" v-if="alarmList.length > 0">
      <view
        class="alarm-item"
        v-for="item in alarmList"
        :key="item.id"
        :class="item.type"
      >
        <view class="alarm-header">
          <text class="alarm-icon">{{ getAlarmIcon(item.type) }}</text>
          <text class="alarm-title">{{ getAlarmTitle(item.type) }}</text>
          <text class="alarm-time">{{ formatTime(item.createTime) }}</text>
        </view>
        <view class="alarm-content">
          <text class="alarm-text">{{ item.content }}</text>
          <text class="alarm-elderly">老人：{{ item.elderlyName }}</text>
        </view>
        <view class="alarm-footer">
          <view class="alarm-status" :class="{ handled: item.status === 'handled' }">
            <text>{{ item.status === 'handled' ? '已处理' : '待处理' }}</text>
          </view>
          <view 
            class="handle-btn" 
            v-if="item.status !== 'handled'"
            @click="handleAlarm(item)"
          >
            <text>处理</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">🔔</text>
      <text class="empty-text">暂无告警记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put } from '@/utils/request'

interface AlarmRecord {
  id: number
  type: string
  content: string
  elderlyName: string
  createTime: string
  status: string
}

const alarmList = ref<AlarmRecord[]>([])
const previousAlarmIds = ref<Set<number>>(new Set())

const getAlarmIcon = (type: string) => {
  const icons: Record<string, string> = {
    sos: '🆘',
    fall: '⚠️',
    heartRate: '🫀',
    battery: '🔋',
    fence: '📍'
  }
  return icons[type] || '🔔'
}

const getAlarmTitle = (type: string) => {
  const titles: Record<string, string> = {
    sos: '紧急求助',
    fall: '跌倒提醒',
    heartRate: '心率异常',
    battery: '设备低电量',
    fence: '越界提醒'
  }
  return titles[type] || '告警通知'
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const playAlarmSound = () => {
  uni.vibrateLong({
    success: () => {
      console.log('震动成功')
    },
    fail: () => {
      console.log('震动失败')
    }
  })
}

const showAlarmNotification = (alarm: AlarmRecord) => {
  const title = getAlarmTitle(alarm.type)
  const content = `${alarm.elderlyName} - ${alarm.content}`
  
  // 显示系统通知（安卓）
  uni.createPushMessage({
    title: title,
    content: content,
    badge: 1,
    success: () => {
      console.log('通知已发送到通知栏')
    },
    fail: () => {
      console.log('通知发送失败')
    }
  })
  
  // 显示弹窗提醒
  uni.showModal({
    title: '🆘 ' + title,
    content: content,
    showCancel: false,
    confirmText: '知道了',
    confirmColor: '#ff4d4f',
    success: () => {
      console.log('用户已确认告警')
    }
  })
}

const checkNewAlarms = (newAlarms: AlarmRecord[]) => {
  const newAlarmIds = new Set(newAlarms.map(a => a.id))
  
  newAlarms.forEach(alarm => {
    if (!previousAlarmIds.value.has(alarm.id) && alarm.status === 'pending') {
      playAlarmSound()
      
      if (alarm.type === 'sos') {
        showAlarmNotification(alarm)
      }
    }
  })
  
  previousAlarmIds.value = newAlarmIds
}

const handleAlarm = async (alarm: AlarmRecord) => {
  uni.showModal({
    title: '确认处理',
    content: `确定要处理这条告警吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await put(`/alarm/${alarm.id}/handle`)
          if (result.code === 200) {
            uni.showToast({ title: '处理成功', icon: 'success' })
            loadAlarms()
          } else {
            uni.showToast({ title: result.message || '处理失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '处理失败', icon: 'none' })
        }
      }
    }
  })
}

const loadAlarms = async () => {
  const userStr = uni.getStorageSync('user')
  if (!userStr) return

  const user = JSON.parse(userStr)

  try {
    const result = await get(`/alarm/guardian/${user.userId}`)
    if (result.code === 200 && result.data) {
      const newAlarms = result.data.map((item: any) => ({
        id: item.id,
        type: item.alarmType,
        content: item.content,
        elderlyName: item.elderlyName || '老人',
        createTime: item.createTime,
        status: item.status
      }))
      
      checkNewAlarms(newAlarms)
      alarmList.value = newAlarms
    }
  } catch (error) {
    console.error('Load alarms failed:', error)
    alarmList.value = [
      { id: 1, type: 'sos', content: '老人触发了紧急求助', elderlyName: '张奶奶', createTime: new Date().toISOString(), status: 'pending' },
      { id: 2, type: 'heartRate', content: '心率异常：120 bpm', elderlyName: '张奶奶', createTime: new Date(Date.now() - 3600000).toISOString(), status: 'handled' }
    ]
  }
}

onMounted(() => {
  loadAlarms()
  
  setInterval(() => {
    loadAlarms()
  }, 10000)
})

onShow(() => {
  loadAlarms()
})
</script>

<style lang="scss" scoped>
.alarm-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.alarm-list {
  padding: 20rpx;
}

.alarm-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &.sos {
    border-left: 6rpx solid #ff4d4f;
  }

  &.fall {
    border-left: 6rpx solid #faad14;
  }

  &.heartRate {
    border-left: 6rpx solid #ff7875;
  }

  &.battery {
    border-left: 6rpx solid #52c41a;
  }

  &.fence {
    border-left: 6rpx solid #1890ff;
  }
}

.alarm-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.alarm-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.alarm-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.alarm-time {
  font-size: 24rpx;
  color: #999;
}

.alarm-content {
  margin-bottom: 15rpx;
}

.alarm-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.alarm-elderly {
  font-size: 26rpx;
  color: #999;
}

.alarm-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alarm-status {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: #fff1f0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ff4d4f;

  &.handled {
    background: #f6ffed;
    color: #52c41a;
  }
}

.handle-btn {
  padding: 8rpx 24rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
  
  &:active {
    opacity: 0.8;
  }
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
}
</style>