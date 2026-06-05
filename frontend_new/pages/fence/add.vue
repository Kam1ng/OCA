<template>
  <view class="add-fence-container">
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">围栏名称 *</view>
        <input class="form-input" v-model="form.name" placeholder="请输入围栏名称" />
      </view>
      
      <view class="form-item">
        <view class="form-label">中心纬度</view>
        <input class="form-input" v-model="form.centerLatitude" placeholder="请输入纬度" type="digit" />
      </view>
      
      <view class="form-item">
        <view class="form-label">中心经度</view>
        <input class="form-input" v-model="form.centerLongitude" placeholder="请输入经度" type="digit" />
      </view>
      
      <view class="form-item">
        <view class="form-label">半径（米）</view>
        <input class="form-input" v-model="form.radius" placeholder="请输入半径" type="number" />
      </view>
      
      <view class="form-item">
        <view class="form-label">启用状态</view>
        <view class="status-options">
          <view 
            class="status-option" 
            :class="{ active: form.enabled === 1 }"
            @click="form.enabled = 1"
          >
            <text>启用</text>
          </view>
          <view 
            class="status-option" 
            :class="{ active: form.enabled === 0 }"
            @click="form.enabled = 0"
          >
            <text>禁用</text>
          </view>
        </view>
      </view>
      
      <view class="btn btn-primary mt-40" @click="submit">
        保存
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { post } from '@/utils/request'

const form = reactive({
  elderlyId: 1,
  name: '',
  centerLatitude: '39.9042',
  centerLongitude: '116.4074',
  radius: '500',
  enabled: 1
})

const submit = async () => {
  if (!form.name) {
    uni.showToast({ title: '请输入围栏名称', icon: 'none' })
    return
  }
  
  try {
    await post('/fence', {
      elderlyId: form.elderlyId,
      name: form.name,
      centerLatitude: parseFloat(form.centerLatitude),
      centerLongitude: parseFloat(form.centerLongitude),
      radius: parseInt(form.radius),
      enabled: form.enabled
    })
    
    uni.showToast({ title: '添加成功', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('Add fence failed:', error)
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  if (options.elderlyId) {
    form.elderlyId = parseInt(options.elderlyId)
  }
})
</script>

<style lang="scss" scoped>
.add-fence-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.form-section {
  padding: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.status-options {
  display: flex;
  gap: 20rpx;
}

.status-option {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #666;
  
  &.active {
    border-color: #1989fa;
    background: #e6f7ff;
    color: #1989fa;
  }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
  color: #fff;
}

.mt-40 {
  margin-top: 40rpx;
}
</style>