<template>
  <view class="detail-container">
    <view class="detail-card" v-if="elderly">
      <view class="card-header">
        <view class="elderly-avatar">
          <text>{{ elderly.gender === 0 ? '👴' : '👵' }}</text>
        </view>
        <view class="elderly-info">
          <text class="elderly-name">{{ elderly.name }}</text>
          <text class="elderly-detail">{{ elderly.age }}岁 · {{ elderly.gender === 0 ? '男' : '女' }}</text>
        </view>
      </view>
      
      <view class="info-section">
        <view class="info-row">
          <text class="info-label">手机号</text>
          <text class="info-value">{{ elderly.phone || '未填写' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">住址</text>
          <text class="info-value">{{ elderly.address || '未填写' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">紧急联系人</text>
          <text class="info-value">{{ elderly.emergencyContact || '未填写' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">紧急电话</text>
          <text class="info-value">{{ elderly.emergencyPhone || '未填写' }}</text>
        </view>
        <view class="info-row last">
          <text class="info-label">健康备注</text>
          <text class="info-value">{{ elderly.healthNotes || '无' }}</text>
        </view>
      </view>
    </view>
    
    <view class="action-section">
      <view class="action-btn" @click="goAddHealth">
        <text class="action-icon">📊</text>
        <text class="action-text">录入健康数据</text>
      </view>
      <view class="action-btn" @click="goFence">
        <text class="action-icon">🏠</text>
        <text class="action-text">设置电子围栏</text>
      </view>
      <view class="action-btn" @click="goMap">
        <text class="action-icon">📍</text>
        <text class="action-text">查看位置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'

interface Elderly {
  id: number
  name: string
  age: number
  gender: number
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  healthNotes: string
}

const elderly = ref<Elderly | null>(null)

const loadElderly = async (id: number) => {
  try {
    const result = await get(`/elderly/${id}`)
    elderly.value = result.data
  } catch (error) {
    console.error('Load elderly failed:', error)
  }
}

const goAddHealth = () => {
  if (!elderly.value) return
  uni.navigateTo({ url: `/pages/health/add?elderlyId=${elderly.value.id}` })
}

const goFence = () => {
  if (!elderly.value) return
  uni.navigateTo({ url: `/pages/fence/index?elderlyId=${elderly.value.id}` })
}

const goMap = () => {
  uni.switchTab({ url: '/pages/map/index' })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  const id = parseInt(options.id || '1')
  loadElderly(id)
})
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.elderly-avatar {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
}

.elderly-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.elderly-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.elderly-detail {
  font-size: 28rpx;
  color: #999;
}

.info-section {
  padding-top: 20rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
  
  &.last {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
}

.action-section {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.action-btn {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}
</style>