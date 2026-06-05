<template>
  <view class="fence-container">
    <view class="section-header">
      <text class="section-title">电子围栏</text>
      <text class="add-btn" @click="goAddFence">+ 添加</text>
    </view>
    
    <view class="fence-list" v-if="fenceList.length > 0">
      <view class="fence-item" v-for="fence in fenceList" :key="fence.id">
        <view class="fence-header">
          <text class="fence-name">{{ fence.name }}</text>
          <text class="fence-status" :class="{ enabled: fence.enabled === 1 }">
            {{ fence.enabled === 1 ? '已启用' : '已禁用' }}
          </text>
        </view>
        <view class="fence-info">
          <view class="info-row">
            <text class="info-label">中心位置</text>
            <text class="info-value">{{ fence.centerLatitude }}, {{ fence.centerLongitude }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">半径</text>
            <text class="info-value">{{ fence.radius }}米</text>
          </view>
        </view>
        <view class="fence-actions">
          <text class="action-text" @click="toggleFence(fence.id, fence.enabled)">
            {{ fence.enabled === 1 ? '禁用' : '启用' }}
          </text>
          <text class="action-text delete" @click="deleteFence(fence.id)">删除</text>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <text class="empty-icon">🏠</text>
      <text class="empty-text">暂无电子围栏</text>
      <text class="empty-btn" @click="goAddFence">立即添加</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get, put, del } from '@/utils/request'

interface Fence {
  id: number
  name: string
  centerLatitude: number
  centerLongitude: number
  radius: number
  enabled: number
}

const fenceList = ref<Fence[]>([])
const currentElderlyId = ref(1)

const loadFences = async () => {
  try {
    const result = await get(`/fence/elderly/${currentElderlyId.value}`)
    fenceList.value = result.data
  } catch (error) {
    console.error('Load fences failed:', error)
  }
}

const goAddFence = () => {
  uni.navigateTo({ url: `/pages/fence/add?elderlyId=${currentElderlyId.value}` })
}

const toggleFence = async (id: number, enabled: number) => {
  try {
    await put(`/fence/${id}`, {
      enabled: enabled === 1 ? 0 : 1
    })
    await loadFences()
    uni.showToast({ title: enabled === 1 ? '已禁用' : '已启用', icon: 'success' })
  } catch (error) {
    console.error('Toggle fence failed:', error)
  }
}

const deleteFence = async (id: number) => {
  uni.showModal({
    title: '删除围栏',
    content: '确定要删除这个电子围栏吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await del(`/fence/${id}`)
          await loadFences()
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (error) {
          console.error('Delete fence failed:', error)
        }
      }
    }
  })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  if (options.elderlyId) {
    currentElderlyId.value = parseInt(options.elderlyId)
  }
  loadFences()
})
</script>

<style lang="scss" scoped>
.fence-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  font-size: 28rpx;
  color: #1989fa;
}

.fence-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.fence-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.fence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.fence-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.fence-status {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  background: #f5f5f5;
  color: #999;
  border-radius: 20rpx;
  
  &.enabled {
    background: #f6ffed;
    color: #52c41a;
  }
}

.fence-info {
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #999;
}

.info-value {
  font-size: 26rpx;
  color: #333;
}

.fence-actions {
  display: flex;
  gap: 40rpx;
  padding-top: 16rpx;
}

.action-text {
  font-size: 28rpx;
  color: #1989fa;
  
  &.delete {
    color: #ff4d4f;
  }
}

.empty-state {
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.empty-btn {
  font-size: 28rpx;
  color: #1989fa;
  padding: 16rpx 40rpx;
  border: 2rpx solid #1989fa;
  border-radius: 40rpx;
}
</style>