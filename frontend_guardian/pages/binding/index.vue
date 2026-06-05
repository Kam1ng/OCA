<template>
  <view class="binding-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">监护管理</text>
      <view class="header-right"></view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">已绑定老人</text>
        <text class="section-count">{{ bindingList.length }}位</text>
      </view>

      <view class="binding-list">
        <view 
          class="binding-item" 
          v-for="item in bindingList" 
          :key="item.id"
        >
          <view class="item-avatar">{{ item.avatar }}</view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-phone">{{ item.phone }}</text>
            <text class="item-status" :class="{ online: item.isOnline }">
              {{ item.isOnline ? '在线' : '离线' }}
            </text>
          </view>
          <view class="item-actions">
            <view class="action-btn message" @click="sendMessage(item)">
              <text>💬</text>
            </view>
            <view class="action-btn call" @click="makeCall(item.phone)">
              <text>📞</text>
            </view>
            <view class="action-btn unbind" @click="unbind(item)">
              <text>✕</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">发起绑定</text>
      </view>

      <view class="bind-form">
        <view class="form-item">
          <text class="form-label">老人手机号</text>
          <input class="form-input" v-model="bindForm.phone" placeholder="请输入老人手机号" />
        </view>
        <view class="form-item">
          <text class="form-label">关系</text>
          <view class="relation-options">
            <view 
              class="relation-option" 
              v-for="rel in relations" 
              :key="rel"
              :class="{ active: bindForm.relation === rel }"
              @click="bindForm.relation = rel"
            >
              <text>{{ rel }}</text>
            </view>
          </view>
        </view>
        <button class="bind-btn" @click="submitBind">发起绑定请求</button>
      </view>
    </view>

    <view class="tips-card">
      <text class="tips-icon">💡</text>
      <view class="tips-content">
        <text class="tips-title">绑定说明</text>
        <text class="tips-text">老人收到绑定请求后，需要在APP中确认同意才能完成绑定</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BindingItem {
  id: number
  name: string
  phone: string
  avatar: string
  isOnline: boolean
}

const bindingList = ref<BindingItem[]>([
  { id: 1, name: '李奶奶', phone: '13900139001', avatar: '👵', isOnline: true },
  { id: 2, name: '张爷爷', phone: '13800138002', avatar: '👴', isOnline: false },
  { id: 3, name: '王阿姨', phone: '13700137003', avatar: '👵', isOnline: true }
])

const bindForm = ref({
  phone: '',
  relation: '父母'
})

const relations = ['父母', '配偶', '子女', '兄弟姐妹', '其他']

const goBack = () => {
  uni.navigateBack()
}

const sendMessage = (item: BindingItem) => {
  uni.showToast({ title: `向${item.name}发送消息`, icon: 'none' })
}

const makeCall = (phone: string) => {
  uni.makePhoneCall({ phoneNumber: phone })
}

const unbind = (item: BindingItem) => {
  uni.showModal({
    title: '解除绑定',
    content: `确定要解除与${item.name}的监护关系吗？`,
    success: (res) => {
      if (res.confirm) {
        bindingList.value = bindingList.value.filter(i => i.id !== item.id)
        uni.showToast({ title: '解除成功', icon: 'success' })
      }
    }
  })
}

const submitBind = () => {
  if (!bindForm.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  uni.showToast({ title: '绑定请求已发送', icon: 'success' })
  bindForm.value = { phone: '', relation: '父母' }
}
</script>

<style lang="scss" scoped>
.binding-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  padding: 60rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 56rpx;
  color: #fff;
  line-height: 1;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.header-right {
  width: 60rpx;
}

.section {
  padding: 20rpx;
  margin-bottom: 25rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 26rpx;
  color: #999;
}

.binding-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.binding-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.item-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.item-phone {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.item-status {
  font-size: 22rpx;
  color: #999;
  padding: 4rpx 12rpx;
  background: #f5f5f5;
  border-radius: 10rpx;

  &.online {
    background: #f6ffed;
    color: #52c41a;
  }
}

.item-actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;

  &.message {
    background: #e6f7ff;
  }

  &.call {
    background: #f6ffed;
  }

  &.unbind {
    background: #fff2f0;
  }
}

.bind-form {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.form-item {
  margin-bottom: 25rpx;
}

.form-label {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  font-size: 28rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  box-sizing: border-box;
}

.relation-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.relation-option {
  padding: 15rpx 25rpx;
  border-radius: 25rpx;
  background: #f8f9fa;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #52c41a;
    color: #fff;
  }
}

.bind-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  border: none;
}

.tips-card {
  margin: 0 20rpx;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
  border-radius: 16rpx;
  padding: 25rpx;
  display: flex;
  gap: 20rpx;
  border: 2rpx solid #ffe58f;
}

.tips-icon {
  font-size: 40rpx;
}

.tips-content {
  flex: 1;
}

.tips-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.tips-text {
  font-size: 26rpx;
  color: #666;
}
</style>
