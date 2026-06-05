<template>
  <view class="home-container">
    <view class="header">
      <text class="header-title">监护中心</text>
      <text class="header-name">{{ nickname }}</text>
    </view>

    <view class="elderly-list">
      <view 
        class="elderly-card" 
        v-for="elderly in elderlyList" 
        :key="elderly.id"
        @click="selectElderly(elderly)"
        :class="{ active: selectedElderly?.id === elderly.id }"
      >
        <view class="elderly-avatar">{{ elderly.icon }}</view>
        <view class="elderly-info">
          <text class="elderly-name">{{ elderly.name }}</text>
          <text class="elderly-status" :class="elderly.status">{{ elderly.statusText }}</text>
        </view>
        <view class="elderly-arrow">›</view>
      </view>
    </view>

    <view class="quick-actions" v-if="selectedElderly">
      <text class="section-title">快捷操作</text>
      <view class="action-grid">
        <view class="action-item" @click="goLocation">
          <view class="action-icon">📍</view>
          <text class="action-text">实时位置</text>
        </view>
        <view class="action-item" @click="goHealth">
          <view class="action-icon">🫀</view>
          <text class="action-text">健康数据</text>
        </view>
        <view class="action-item" @click="goHistory">
          <view class="action-icon">📜</view>
          <text class="action-text">历史轨迹</text>
        </view>
        <view class="action-item" @click="goAlarm">
          <view class="action-icon">⚠️</view>
          <text class="action-text">告警记录</text>
        </view>
        <view class="action-item" @click="goFence">
          <view class="action-icon">🏠</view>
          <text class="action-text">电子围栏</text>
        </view>
        <view class="action-item" @click="sendMessage">
          <view class="action-icon">💬</view>
          <text class="action-text">发送消息</text>
        </view>
      </view>
    </view>

    <view class="empty-tip" v-if="!selectedElderly">
      <text class="tip-icon">👆</text>
      <text class="tip-text">请选择一位老人查看详情</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const nickname = ref('监护人')
const selectedElderly = ref(null)

const elderlyList = ref([
  {
    id: 1,
    name: '张大爷',
    icon: '👴',
    status: 'online',
    statusText: '在线'
  },
  {
    id: 2,
    name: '李大妈',
    icon: '👵',
    status: 'online',
    statusText: '在线'
  },
  {
    id: 3,
    name: '王爷爷',
    icon: '👴',
    status: 'offline',
    statusText: '离线'
  }
])

onMounted(() => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    const user = JSON.parse(userStr)
    nickname.value = user.nickname || '监护人'
  }
  
  if (elderlyList.value.length > 0) {
    selectedElderly.value = elderlyList.value[0]
  }
})

const selectElderly = (elderly) => {
  selectedElderly.value = elderly
}

const goLocation = () => {
  uni.navigateTo({ url: '/pages/location/index' })
}

const goHealth = () => {
  uni.navigateTo({ url: '/pages/health/index' })
}

const goHistory = () => {
  uni.navigateTo({ url: '/pages/history/index' })
}

const goAlarm = () => {
  uni.navigateTo({ url: '/pages/alarm/index' })
}

const goFence = () => {
  uni.navigateTo({ url: '/pages/fence/index' })
}

const sendMessage = () => {
  uni.showToast({ title: '消息功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #1890ff 0%, #1989fa 100%);
  padding: 80rpx 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.header-name {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.elderly-list {
  padding: 20rpx;
}

.elderly-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 15rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 3rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: #1890ff;
    background: #e6f7ff;
  }
}

.elderly-avatar {
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

.elderly-info {
  flex: 1;
}

.elderly-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.elderly-status {
  font-size: 24rpx;

  &.online {
    color: #52c41a;
  }

  &.offline {
    color: #999;
  }
}

.elderly-arrow {
  font-size: 40rpx;
  color: #ccc;
}

.quick-actions {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.action-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: 15rpx;
}

.action-text {
  font-size: 28rpx;
  color: #666;
}

.empty-tip {
  padding: 60rpx 40rpx;
  text-align: center;
}

.tip-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.tip-text {
  font-size: 32rpx;
  color: #999;
}
</style>
