<template>
  <view class="login-container">
    <view class="login-header">
      <text class="title">老人监护系统</text>
      <text class="subtitle">关爱老人，守护健康</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <input
          v-model="form.username"
          type="text"
          placeholder="请输入用户名"
          class="input"
        />
      </view>

      <view class="form-item">
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          class="input"
        />
      </view>

      <button class="login-btn" @click="handleLogin">登 录</button>

      <view class="register-link">
        <text>还没有账号？</text>
        <text class="link" @click="goRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { BackgroundService } from '@/utils/background-service.js'
import { post } from '@/utils/request.ts'

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    uni.showToast({ title: '请输入账号密码', icon: 'none' })
    return
  }

  try {
    const res = await post('/auth/login', form.value)

    if (res.code === 200) {
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('user', JSON.stringify(res.data))

      const isElderly = res.data.userType === 'elderly'
      uni.setStorageSync('isElderlyUser', isElderly ? 'true' : 'false')

      if (isElderly) {
        BackgroundService.start()
      }

      uni.switchTab({ url: '/pages/index/index' })
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  }
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;

  .title {
    display: block;
    font-size: 56rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.form-item {
  margin-bottom: 40rpx;

  .input {
    height: 90rpx;
    background: #f5f5f5;
    border-radius: 45rpx;
    padding: 0 40rpx;
    font-size: 28rpx;
  }
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 45rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}

.register-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 26rpx;
  color: #666;

  .link {
    color: #667eea;
    margin-left: 10rpx;
  }
}
</style>