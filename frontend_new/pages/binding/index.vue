<template>
  <view class="binding-container">
    <view class="debug-info">
      <text style="font-size: 12px; color: red;">调试: userType={{ getUserType() }}, isGuardian={{ isGuardian }}</text>
    </view>
    <view class="custom-navbar">
      <text class="navbar-title">监护管理</text>
    </view>
    
    <view class="tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'request' }"
        @click="activeTab = 'request'"
        v-if="isGuardian"
      >
        <text>发起绑定</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        <text>待确认</text>
        <view v-if="pendingCount > 0" class="badge">{{ pendingCount }}</view>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'bound' }"
        @click="activeTab = 'bound'"
      >
        <text>已绑定</text>
      </view>
    </view>
    
    <view v-if="activeTab === 'request'" class="tab-content">
      <view class="form-section">
        <view class="form-item">
          <text class="label">老人手机号</text>
          <input 
            class="input" 
            v-model="phone" 
            placeholder="请输入老人手机号"
            type="number"
          />
        </view>
        <button class="submit-btn" @click="submitRequest">发起绑定请求</button>
      </view>
      <view class="tips">
        <text>💡 老人需要在"待确认"中同意绑定</text>
      </view>
    </view>
    
    <view v-if="activeTab === 'pending'" class="tab-content">
      <view v-if="pendingList.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无待确认的绑定请求</text>
      </view>
      <view v-else class="list">
        <view v-for="item in pendingList" :key="item.id" class="list-item">
          <view class="avatar">👤</view>
          <view class="info">
            <text class="name">{{ item.nickname || item.username }}</text>
            <text class="phone">{{ item.phone }}</text>
          </view>
          <view class="actions">
            <button class="action-btn accept" @click="acceptBinding(item.id)">接受</button>
            <button class="action-btn reject" @click="rejectBinding(item.id)">拒绝</button>
          </view>
        </view>
      </view>
    </view>
    
    <view v-if="activeTab === 'bound'" class="tab-content">
      <view v-if="boundList.length === 0" class="empty-state">
        <text class="empty-icon">🔗</text>
        <text class="empty-text">暂无绑定关系</text>
        <text class="empty-hint">请先发起或接受绑定请求</text>
      </view>
      <view v-else class="list">
        <view v-for="item in boundList" :key="item.id" class="list-item">
          <view class="avatar">👤</view>
          <view class="info">
            <text class="name">{{ item.nickname || item.username }}</text>
            <text class="phone">{{ item.phone }}</text>
            <text class="role">{{ getRole(item) }}</text>
          </view>
          <view class="actions">
            <button class="action-btn delete" @click="deleteBinding(item.id)">解除绑定</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { post, get, del } from '@/utils/request'

interface BindItem {
  id: number
  userId: number
  username: string
  phone: string
  nickname: string
  status: number
  role: string
}

const activeTab = ref('pending')
const phone = ref('')
const pendingList = ref<BindItem[]>([])
const boundList = ref<BindItem[]>([])
const isGuardian = ref(false)
const userId = ref<number | null>(null)

const pendingCount = computed(() => pendingList.value.length)

const getRole = (item: BindItem) => {
  return item.role || '未知'
}

const getUserType = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    const userData = JSON.parse(userStr)
    return userData.userType || 'undefined'
  }
  return 'no-user'
}

const initUserInfo = () => {
  const userStr = uni.getStorageSync('user')
  if (userStr) {
    const userData = JSON.parse(userStr)
    userId.value = userData.userId
    isGuardian.value = userData.userType === 'guardian'
    if (isGuardian.value) {
      activeTab.value = 'request'
    }
  }
}

const submitRequest = async () => {
  if (!phone.value) {
    uni.showToast({ title: '请输入老人手机号', icon: 'none' })
    return
  }

  try {
    await post('/binding/request', {
      phone: phone.value
    })
    uni.showToast({ title: '请求已发送', icon: 'success' })
    phone.value = ''
    loadBoundList()
  } catch (error: any) {
    uni.showToast({ title: error.message || '请求失败', icon: 'none' })
  }
}

const acceptBinding = async (id: number) => {
  uni.showModal({
    title: '确认绑定',
    content: '确定要接受该绑定请求吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await post(`/binding/${id}/accept`, {})
          uni.showToast({ title: '绑定成功', icon: 'success' })
          loadPendingList()
          loadBoundList()
        } catch (error: any) {
          uni.showToast({ title: error.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const rejectBinding = async (id: number) => {
  uni.showModal({
    title: '拒绝绑定',
    content: '确定要拒绝该绑定请求吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await post(`/binding/${id}/reject`, {})
          uni.showToast({ title: '已拒绝', icon: 'success' })
          loadPendingList()
        } catch (error: any) {
          uni.showToast({ title: error.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const deleteBinding = async (id: number) => {
  uni.showModal({
    title: '解除绑定',
    content: '确定要解除此绑定关系吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await del(`/binding/${id}`)
          uni.showToast({ title: '已解除绑定', icon: 'success' })
          loadBoundList()
        } catch (error: any) {
          uni.showToast({ title: error.message || '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const loadPendingList = async () => {
  try {
    const result = await get('/binding/pending')
    console.log('pending result:', result)
    pendingList.value = result.data || []
  } catch (error) {
    console.error('Load pending list failed:', error)
  }
}

const loadBoundList = async () => {
  try {
    const url = isGuardian.value ? '/binding/guardian/list' : '/binding/elderly/list'
    const result = await get(url)
    console.log('bound list result:', result)
    boundList.value = result.data || []
  } catch (error) {
    console.error('Load bound list failed:', error)
  }
}

onMounted(() => {
  initUserInfo()
  loadPendingList()
  loadBoundList()
})
</script>

<style lang="scss" scoped>
.binding-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.navbar-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.debug-info {
  position: fixed;
  top: 180rpx;
  left: 20rpx;
  right: 20rpx;
  background: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  z-index: 999;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.tabs {
  position: fixed;
  top: 100rpx;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  z-index: 99;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  position: relative;
  
  text {
    font-size: 28rpx;
    color: #666;
  }
  
  &.active {
    text {
      color: #1989fa;
      font-weight: bold;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #1989fa;
      border-radius: 2rpx;
    }
  }
}

.badge {
  position: absolute;
  top: 16rpx;
  right: 40rpx;
  min-width: 36rpx;
  height: 36rpx;
  background: #ff4d4f;
  border-radius: 18rpx;
  font-size: 22rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.tab-content {
  padding-top: 190rpx;
  padding-bottom: 40rpx;
}

.form-section {
  background: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.form-item {
  margin-bottom: 28rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #1989fa 0%, #40a9ff 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
  margin-top: 16rpx;
}

.tips {
  padding: 20rpx;
  margin: 20rpx;
  background: #fffbe6;
  border-radius: 12rpx;
  border-left: 6rpx solid #faad14;
  
  text {
    font-size: 26rpx;
    color: #ad8b00;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #bbb;
}

.list {
  padding: 20rpx;
}

.list-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 20rpx;
}

.info {
  flex: 1;
  
  .name {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .phone {
    font-size: 26rpx;
    color: #999;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .role {
    font-size: 24rpx;
    color: #1989fa;
    background: rgba(25, 137, 250, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
}

.actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
  
  &.accept {
    background: #52c41a;
    color: #fff;
  }
  
  &.reject {
    background: #f5f5f5;
    color: #666;
  }
  
  &.delete {
    background: #fff1f0;
    color: #ff4d4f;
    border: 1rpx solid #ffccc7;
  }
}
</style>