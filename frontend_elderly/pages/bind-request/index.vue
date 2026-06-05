<template>
  <view class="bind-request-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">绑定请求</text>
      </view>
      <text class="subtitle">处理监护人的绑定申请</text>
    </view>

    <view class="request-list" v-if="requestList.length > 0">
      <view
        class="request-item"
        v-for="item in requestList"
        :key="item.id"
      >
        <view class="request-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="request-info">
          <text class="request-name">{{ item.nickname || '监护人' }}</text>
          <text class="request-phone">手机号：{{ item.phone }}</text>
          <text class="request-time">申请时间：{{ formatTime(item.createTime) }}</text>
        </view>
        <view class="request-actions">
          <button class="accept-btn" @click="acceptRequest(item)">同意</button>
          <button class="reject-btn" @click="rejectRequest(item)">拒绝</button>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无待处理的绑定请求</text>
    </view>

    <view class="bind-list-section" v-if="acceptedList.length > 0">
      <view class="section-header">
        <text class="section-title">已同意的监护人</text>
      </view>
      <view
        class="bind-item"
        v-for="item in acceptedList"
        :key="item.id"
      >
        <view class="bind-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="bind-info">
          <text class="bind-name">{{ item.nickname || '监护人' }}</text>
          <text class="bind-phone">{{ item.phone }}</text>
        </view>
        <button class="remove-btn" @click="removeBinding(item)">解除</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request'

interface BindRequest {
  id: number
  userId: number
  elderlyId: number
  nickname: string
  phone: string
  status: number
  createTime: string
}

const requestList = ref<BindRequest[]>([])
const acceptedList = ref<BindRequest[]>([])

const goBack = () => {
  uni.navigateBack()
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const date = new Date(timeStr.replace('T', ' '))
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadRequests = async () => {
  const userStr = uni.getStorageSync('user')
  if (!userStr) return

  const user = JSON.parse(userStr)

  try {
    const result = await get(`/binding/elderly/list`)
    if (result.code === 200 && result.data) {
      const allList = result.data as BindRequest[]
      requestList.value = allList.filter(item => item.status === 0)
      acceptedList.value = allList.filter(item => item.status === 1)
    }
  } catch (error) {
    console.error('Load requests failed:', error)
    requestList.value = []
    acceptedList.value = []
  }
}

const acceptRequest = async (item: BindRequest) => {
  uni.showModal({
    title: '确认同意',
    content: `确认同意 "${item.nickname || item.phone}" 的绑定请求吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await post(`/binding/${item.id}/accept`)
          if (result.code === 200) {
            uni.showToast({ title: '已同意绑定', icon: 'success' })
            loadRequests()
          } else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '网络请求失败', icon: 'none' })
        }
      }
    }
  })
}

const rejectRequest = async (item: BindRequest) => {
  uni.showModal({
    title: '确认拒绝',
    content: `确认拒绝 "${item.nickname || item.phone}" 的绑定请求吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await post(`/bind/${item.id}/reject`)
          if (result.code === 200) {
            uni.showToast({ title: '已拒绝请求', icon: 'success' })
            loadRequests()
          } else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '网络请求失败', icon: 'none' })
        }
      }
    }
  })
}

const removeBinding = async (item: BindRequest) => {
  uni.showModal({
    title: '确认解除',
    content: `确认要解除与 "${item.nickname || item.phone}" 的绑定关系吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await del(`/binding/${item.id}`)
          if (result.code === 200) {
            uni.showToast({ title: '已解除绑定', icon: 'success' })
            loadRequests()
          } else {
            uni.showToast({ title: result.message || '操作失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '网络请求失败', icon: 'none' })
        }
      }
    }
  })
}

onMounted(() => {
  loadRequests()
})

onShow(() => {
  loadRequests()
})
</script>

<style lang="scss" scoped>
.bind-request-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
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
  line-height: 1;
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

.request-list {
  padding: 20rpx;
}

.request-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.request-avatar {
  width: 80rpx;
  height: 80rpx;
  background: #f0f5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 40rpx;
}

.request-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.request-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.request-phone {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 6rpx;
}

.request-time {
  font-size: 24rpx;
  color: #999;
}

.request-actions {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.accept-btn,
.reject-btn {
  font-size: 26rpx;
  padding: 12rpx 30rpx;
  border-radius: 25rpx;
  border: none;

  &::after {
    border: none;
  }
}

.accept-btn {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.reject-btn {
  background: #fff;
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
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

.bind-list-section {
  padding: 20rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.bind-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.bind-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bind-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.bind-phone {
  font-size: 26rpx;
  color: #666;
}

.remove-btn {
  font-size: 26rpx;
  color: #ff4d4f;
  background: transparent;
  padding: 12rpx 25rpx;
  border: 1rpx solid #ff4d4f;
  border-radius: 25rpx;

  &::after {
    border: none;
  }
}
</style>