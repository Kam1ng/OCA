<template>
  <view class="add-fence-container">
    <view class="header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">添加围栏</text>
      <view class="header-right">
        <text class="save-btn" @click="saveFence">保存</text>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <text class="form-label">围栏名称</text>
        <input class="form-input" v-model="form.name" placeholder="请输入围栏名称" />
      </view>

      <view class="form-item">
        <text class="form-label">选择位置</text>
        <view class="location-picker" @click="openMapPicker">
          <text class="location-value" v-if="form.address">{{ form.address }}</text>
          <text class="location-placeholder" v-else>点击在地图上选择位置</text>
          <text class="location-arrow">›</text>
        </view>
        <view class="location-coords" v-if="form.longitude && form.latitude">
          <text>经度: {{ form.longitude.toFixed(6) }}   纬度: {{ form.latitude.toFixed(6) }}</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">范围半径</text>
        <view class="radius-selector">
          <view 
            class="radius-option" 
            v-for="radius in radiusOptions" 
            :key="radius"
            :class="{ active: form.radius === radius }"
            @click="form.radius = radius"
          >
            <text>{{ radius }}米</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">自定义半径</text>
        <view class="radius-slider">
          <input class="slider-input" type="number" v-model="form.customRadius" />
          <text class="slider-unit">米</text>
        </view>
        <slider 
          :value="form.customRadius" 
          :min="100" 
          :max="2000" 
          :step="50"
          activeColor="#1989fa"
          backgroundColor="#e8e8e8"
          block-size="20"
          @change="onSliderChange"
        />
      </view>

      <view class="form-item">
        <text class="form-label">告警方式</text>
        <view class="alert-options">
          <view 
            class="alert-option" 
            v-for="option in alertOptions" 
            :key="option.value"
            :class="{ active: form.alertType === option.value }"
            @click="form.alertType = option.value"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="switch-row">
          <text class="form-label">启用围栏</text>
          <switch :checked="form.enabled" @change="form.enabled = !form.enabled" color="#1989fa" />
        </view>
      </view>
    </view>

    <view class="map-preview">
      <text class="preview-title">围栏预览</text>
      <view class="preview-map">
        <view class="preview-area" :style="{ width: previewSize + 'rpx', height: previewSize + 'rpx' }">
          <view class="preview-center"></view>
        </view>
        <text class="preview-radius">{{ form.radius || form.customRadius || 500 }}米</text>
      </view>
    </view>

    <view v-if="showMapPicker" class="map-picker-mask">
      <web-view
        id="pickerWebView"
        src="/static/tianditu-picker.html"
        @message="onPickerMessage"
        class="map-picker-webview"
      ></web-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const form = ref({
  name: '',
  address: '',
  longitude: 0,
  latitude: 0,
  radius: 500,
  customRadius: 500,
  alertType: 'both',
  enabled: true
})

const showMapPicker = ref(false)

const radiusOptions = [200, 500, 1000, 1500]

const alertOptions = [
  { label: 'APP推送', value: 'app' },
  { label: '短信通知', value: 'sms' },
  { label: '两者都有', value: 'both' }
]

const previewSize = computed(() => {
  const radius = form.value.radius || form.value.customRadius || 500
  return Math.min(400, (radius / 2000) * 400 + 100)
})

const goBack = () => {
  uni.navigateBack()
}

const openMapPicker = () => {
  showMapPicker.value = true
}

const closeMapPicker = () => {
  showMapPicker.value = false
}

const onPickerMessage = (e: any) => {
  const data = e.detail.data[0]
  if (data.type === 'locationSelected') {
    form.value.address = data.data.address || '已选位置'
    form.value.longitude = data.data.lng
    form.value.latitude = data.data.lat
    showMapPicker.value = false
    uni.showToast({ title: '位置已选择', icon: 'success' })
  } else if (data.type === 'locationCancel') {
    showMapPicker.value = false
  }
}

const onSliderChange = (e: any) => {
  form.value.customRadius = e.detail.value
  form.value.radius = 0
}

const saveFence = () => {
  if (!form.value.name) {
    uni.showToast({ title: '请输入围栏名称', icon: 'none' })
    return
  }
  if (!form.value.address) {
    uni.showToast({ title: '请选择位置', icon: 'none' })
    return
  }
  if (!form.value.longitude || !form.value.latitude) {
    uni.showToast({ title: '位置坐标无效', icon: 'none' })
    return
  }
  
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.add-fence-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #1989fa 0%, #1890ff 100%);
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

.save-btn {
  font-size: 30rpx;
  color: #fff;
  font-weight: bold;
}

.form-section {
  padding: 20rpx;
}

.form-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 15rpx;
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

.location-picker {
  display: flex;
  align-items: center;
  padding: 25rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.location-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.location-placeholder {
  flex: 1;
  font-size: 28rpx;
  color: #999;
}

.location-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.radius-selector {
  display: flex;
  gap: 15rpx;
}

.radius-option {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 12rpx;
  background: #f8f9fa;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #1989fa;
    color: #fff;
  }
}

.radius-slider {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.slider-input {
  width: 150rpx;
  height: 70rpx;
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  border: 2rpx solid #1989fa;
  border-radius: 10rpx;
}

.slider-unit {
  font-size: 28rpx;
  color: #666;
  margin-left: 10rpx;
}

.alert-options {
  display: flex;
  gap: 15rpx;
}

.alert-option {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 12rpx;
  background: #f8f9fa;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #52c41a;
    color: #fff;
  }
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-preview {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 25rpx;
}

.preview-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.preview-map {
  height: 300rpx;
  background: linear-gradient(135deg, #e6f7ff 0%, #b3dfff 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-area {
  border: 4rpx dashed #1989fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-center {
  width: 20rpx;
  height: 20rpx;
  background: #1989fa;
  border-radius: 50%;
}

.preview-radius {
  position: absolute;
  bottom: 20rpx;
  right: 20rpx;
  font-size: 24rpx;
  color: #1989fa;
  background: rgba(255, 255, 255, 0.8);
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
}

.map-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 9999;
}

.map-picker-webview {
  width: 100%;
  height: 100%;
}

.location-coords {
  margin-top: 12rpx;
  padding: 12rpx 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
  font-family: monospace;
}
</style>
