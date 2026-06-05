<template>
  <view class="login-container">
    <view class="login-header">
      <text class="title">老人端</text>
      <text class="subtitle">关爱老人 守护健康</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <input
          v-model="form.phone"
          type="text"
          placeholder="请输入手机号"
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
        <text class="link-text" @click="goToRegister">没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request'

interface LoginForm {
  phone: string
  password: string
}

const form = ref<LoginForm>({
  phone: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.phone || !form.value.password) {
    uni.showToast({ title: '请输入手机号密码', icon: 'none' })
    return
  }

  try {
    const res = await post('/auth/login', { ...form.value, clientType: 'elderly' }, false)

    if (res.code === 200) {
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('user', JSON.stringify(res.data))
      uni.setStorageSync('isElderlyUser', 'true')
      uni.switchTab({ url: '/pages/index/index' })
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  }
}

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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
    font-size: 64rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
  }

  .subtitle {
    display: block;
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 50rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.form-item {
  margin-bottom: 30rpx;

  .input {
    height: 100rpx;
    background: #f5f5f5;
    border-radius: 50rpx;
    padding: 0 40rpx;
    font-size: 36rpx;
  }
}

.login-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 40rpx;
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
  margin-top: 40rpx;
  text-align: center;
}

.link-text {
  color: #52c41a;
  font-size: 32rpx;
}
</style>