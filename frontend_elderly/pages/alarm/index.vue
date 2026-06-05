<template>
  <view class="alarm-container">
    <view class="header">
      <text class="title">消息中心</text>
    </view>

    <view class="message-list" v-if="messages.length > 0">
      <view
        class="message-item"
        v-for="item in messages"
        :key="item.id"
        :class="{ unread: !item.read }"
        @click="readMessage(item)"
      >
        <text class="item-icon">{{ item.icon }}</text>
        <view class="item-content">
          <text class="item-text">{{ item.content }}</text>
          <text class="item-time">{{ item.time }}</text>
        </view>
        <view class="item-dot" v-if="!item.read"></view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">💬</text>
      <text class="empty-text">暂无消息</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '@/utils/request'

interface Message {
  id: number
  icon: string
  content: string
  time: string
  read: boolean
}

const messages = ref<Message[]>([])

const loadMessages = async () => {
  const userStr = uni.getStorageSync('user')
  if (!userStr) return

  const user = JSON.parse(userStr)
  if (!user.elderlyId) return

  try {
    const result = await get(`/message/elderly/${user.elderlyId}`)
    if (result.code === 200 && result.data) {
      messages.value = result.data.map((item: any) => ({
        id: item.id,
        icon: item.type === 'family' ? '💬' : '📢',
        content: item.content,
        time: formatTime(item.createTime),
        read: item.read === 1
      }))
    }
  } catch (error) {
    console.error('Load messages failed:', error)
    messages.value = [
      { id: 1, icon: '💬', content: '儿子：妈妈，今天天气冷，记得多穿点衣服~', time: '10:30', read: false },
      { id: 2, icon: '📢', content: '您的健康数据已同步完成', time: '09:00', read: false }
    ]
  }
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const readMessage = (item: Message) => {
  item.read = true
}

onMounted(() => {
  loadMessages()
})

onShow(() => {
  loadMessages()
})
</script>

<style lang="scss" scoped>
.alarm-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.message-list {
  padding: 30rpx;
}

.message-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &.unread {
    background: #fff8f0;
  }
}

.item-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.item-content {
  flex: 1;
}

.item-text {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
  line-height: 1.5;
}

.item-time {
  font-size: 24rpx;
  color: #999;
}

.item-dot {
  width: 16rpx;
  height: 16rpx;
  background: #ff4d4f;
  border-radius: 50%;
  margin-left: 15rpx;
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