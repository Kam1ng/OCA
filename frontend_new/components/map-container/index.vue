<template>
  <view class="map-wrapper">
    <view v-if="isH5" id="map-container" class="map-container"></view>
    <view v-else class="static-map">
      <image 
        class="map-image" 
        :src="staticMapUrl" 
        mode="aspectFit"
        @click="previewImage"
      />
      <view class="map-overlay">
        <text class="location-text">📍 {{ latitude.toFixed(6) }}, {{ longitude.toFixed(6) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps({
  latitude: {
    type: Number,
    default: 39.9042
  },
  longitude: {
    type: Number,
    default: 116.4074
  },
  markers: {
    type: Array,
    default: () => []
  },
  zoom: {
    type: Number,
    default: 16
  }
})

const emit = defineEmits(['markerTap', 'mapClick'])

const isH5 = ref(false)
let mapInstance = null

const TIANDITU_KEY = 'YOUR_TIANDITU_KEY'
const TIANDITU_URL = `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`

const staticMapUrl = computed(() => {
  const level = 16
  const x = Math.floor((props.longitude + 180) / 360 * Math.pow(2, level))
  const y = Math.floor((1 - Math.log(Math.tan(props.latitude * Math.PI / 180) + 1 / Math.cos(props.latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, level))
  return `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX=${level}&TILEROW=${y}&TILECOL=${x}&tk=${TIANDITU_KEY}`
})

const initMap = async () => {
  if (typeof window === 'undefined' || !window.maplibregl) {
    console.log('MapLibre not available, using static map fallback')
    return
  }

  try {
    mapInstance = new window.maplibregl.Map({
      container: 'map-container',
      style: {
        version: 8,
        sources: {
          'tianditu': {
            type: 'raster',
            tiles: [
              `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'tianditu-layer',
            type: 'raster',
            source: 'tianditu',
            minzoom: 0,
            maxzoom: 18
          }
        ]
      },
      center: [props.longitude, props.latitude],
      zoom: props.zoom
    })

    mapInstance.addControl(new window.maplibregl.NavigationControl(), 'top-right')

    mapInstance.on('load', () => {
      addMarkers()
    })

    mapInstance.on('click', (e) => {
      emit('mapClick', {
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng
      })
    })
  } catch (error) {
    console.error('Failed to initialize MapLibre:', error)
  }
}

const addMarkers = () => {
  if (!mapInstance) return

  props.markers.forEach(marker => {
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.innerHTML = '📍'
    el.style.fontSize = '32px'
    el.style.cursor = 'pointer'

    el.addEventListener('click', () => {
      emit('markerTap', marker)
    })

    new window.maplibregl.Marker(el)
      .setLngLat([marker.longitude || marker.lng, marker.latitude || marker.lat])
      .setPopup(
        new window.maplibregl.Popup({ offset: 25 })
          .setHTML(`<div style="padding:8px;font-size:14px;">${marker.title || '位置'}</div>`)
      )
      .addTo(mapInstance)
  })
}

const updateCenter = () => {
  if (mapInstance) {
    mapInstance.flyTo({
      center: [props.longitude, props.latitude],
      zoom: props.zoom,
      duration: 1000
    })
  }
}

const previewImage = () => {
  uni.previewImage({
    urls: [staticMapUrl.value],
    current: 0
  })
}

onMounted(() => {
  isH5.value = typeof window !== 'undefined'
  
  if (isH5.value) {
    if (typeof window.maplibregl === 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js'
      script.onload = () => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css'
        document.head.appendChild(link)
        initMap()
      }
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

watch(() => [props.latitude, props.longitude], () => {
  if (isH5.value) {
    updateCenter()
  }
})
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
}

.static-map {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f0f0f0;
}

.map-image {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  bottom: 20rpx;
  left: 20rpx;
  right: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  padding: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.location-text {
  font-size: 26rpx;
  color: #333;
}

.custom-marker {
  cursor: pointer;
}
</style>