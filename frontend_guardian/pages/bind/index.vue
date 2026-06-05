<template>
  <view class="bind-container">
    <view class="header">
      <view class="header-top">
        <text class="back-btn" @click="goBack">‹</text>
        <text class="title">绑定管理</text>
      </view>
      <text class="subtitle">管理您的监护绑定关系</text>
    </view>

    <view class="bind-list" v-if="bindList.length > 0">
      <view
        class="bind-item"
        v-for="item in bindList"
        :key="item.id"
      >
        <view class="bind-avatar">
          <text class="avatar-icon">👴</text>
        </view>
        <view class="bind-info">
          <text class="bind-name">{{ item.elderlyName }}</text>
          <text class="bind-status" :class="{ active: item.status === 'active', pending: item.status === 'pending' }">
            {{ item.status === 'active' ? '已绑定' : '待确认' }}
          </text>
        </view>
        <view class="bind-actions">
          <button class="unbind-btn" @click="unbind(item)">解除</button>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">🔗</text>
      <text class="empty-text">暂无绑定关系</text>
    </view>

    <view class="add-section">
      <view class="add-header">
        <text class="add-title">添加新绑定</text>
      </view>
      <view class="add-form">
        <view class="form-item">
          <input
            v-model="phone"
            type="text"
            placeholder="请输入老人手机号"
            class="input"
          />
        </view>
        <button class="add-btn" @click="addBind">添加绑定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request'

interface BindRecord {
  id: number
  elderlyId: number
  elderlyName: string
  status: string
}

const bindList = ref<BindRecord[]>([])
const phone = ref('')

const goBack = () => {
  uni.navigateBack()
}

const loadBindings = async () => {
  const userStr = uni.getStorageSync('user')
  if (!userStr) return

  const user = JSON.parse(userStr)

  try {
    const result = await get(`/binding/guardian/list`)
    if (result.code === 200 && result.data) {
      bindList.value = result.data.map((item: any) => ({
        id: item.id,
        elderlyId: item.elderlyId,
        elderlyName: item.elderlyName || item.nickname || '老人',
        status: item.status === 1 ? 'active' : 'pending'
      }))
    }
  } catch (error) {
    console.error('Load bindings failed:', error)
  }
}

const unbind = (item: BindRecord) => {
  uni.showModal({
    title: '确认解除',
    content: `确认要解除与 ${item.elderlyName} 的绑定吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await del(`/binding/${item.id}`)
          if (result.code === 200) {
            uni.showToast({ title: '已解除绑定', icon: 'success' })
            loadBindings()
          }
        } catch (error) {
          uni.showToast({ title: '解除失败', icon: 'none' })
        }
      }
    }
  })
}

const addBind = async () => {
  if (!phone.value) {
    uni.showToast({ title: '请输入老人手机号', icon: 'none' })
    return
  }

  const userStr = uni.getStorageSync('user')
  if (!userStr) return

  const user = JSON.parse(userStr)

  try {
    const result = await post('/binding/request', {
      guardianId: user.userId,
      phone: phone.value
    })
    if (result.code === 200) {
      uni.showToast({ title: '绑定请求已发送，等待老人确认', icon: 'success' })
      phone.value = ''
      loadBindings()
    } else {
      uni.showToast({ title: result.message || '绑定失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  }
}

onMounted(() => {
  loadBindings()
})

onShow(() => {
  loadBindings()
})
</script>

<style lang="scss" scoped>
.bind-container {
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

.bind-list {
  padding: 20rpx;
}

.bind-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.bind-avatar {
  width: 80rpx;
  height: 80rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 40rpx;
}

.bind-info {
  flex: 1;
}

.bind-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.bind-status {
  font-size: 26rpx;
  color: #999;
  display: inline-block;
  padding: 4rpx 15rpx;
  background: #f5f5f5;
  border-radius: 15rpx;

  &.active {
    background: #f6ffed;
    color: #52c41a;
  }

  &.pending {
    background: #fff7e6;
    color: #fa8c16;
  }
}

.bind-actions {
  margin-left: 15rpx;
}

.unbind-btn {
  font-size: 26rpx;
  color: #ff4d4f;
  background: transparent;
  padding: 10rpx 20rpx;
  border: 1rpx solid #ff4d4f;
  border-radius: 20rpx;

  &::after {
    border: none;
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

.add-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.add-header {
  margin-bottom: 20rpx;
}

.add-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-form {
  display: flex;
  gap: 15rpx;
}

.form-item {
  flex: 1;
}

.input {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.add-btn {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  color: #fff;
  font-size: 28rpx;
  padding: 0 30rpx;
  height: 80rpx;
  border-radius: 40rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}
</style>