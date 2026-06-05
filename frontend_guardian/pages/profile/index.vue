<template>
  <view class="profile-container">
    <view class="header">
      <view class="avatar">
        <text class="avatar-icon">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ user?.nickname || '监护人' }}</text>
        <text class="user-id">ID: {{ userIdStr }}</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item logout" @click="logout">
        <text class="menu-icon">🚪</text>
        <text class="menu-text">退出登录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="version">
      <text>健康守护 v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface User {
  userId: number
  username: string
  nickname: string
  userType: string
}

const user = ref<User | null>(null)

const userIdStr = computed(() => {
  if (!user.value?.userId) return '000000'
  return String(user.value.userId).padStart(6, '0')
})

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
}

const goSettings = () => {
  uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

const goAbout = () => {
  uni.showToast({ title: '关于我们', icon: 'none' })
}

const logout = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后需要重新登录',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('user')
        uni.removeStorageSync('isElderlyUser')
        uni.reLaunch({ url: '/pages/login/index' })
      }
    }
  })
}

onMounted(() => {
  loadUser()
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  padding: 80rpx 40rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 70rpx;
  margin-right: 30rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-list {
  padding: 30rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 35rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &.logout .menu-text {
    color: #ff4d4f;
  }
}

.menu-icon {
  font-size: 44rpx;
  margin-right: 25rpx;
}

.menu-text {
  flex: 1;
  font-size: 34rpx;
  color: #333;
}

.menu-arrow {
  font-size: 44rpx;
  color: #ccc;
}

.version {
  text-align: center;
  padding: 60rpx;
  font-size: 28rpx;
  color: #999;
}
</style>