<template>
  <view class="elderly-container">
    <view class="header">
      <text class="header-title">老人管理</text>
      <text class="header-count">{{ elderlyList.length }}位老人</text>
    </view>

    <view class="search-add">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" placeholder="搜索老人姓名" />
      </view>
      <button class="add-btn" @click="goAddElderly">+</button>
    </view>

    <view class="elderly-list" v-if="elderlyList.length > 0">
      <view 
        class="elderly-card" 
        v-for="elderly in elderlyList" 
        :key="elderly.id"
        @click="goElderlyDetail(elderly)"
      >
        <view class="card-header">
          <view class="elderly-avatar">{{ elderly.avatar }}</view>
          <view class="elderly-info">
            <text class="elderly-name">{{ elderly.name }}</text>
            <text class="elderly-phone">{{ elderly.phone }}</text>
          </view>
          <view class="elderly-status" :class="{ online: elderly.isOnline }">
            <text>{{ elderly.isOnline ? '在线' : '离线' }}</text>
          </view>
        </view>

        <view class="card-body">
          <view class="health-summary">
            <view class="summary-item">
              <text class="summary-icon">🫀</text>
              <text class="summary-value">{{ elderly.heartRate || '--' }}</text>
              <text class="summary-label">心率</text>
            </view>
            <view class="summary-item">
              <text class="summary-icon">👟</text>
              <text class="summary-value">{{ elderly.steps || '--' }}</text>
              <text class="summary-label">步数</text>
            </view>
            <view class="summary-item">
              <text class="summary-icon">🔋</text>
              <text class="summary-value">{{ elderly.battery || '--' }}%</text>
              <text class="summary-label">电量</text>
            </view>
          </view>
        </view>

        <view class="card-footer">
          <view class="footer-info">
            <text class="location">{{ elderly.lastLocation || '暂无位置信息' }}</text>
          </view>
          <text class="footer-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">👨‍👩‍👧</text>
      <text class="empty-text">暂无绑定的老人</text>
      <button class="empty-btn" @click="goAddElderly">立即绑定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'

interface Elderly {
  id: number
  name: string
  phone: string
  avatar: string
  isOnline: boolean
  heartRate?: number
  steps?: number
  battery?: number
  lastLocation?: string
}

const elderlyList = ref<Elderly[]>([
  {
    id: 1,
    name: '李奶奶',
    phone: '13900139001',
    avatar: '👵',
    isOnline: true,
    heartRate: 72,
    steps: 3567,
    battery: 85,
    lastLocation: '北京市朝阳区XX小区'
  },
  {
    id: 2,
    name: '张爷爷',
    phone: '13800138002',
    avatar: '👴',
    isOnline: false,
    heartRate: null,
    steps: null,
    battery: null,
    lastLocation: '暂无位置信息'
  },
  {
    id: 3,
    name: '王阿姨',
    phone: '13700137003',
    avatar: '👵',
    isOnline: true,
    heartRate: 68,
    steps: 5234,
    battery: 62,
    lastLocation: '北京市海淀区XX街道'
  }
])

const loadElderlyList = async () => {
  try {
    const result = await get('/binding/guardian')
    if (result.code === 200 && result.data) {
      elderlyList.value = result.data.map((item: any) => ({
        id: item.elderlyId,
        name: item.elderlyNickname,
        phone: item.elderlyPhone,
        avatar: '👴',
        isOnline: true,
        heartRate: null,
        steps: null,
        battery: null,
        lastLocation: null
      }))
    }
  } catch (error) {
    console.error('Load elderly list failed:', error)
  }
}

const goElderlyDetail = (elderly: Elderly) => {
  uni.navigateTo({ url: `/pages/elderly/detail?id=${elderly.id}&name=${elderly.name}` })
}

const goAddElderly = () => {
  uni.navigateTo({ url: '/pages/binding/index' })
}

onMounted(() => {
  loadElderlyList()
})
</script>

<style lang="scss" scoped>
.elderly-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  padding: 80rpx 40rpx 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.header-count {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.search-add {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  margin-top: -20rpx;
}

.search-box {
  flex: 1;
  background: #fff;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
}

.add-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #1989fa;
  color: #fff;
  font-size: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(25, 137, 250, 0.3);
}

.elderly-list {
  padding: 0 20rpx;
}

.elderly-card {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.elderly-avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
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

.elderly-phone {
  font-size: 26rpx;
  color: #999;
}

.elderly-status {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  background: #f5f5f5;

  text {
    font-size: 24rpx;
    color: #999;
  }

  &.online {
    background: #f6ffed;

    text {
      color: #52c41a;
    }
  }
}

.card-body {
  padding: 25rpx 30rpx;
}

.health-summary {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-icon {
  font-size: 36rpx;
  margin-bottom: 10rpx;
}

.summary-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.summary-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fafafa;
}

.location {
  font-size: 26rpx;
  color: #666;
}

.footer-arrow {
  font-size: 32rpx;
  color: #ccc;
  margin-left: auto;
}

.empty-state {
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 34rpx;
  color: #999;
  display: block;
  margin-bottom: 30rpx;
}

.empty-btn {
  background: #1989fa;
  color: #fff;
  font-size: 30rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}
</style>
