<template>
  <view class="register-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">注册账号</text>
    </view>
    
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">用户名</view>
        <input 
          class="form-input" 
          v-model="username" 
          placeholder="请输入用户名"
          type="text"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">密码</view>
        <input 
          class="form-input" 
          v-model="password" 
          placeholder="请输入密码"
          type="password"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">确认密码</view>
        <input 
          class="form-input" 
          v-model="confirmPassword" 
          placeholder="请再次输入密码"
          type="password"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">手机号</view>
        <input 
          class="form-input" 
          v-model="phone" 
          placeholder="请输入手机号"
          type="number"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">昵称</view>
        <input 
          class="form-input" 
          v-model="nickname" 
          placeholder="请输入昵称"
          type="text"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">身份选择</view>
        <view class="role-selector">
          <view 
            class="role-item" 
            :class="{ active: role === 'elderly' }"
            @click="role = 'elderly'"
          >
            <text class="role-icon">👴</text>
            <text class="role-text">老人</text>
          </view>
          <view 
            class="role-item" 
            :class="{ active: role === 'guardian' }"
            @click="role = 'guardian'"
          >
            <text class="role-icon">👨‍👩‍👧</text>
            <text class="role-text">监护人</text>
          </view>
        </view>
      </view>
      
      <view class="form-item captcha-item">
        <view class="form-label">验证码</view>
        <view class="captcha-row">
          <input 
            class="form-input captcha-input" 
            v-model="captchaCode" 
            placeholder="请输入验证码"
            type="text"
          />
          <image 
            class="captcha-image" 
            :src="captchaBase64" 
            mode="widthFix"
            @click="refreshCaptcha"
          />
        </view>
      </view>
      
      <view class="btn btn-primary mt-40" @click="register">
        注册
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { post, get } from '@/utils/request'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const phone = ref('')
const nickname = ref('')
const role = ref('')
const captchaKey = ref('')
const captchaCode = ref('')
const captchaBase64 = ref('')

const refreshCaptcha = async () => {
  try {
    const res = await get('/captcha/generate', undefined, false)
    console.log('captcha response:', res)
    if (res.code === 200) {
      captchaKey.value = res.data.captchaKey
      captchaBase64.value = res.data.captchaBase64
      captchaCode.value = ''
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

const register = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    uni.showToast({ title: '请填写必填项', icon: 'none' })
    return
  }
  
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  
  if (!role.value) {
    uni.showToast({ title: '请选择身份', icon: 'none' })
    return
  }
  
  if (!captchaCode.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  try {
    console.log('register data:', {
      username: username.value,
      password: password.value,
      phone: phone.value,
      nickname: nickname.value,
      role: role.value,
      captchaKey: captchaKey.value,
      captchaCode: captchaCode.value
    })
    const res = await post('/auth/register', {
      username: username.value,
      password: password.value,
      phone: phone.value,
      nickname: nickname.value,
      role: role.value,
      captchaKey: captchaKey.value,
      captchaCode: captchaCode.value
    })
    console.log('register response:', res)

    if (res.code === 200) {
      uni.showToast({ title: '注册成功', icon: 'success' })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '注册失败', icon: 'none' })
      refreshCaptcha()
    }
  } catch (error: any) {
    uni.showToast({ title: error.message || '注册失败', icon: 'none' })
    refreshCaptcha()
  }
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  padding: 60rpx 40rpx 30rpx;
  background: #fff;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.form-section {
  padding: 40rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
  background: #fff;
}

.role-selector {
  display: flex;
  gap: 30rpx;
}

.role-item {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.role-item.active {
  border-color: #1989fa;
  background: rgba(25, 137, 250, 0.1);
}

.role-icon {
  font-size: 40rpx;
}

.role-text {
  font-size: 30rpx;
  color: #333;
}

.captcha-item {
  margin-bottom: 24rpx;
}

.captcha-row {
  display: flex;
  gap: 20rpx;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 160rpx;
  height: 88rpx;
  border-radius: 12rpx;
  border: 2rpx solid #eee;
}

.btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.btn-primary {
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  color: #fff;
}

.mt-40 {
  margin-top: 40rpx;
}
</style>