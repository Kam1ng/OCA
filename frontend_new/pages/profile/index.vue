<template>
  <view class="profile-container">
    <view class="profile-header">
      <view class="avatar">
        <text class="avatar-icon">👤</text>
      </view>
      <view class="user-info">
        <text class="username">{{ user?.nickname || user?.username }}</text>
        <text class="user-id">ID: {{ user?.userId }}</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goEditProfile">
        <view class="menu-icon">👤</view>
        <text class="menu-text">修改个人信息</text>
        <text class="menu-arrow">→</text>
      </view>

      <view class="menu-item" @click="goChangePassword">
        <view class="menu-icon">🔑</view>
        <text class="menu-text">修改密码</text>
        <text class="menu-arrow">→</text>
      </view>

      <view class="menu-item" @click="goBinding">
        <view class="menu-icon">🔗</view>
        <text class="menu-text">监护管理</text>
        <text class="menu-arrow">→</text>
      </view>

      <view class="menu-item" @click="goFence">
        <view class="menu-icon">🏠</view>
        <text class="menu-text">电子围栏</text>
        <text class="menu-arrow">→</text>
      </view>

      <view class="menu-item" @click="goAbout">
        <view class="menu-icon">ℹ️</view>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">→</text>
      </view>
    </view>

    <view class="logout-btn" @click="logout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  userId: number
  username: string
  nickname: string
}

const user = ref<User | null>(null)

const loadUser = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
}

const goEditProfile = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const goChangePassword = () => {
  uni.showModal({
    title: '修改密码',
    editable: true,
    placeholderText: '请输入新密码',
    success: (res) => {
      if (res.confirm && res.content) {
        uni.showModal({
          title: '确认修改',
          content: '确定要修改密码吗？',
          success: async (confirmRes) => {
            if (confirmRes.confirm) {
              try {
                await uni.request({
                  url: 'http://10.200.195.245:8080/api/auth/change-password',
                  method: 'POST',
                  header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${uni.getStorageSync('token')}`
                  },
                  data: {
                    oldPassword: 'admin123',
                    newPassword: res.content
                  },
                  success: () => {
                    uni.showToast({ title: '密码修改成功', icon: 'success' })
                  }
                })
              } catch (error) {
                console.error('Change password failed:', error)
              }
            }
          }
        })
      }
    }
  })
}

const goBinding = () => {
  uni.navigateTo({ url: '/pages/binding/index' })
}

const goFence = () => {
  uni.navigateTo({ url: '/pages/fence/index' })
}

const goAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '老人监护系统 v1.0.0\n关爱老人，守护健康',
    showCancel: false
  })
}

const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('user')
        uni.redirectTo({ url: '/pages/login/index' })
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

.profile-header {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  padding: 80rpx 40rpx 60rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 60rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.user-id {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-list {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9f9f9;
  }
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.logout-btn {
  margin: 40rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.logout-text {
  font-size: 30rpx;
  color: #ff4d4f;
}
</style>