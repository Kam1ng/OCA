<template>
  <view class="register-container">
    <view class="register-header">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">注册</text>
    </view>

    <view class="register-form">
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
          v-model="form.phone"
          type="text"
          placeholder="请输入手机号"
          class="input"
        />
      </view>

      <view class="form-item">
        <input
          v-model="form.nickname"
          type="text"
          placeholder="请输入昵称"
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

      <view class="form-item">
        <input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请确认密码"
          class="input"
        />
      </view>

      <button class="register-btn" @click="handleRegister">注 册</button>

      <view class="login-link">
        <text class="link-text" @click="goToLogin">已有账号？立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { post } from '@/utils/request'

interface RegisterForm {
  username: string
  phone: string
  nickname: string
  password: string
  confirmPassword: string
}

const form = ref<RegisterForm>({
  username: '',
  phone: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const goBack = () => {
  uni.navigateBack()
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}

const handleRegister = async () => {
  if (!form.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!form.value.nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!form.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: '两次密码输入不一致', icon: 'none' })
    return
  }

  try {
    const res = await post('/auth/register', {
      username: form.value.username,
      phone: form.value.phone,
      nickname: form.value.nickname,
      password: form.value.password,
      userType: 'elderly',
      captchaKey: '',
      captchaCode: ''
    }, false)

    if (res.code === 200) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/index' })
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '注册失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '网络请求失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  display: flex;
  flex-direction: column;
  padding: 40rpx;
}

.register-header {
  padding-top: 60rpx;
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;
}

.back-btn {
  font-size: 60rpx;
  color: #fff;
  margin-right: 20rpx;
  line-height: 1;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.register-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  flex: 1;
}

.form-item {
  margin-bottom: 30rpx;
}

.input {
  height: 90rpx;
  background: #f5f5f5;
  border-radius: 45rpx;
  padding: 0 40rpx;
  font-size: 30rpx;
}

.register-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 45rpx;
  margin-top: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }
}

.login-link {
  margin-top: 40rpx;
  text-align: center;
}

.link-text {
  color: #52c41a;
  font-size: 30rpx;
}
</style>