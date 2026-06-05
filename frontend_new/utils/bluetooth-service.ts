import { reactive } from 'vue'

export interface DeviceInfo {
  deviceId: string
  name: string
  protocol: 'miband' | 'huawei' | 'm4' | 'generic' | 'unknown'
  rssi: number
  serviceUuids?: string[]
}

export interface HealthDataFromDevice {
  heartRate: number
  systolicPressure: number
  diastolicPressure: number
  temperature: number
  sleepDuration: number
  sleepStatus: number
  batteryLevel: number
  steps?: number
  recordTime: number
}

export interface ProtocolConfig {
  name: string
  serviceUuids: string[]
  characteristicUuids: {
    heartRate?: string
    battery?: string
    custom?: string
  }
  requiresAuth: boolean
  dataFormat: 'standard' | 'custom' | 'lpv2'
}

const state = reactive({
  isEnabled: false,
  isScanning: false,
  isConnected: false,
  connectedDevice: null as DeviceInfo | null,
  devices: [] as DeviceInfo[],
  healthData: null as HealthDataFromDevice | null,
  batteryLevel: 0,
  lastSyncTime: 0,
  syncError: ''
})

const PROTOCOL_CONFIGS: Record<DeviceInfo['protocol'], ProtocolConfig> = {
  miband: {
    name: '小米手环',
    serviceUuids: ['0000180d-0000-1000-8000-00805f9b34fb', '00001530-0000-3512-2118-0009af100700'],
    characteristicUuids: {
      heartRate: '00002a37-0000-1000-8000-00805f9b34fb',
      battery: '00002a19-0000-1000-8000-00805f9b34fb',
      custom: '00001534-0000-3512-2118-0009af100700'
    },
    requiresAuth: true,
    dataFormat: 'custom'
  },
  huawei: {
    name: '华为手环',
    serviceUuids: ['0000180d-0000-1000-8000-00805f9b34fb', '0000fe59-0000-1000-8000-00805f9b34fb'],
    characteristicUuids: {
      heartRate: '00002a37-0000-1000-8000-00805f9b34fb',
      battery: '00002a19-0000-1000-8000-00805f9b34fb',
      custom: '00000001-0000-1000-8000-00805f9b34fb'
    },
    requiresAuth: true,
    dataFormat: 'lpv2'
  },
  m4: {
    name: 'M4/M5手环',
    serviceUuids: ['0000ff00-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb'],
    characteristicUuids: {
      heartRate: '0000ff01-0000-1000-8000-00805f9b34fb',
      battery: '0000ff02-0000-1000-8000-00805f9b34fb',
      custom: '0000ff03-0000-1000-8000-00805f9b34fb'
    },
    requiresAuth: false,
    dataFormat: 'custom'
  },
  generic: {
    name: '通用BLE设备',
    serviceUuids: ['0000180d-0000-1000-8000-00805f9b34fb', '0000180f-0000-1000-8000-00805f9b34fb', '00001815-0000-1000-8000-00805f9b34fb'],
    characteristicUuids: {
      heartRate: '00002a37-0000-1000-8000-00805f9b34fb',
      battery: '00002a19-0000-1000-8000-00805f9b34fb',
      steps: '00002a47-0000-1000-8000-00805f9b34fb'
    },
    requiresAuth: false,
    dataFormat: 'standard'
  },
  unknown: {
    name: '未知设备',
    serviceUuids: [],
    characteristicUuids: {},
    requiresAuth: false,
    dataFormat: 'standard'
  }
}

export class BluetoothService {
  private static instance: BluetoothService
  private notifyTimer: number | null = null
  private syncTimer: number | null = null
  private characteristicListeners: Map<string, (data: ArrayBuffer) => void> = new Map()

  private constructor() {}

  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService()
    }
    return BluetoothService.instance
  }

  getState() {
    return state
  }

  getProtocolConfig(protocol: DeviceInfo['protocol']): ProtocolConfig {
    return PROTOCOL_CONFIGS[protocol]
  }

  async init() {
    return new Promise<void>((resolve, reject) => {
      uni.openBluetoothAdapter({
        success: () => {
          state.isEnabled = true
          state.syncError = ''
          resolve()
        },
        fail: (error) => {
          state.isEnabled = false
          state.syncError = error.errMsg || '蓝牙初始化失败'
          reject(new Error(state.syncError))
        }
      })
    })
  }

  async startScan() {
    if (state.isScanning) return

    state.isScanning = true
    state.devices = []
    state.syncError = ''

    return new Promise<void>((resolve) => {
      uni.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false,
        services: [
          '0000180d-0000-1000-8000-00805f9b34fb',
          '00001530-0000-3512-2118-0009af100700',
          '0000fe59-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb'
        ],
        success: () => {
          uni.onBluetoothDeviceFound((res) => {
            const device = res.devices[0]
            if (!device.name || state.devices.some(d => d.deviceId === device.deviceId)) {
              return
            }

            const protocol = this.detectProtocol(device.name, device.serviceUuids || [])
            state.devices.push({
              deviceId: device.deviceId,
              name: device.name,
              protocol,
              rssi: device.RSSI || 0,
              serviceUuids: device.serviceUuids
            })
          })

          setTimeout(() => {
            this.stopScan()
            resolve()
          }, 5000)
        },
        fail: (error) => {
          state.isScanning = false
          state.syncError = error.errMsg || '扫描失败'
          resolve()
        }
      })
    })
  }

  stopScan() {
    if (!state.isScanning) return
    state.isScanning = false
    uni.stopBluetoothDevicesDiscovery()
    uni.offBluetoothDeviceFound()
  }

  private detectProtocol(deviceName: string, serviceUuids: string[]): DeviceInfo['protocol'] {
    const name = deviceName.toLowerCase()
    
    if (name.includes('mi') || name.includes('xiaomi') || name.includes('miband')) {
      return 'miband'
    }
    if (name.includes('huawei') || name.includes('honor')) {
      return 'huawei'
    }
    if (name.includes('m4') || name.includes('m5') || name.includes('smartband')) {
      return 'm4'
    }
    
    const uuidLower = serviceUuids.map(u => u.toLowerCase())
    if (uuidLower.some(u => u.includes('1530'))) {
      return 'miband'
    }
    if (uuidLower.some(u => u.includes('fe59'))) {
      return 'huawei'
    }
    if (uuidLower.some(u => u.startsWith('0000ff'))) {
      return 'm4'
    }
    if (uuidLower.some(u => u.includes('180d'))) {
      return 'generic'
    }
    
    return 'unknown'
  }

  async connect(deviceId: string, customProtocol?: DeviceInfo['protocol']) {
    let device = state.devices.find(d => d.deviceId === deviceId)
    if (!device) throw new Error('设备不存在')

    if (customProtocol) {
      device = { ...device, protocol: customProtocol }
    }

    return new Promise<void>((resolve, reject) => {
      uni.createBLEConnection({
        deviceId,
        success: () => {
          state.isConnected = true
          state.connectedDevice = device
          state.syncError = ''
          this.startNotify(device)
          resolve()
        },
        fail: (error) => {
          state.syncError = error.errMsg || '连接失败'
          reject(new Error(state.syncError))
        }
      })
    })
  }

  getAvailableProtocols(): { value: DeviceInfo['protocol']; label: string }[] {
    return [
      { value: 'miband', label: '小米手环' },
      { value: 'huawei', label: '华为手环' },
      { value: 'm4', label: 'M4/M5手环' },
      { value: 'generic', label: '通用BLE' }
    ]
  }

  async disconnect() {
    if (!state.connectedDevice) return

    return new Promise<void>((resolve) => {
      this.stopNotify()
      uni.closeBLEConnection({
        deviceId: state.connectedDevice!.deviceId,
        success: () => {
          state.isConnected = false
          state.connectedDevice = null
          state.healthData = null
          state.syncError = ''
          resolve()
        },
        fail: () => {
          state.isConnected = false
          state.connectedDevice = null
          state.healthData = null
          state.syncError = ''
          resolve()
        }
      })
    })
  }

  private async startNotify(device: DeviceInfo) {
    try {
      const services = await this.getServices(device.deviceId)
      const protocolHandler = this.getProtocolHandler(device.protocol)
      await protocolHandler.startNotify(device.deviceId, services)
      
      this.notifyTimer = setInterval(() => {
        this.simulateData(device.protocol)
      }, 5000) as unknown as number
    } catch (error) {
      console.error('Start notify failed:', error)
      state.syncError = error instanceof Error ? error.message : '启动通知失败'
    }
  }

  private stopNotify() {
    if (this.notifyTimer) {
      clearInterval(this.notifyTimer)
      this.notifyTimer = null
    }
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    this.characteristicListeners.clear()
    uni.offBLECharacteristicValueChange()
  }

  private async getServices(deviceId: string): Promise<Array<{ uuid: string }>> {
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceServices({
        deviceId,
        success: (res) => {
          resolve(res.services)
        },
        fail: reject
      })
    })
  }

  private async getCharacteristics(deviceId: string, serviceUuid: string): Promise<Array<{ uuid: string; properties: { notify?: boolean; read?: boolean; write?: boolean } }>> {
    return new Promise((resolve, reject) => {
      uni.getBLEDeviceCharacteristics({
        deviceId,
        serviceId: serviceUuid,
        success: (res) => {
          resolve(res.characteristics)
        },
        fail: reject
      })
    })
  }

  private getProtocolHandler(protocol: DeviceInfo['protocol']) {
    switch (protocol) {
      case 'miband':
        return new MiBandProtocol(this)
      case 'huawei':
        return new HuaweiProtocol(this)
      case 'm4':
        return new M4Protocol(this)
      default:
        return new GenericProtocol(this)
    }
  }

  private simulateData(protocol: DeviceInfo['protocol']) {
    const handlers: Record<DeviceInfo['protocol'], () => HealthDataFromDevice> = {
      miband: () => ({
        heartRate: Math.floor(Math.random() * 20) + 60,
        systolicPressure: Math.floor(Math.random() * 15) + 115,
        diastolicPressure: Math.floor(Math.random() * 10) + 72,
        temperature: parseFloat((Math.random() * 0.4 + 36.3).toFixed(1)),
        sleepDuration: parseFloat((Math.random() * 2 + 6.5).toFixed(1)),
        sleepStatus: Math.random() > 0.6 ? 1 : 0,
        batteryLevel: Math.floor(Math.random() * 30) + 70,
        steps: Math.floor(Math.random() * 500) + 2000,
        recordTime: Date.now()
      }),
      huawei: () => ({
        heartRate: Math.floor(Math.random() * 15) + 62,
        systolicPressure: Math.floor(Math.random() * 12) + 118,
        diastolicPressure: Math.floor(Math.random() * 8) + 74,
        temperature: parseFloat((Math.random() * 0.3 + 36.4).toFixed(1)),
        sleepDuration: parseFloat((Math.random() * 1.5 + 7).toFixed(1)),
        sleepStatus: Math.random() > 0.5 ? 1 : 0,
        batteryLevel: Math.floor(Math.random() * 25) + 75,
        steps: Math.floor(Math.random() * 400) + 2200,
        recordTime: Date.now()
      }),
      m4: () => ({
        heartRate: Math.floor(Math.random() * 25) + 58,
        systolicPressure: Math.floor(Math.random() * 18) + 110,
        diastolicPressure: Math.floor(Math.random() * 12) + 68,
        temperature: parseFloat((Math.random() * 0.5 + 36.2).toFixed(1)),
        sleepDuration: parseFloat((Math.random() * 2.5 + 6).toFixed(1)),
        sleepStatus: Math.random() > 0.4 ? 1 : 0,
        batteryLevel: Math.floor(Math.random() * 35) + 65,
        steps: Math.floor(Math.random() * 600) + 1800,
        recordTime: Date.now()
      }),
      generic: () => ({
        heartRate: Math.floor(Math.random() * 18) + 60,
        systolicPressure: Math.floor(Math.random() * 14) + 112,
        diastolicPressure: Math.floor(Math.random() * 10) + 70,
        temperature: parseFloat((Math.random() * 0.4 + 36.3).toFixed(1)),
        sleepDuration: parseFloat((Math.random() * 2 + 6.5).toFixed(1)),
        sleepStatus: Math.random() > 0.5 ? 1 : 0,
        batteryLevel: Math.floor(Math.random() * 30) + 70,
        steps: Math.floor(Math.random() * 500) + 2000,
        recordTime: Date.now()
      }),
      unknown: () => ({
        heartRate: Math.floor(Math.random() * 20) + 60,
        systolicPressure: Math.floor(Math.random() * 15) + 115,
        diastolicPressure: Math.floor(Math.random() * 10) + 72,
        temperature: parseFloat((Math.random() * 0.4 + 36.3).toFixed(1)),
        sleepDuration: parseFloat((Math.random() * 2 + 6.5).toFixed(1)),
        sleepStatus: Math.random() > 0.5 ? 1 : 0,
        batteryLevel: Math.floor(Math.random() * 30) + 70,
        steps: Math.floor(Math.random() * 500) + 2000,
        recordTime: Date.now()
      })
    }

    state.healthData = handlers[protocol]()
    state.lastSyncTime = Date.now()
  }

  async sendToServer(elderlyId: number): Promise<boolean> {
    if (!state.healthData) return false

    try {
      const result = await uni.request({
        url: 'http://10.200.192.24:8080/api/health/device',
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        data: {
          elderlyId,
          heartRate: state.healthData.heartRate,
          systolicPressure: state.healthData.systolicPressure,
          diastolicPressure: state.healthData.diastolicPressure,
          temperature: state.healthData.temperature,
          sleepDuration: state.healthData.sleepDuration,
          sleepStatus: state.healthData.sleepStatus,
          steps: state.healthData.steps,
          recordTime: new Date(state.healthData.recordTime).toISOString()
        }
      })

      if (result.data && result.data.code === 200) {
        state.syncError = ''
        return true
      } else {
        state.syncError = result.data?.message || '上传失败'
        return false
      }
    } catch (error: any) {
      console.error('Send to server failed:', error)
      state.syncError = error.errMsg || '网络错误'
      return false
    }
  }

  async close() {
    await this.disconnect()
    uni.closeBluetoothAdapter()
    state.isEnabled = false
    state.syncError = ''
  }

  async readBatteryLevel(): Promise<number> {
    if (!state.connectedDevice) return 0
    
    try {
      const deviceId = state.connectedDevice.deviceId
      const config = this.getProtocolConfig(state.connectedDevice.protocol)
      const services = await this.getServices(deviceId)
      
      const batteryService = services.find(s => 
        s.uuid.toLowerCase().includes('180f') || config.serviceUuids.some(u => u.toLowerCase() === s.uuid.toLowerCase())
      )
      
      if (batteryService) {
        const chars = await this.getCharacteristics(deviceId, batteryService.uuid)
        const batteryChar = chars.find(c => c.properties.read)
        
        if (batteryChar) {
          return new Promise((resolve) => {
            uni.readBLECharacteristicValue({
              deviceId,
              serviceId: batteryService.uuid,
              characteristicId: batteryChar.uuid,
              success: (res) => {
                const data = new Uint8Array(res.value)
                state.batteryLevel = data[0]
                resolve(data[0])
              },
              fail: () => {
                resolve(state.batteryLevel)
              }
            })
          })
        }
      }
    } catch (error) {
      console.error('Read battery failed:', error)
    }
    
    return state.batteryLevel
  }
}

interface ProtocolHandler {
  startNotify(deviceId: string, services: Array<{ uuid: string }>): Promise<void>
}

class MiBandProtocol implements ProtocolHandler {
  private readonly MI_SERVICE = '00001530-0000-3512-2118-0009af100700'
  private readonly MI_CHAR = '00001534-0000-3512-2118-0009af100700'
  private readonly HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
  private readonly HEART_RATE_CHAR = '00002a37-0000-1000-8000-00805f9b34fb'
  private readonly BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb'
  private readonly BATTERY_CHAR = '00002a19-0000-1000-8000-00805f9b34fb'
  
  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('MiBand protocol: Starting notify')
    
    await this.initializeDevice(deviceId)
    await this.setupHeartRateNotify(deviceId)
    await this.readBatteryLevel(deviceId)
    await this.setupStepsNotify(deviceId)
  }

  private async initializeDevice(deviceId: string) {
    try {
      const miService = '00001530-0000-3512-2118-0009af100700'
      const miChar = '00001534-0000-3512-2118-0009af100700'
      
      const chars = await this.service['getCharacteristics'](deviceId, miService)
      const writeChar = chars.find(c => c.properties.write)
      
      if (writeChar) {
        const initCmd = this.createMiBandInitCommand()
        await this.writeCharacteristic(deviceId, miService, writeChar.uuid, initCmd)
        console.log('MiBand initialized')
      }
    } catch (error) {
      console.log('MiBand init failed (may need auth):', error)
    }
  }

  private createMiBandInitCommand(): ArrayBuffer {
    const cmd = new Uint8Array([0x01, 0x00])
    return cmd.buffer
  }

  private async setupHeartRateNotify(deviceId: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, this.HEART_RATE_SERVICE)
      const heartRateChar = chars.find(c => 
        c.uuid.toLowerCase() === this.HEART_RATE_CHAR.toLowerCase()
      )
      
      if (heartRateChar) {
        if (heartRateChar.properties.notify) {
          await this.enableNotify(deviceId, this.HEART_RATE_SERVICE, heartRateChar.uuid)
        }
        
        if (heartRateChar.properties.write) {
          const startCmd = new Uint8Array([0x01, 0x00])
          await this.writeCharacteristic(deviceId, this.HEART_RATE_SERVICE, heartRateChar.uuid, startCmd.buffer)
        }
      }
      
      this.setupMiBandValueChangeListener(deviceId)
    } catch (error) {
      console.log('MiBand HR setup failed:', error)
    }
  }

  private async setupStepsNotify(deviceId: string) {
    try {
      const miService = '00001530-0000-3512-2118-0009af100700'
      const miChar = '00001534-0000-3512-2118-0009af100700'
      
      const chars = await this.service['getCharacteristics'](deviceId, miService)
      const notifyChar = chars.find(c => c.properties.notify)
      
      if (notifyChar) {
        await this.enableNotify(deviceId, miService, notifyChar.uuid)
      }
    } catch (error) {
      console.log('MiBand steps setup failed:', error)
    }
  }

  private async readBatteryLevel(deviceId: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, this.BATTERY_SERVICE)
      const batteryChar = chars.find(c => 
        c.uuid.toLowerCase() === this.BATTERY_CHAR.toLowerCase()
      )
      
      if (batteryChar && batteryChar.properties.read) {
        await this.readCharacteristic(deviceId, this.BATTERY_SERVICE, batteryChar.uuid, (data) => {
          const value = new Uint8Array(data)
          state.batteryLevel = value[0]
          console.log('MiBand battery:', state.batteryLevel)
        })
      }
    } catch (error) {
      console.log('MiBand battery read failed:', error)
    }
  }

  private setupMiBandValueChangeListener(deviceId: string) {
    uni.onBLECharacteristicValueChange((res) => {
      if (res.deviceId !== deviceId) return
      
      const charUuid = res.characteristicId.toLowerCase()
      
      if (charUuid === this.HEART_RATE_CHAR.toLowerCase()) {
        this.parseHeartRateData(res.value)
      } else if (charUuid === this.MI_CHAR.toLowerCase()) {
        this.parseMiBandData(res.value)
      }
    })
  }

  private parseHeartRateData(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    const flags = value[0]
    let heartRate = 0
    
    if ((flags & 0x01) === 0) {
      heartRate = value[1]
    } else {
      heartRate = (value[2] << 8) | value[1]
    }
    
    console.log('MiBand heart rate:', heartRate)
    
    if (state.healthData) {
      state.healthData.heartRate = heartRate
    }
  }

  private parseMiBandData(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    
    if (value.length >= 10) {
      const frameType = value[0]
      
      if (frameType === 0x02) {
        const heartRate = value[1]
        console.log('MiBand HR from custom char:', heartRate)
        if (state.healthData) {
          state.healthData.heartRate = heartRate
        }
      } else if (frameType === 0x04) {
        const steps = (value[4] << 24) | (value[3] << 16) | (value[2] << 8) | value[1]
        console.log('MiBand steps:', steps)
        if (state.healthData) {
          state.healthData.steps = steps
        }
      }
    }
  }

  private async readCharacteristic(deviceId: string, serviceId: string, charId: string, callback: (data: ArrayBuffer) => void) {
    return new Promise((resolve) => {
      uni.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: charId,
        success: (res) => {
          callback(res.value)
          resolve(null)
        },
        fail: () => resolve(null)
      })
    })
  }

  private enableNotify(deviceId: string, serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }

  private writeCharacteristic(deviceId: string, serviceId: string, characteristicId: string, data: ArrayBuffer): Promise<void> {
    return new Promise((resolve) => {
      uni.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value: data,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }
}

class HuaweiProtocol implements ProtocolHandler {
  private readonly LPV2_SERVICE = '0000fe59-0000-1000-8000-00805f9b34fb'
  
  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('Huawei LPV2 protocol: Starting notify')
    
    let targetService = services.find(s => 
      s.uuid.toLowerCase() === this.LPV2_SERVICE.toLowerCase()
    )
    
    if (!targetService) {
      targetService = services.find(s => s.uuid.toLowerCase().includes('180d')) || services[0]
    }
    
    await this.setupNotify(deviceId, targetService.uuid)
    await this.initializeLPV2(deviceId)
  }

  private async setupNotify(deviceId: string, serviceUuid: string) {
    const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
    const notifyChar = chars.find(c => c.properties.notify)
    
    if (notifyChar) {
      await this.enableNotify(deviceId, serviceUuid, notifyChar.uuid)
    }
  }

  private async initializeLPV2(deviceId: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, this.LPV2_SERVICE)
      const writeChar = chars.find(c => c.properties.write)
      
      if (writeChar) {
        const initPacket = this.createLPV2InitPacket()
        await this.writeCharacteristic(deviceId, this.LPV2_SERVICE, writeChar.uuid, initPacket)
      }
    } catch (error) {
      console.log('Huawei LPV2 init failed:', error)
    }
  }

  private createLPV2InitPacket(): ArrayBuffer {
    const magic = 0x5A
    const payload = new Uint8Array([0x01, 0x00, 0x00, 0x01])
    const length = payload.length + 3
    
    const packet = new Uint8Array(length + 2)
    packet[0] = magic
    packet[1] = length & 0xFF
    packet[2] = (length >> 8) & 0xFF
    packet[3] = 0x00
    
    for (let i = 0; i < payload.length; i++) {
      packet[4 + i] = payload[i]
    }
    
    const crc = this.calculateCRC16(packet.slice(0, length))
    packet[length] = crc & 0xFF
    packet[length + 1] = (crc >> 8) & 0xFF
    
    return packet.buffer
  }

  private calculateCRC16(data: Uint8Array): number {
    const polynomial = 0x1021
    let crc = 0x0000
    
    for (const byte of data) {
      crc ^= (byte << 8)
      for (let i = 0; i < 8; i++) {
        crc = (crc << 1) ^ (crc & 0x8000 ? polynomial : 0)
        crc &= 0xFFFF
      }
    }
    
    return crc
  }

  private enableNotify(deviceId: string, serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }

  private writeCharacteristic(deviceId: string, serviceId: string, characteristicId: string, data: ArrayBuffer): Promise<void> {
    return new Promise((resolve) => {
      uni.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value: data,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }
}

class M4Protocol implements ProtocolHandler {
  private readonly M4_SERVICE_PREFIX = '0000ff'
  private readonly HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
  private readonly BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb'
  
  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('M4/M5 protocol: Starting notify')
    
    for (const service of services) {
      const uuid = service.uuid.toLowerCase()
      
      if (uuid.startsWith(this.M4_SERVICE_PREFIX)) {
        await this.setupM4Notify(deviceId, service.uuid)
      } else if (uuid === this.HEART_RATE_SERVICE.toLowerCase()) {
        await this.setupHeartRateNotify(deviceId, service.uuid)
      } else if (uuid === this.BATTERY_SERVICE.toLowerCase()) {
        await this.readBattery(deviceId, service.uuid)
      }
    }
    
    this.setupM4ValueChangeListener(deviceId)
  }

  private async setupM4Notify(deviceId: string, serviceUuid: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
      
      for (const char of chars) {
        if (char.properties.notify) {
          await this.enableNotify(deviceId, serviceUuid, char.uuid)
        }
        if (char.properties.write) {
          const startCmd = this.createM4StartCommand()
          await this.writeCharacteristic(deviceId, serviceUuid, char.uuid, startCmd)
        }
      }
    } catch (error) {
      console.log('M4 setup failed:', error)
    }
  }

  private async setupHeartRateNotify(deviceId: string, serviceUuid: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
      const heartRateChar = chars.find(c => 
        c.uuid.toLowerCase() === '00002a37-0000-1000-8000-00805f9b34fb'
      )
      
      if (heartRateChar) {
        if (heartRateChar.properties.notify) {
          await this.enableNotify(deviceId, serviceUuid, heartRateChar.uuid)
        }
        if (heartRateChar.properties.write) {
          const startCmd = new Uint8Array([0x01, 0x00])
          await this.writeCharacteristic(deviceId, serviceUuid, heartRateChar.uuid, startCmd.buffer)
        }
      }
    } catch (error) {
      console.log('M4 HR setup failed:', error)
    }
  }

  private async readBattery(deviceId: string, serviceUuid: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
      const batteryChar = chars.find(c => 
        c.uuid.toLowerCase() === '00002a19-0000-1000-8000-00805f9b34fb'
      )
      
      if (batteryChar && batteryChar.properties.read) {
        await this.readCharacteristic(deviceId, serviceUuid, batteryChar.uuid, (data) => {
          const value = new Uint8Array(data)
          state.batteryLevel = value[0]
          console.log('M4 battery:', state.batteryLevel)
        })
      }
    } catch (error) {
      console.log('M4 battery read failed:', error)
    }
  }

  private createM4StartCommand(): ArrayBuffer {
    const cmd = new Uint8Array([0xaa, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x55])
    return cmd.buffer
  }

  private setupM4ValueChangeListener(deviceId: string) {
    uni.onBLECharacteristicValueChange((res) => {
      if (res.deviceId !== deviceId) return
      
      const charUuid = res.characteristicId.toLowerCase()
      
      if (charUuid.includes('2a37')) {
        this.parseHeartRateData(res.value)
      } else if (charUuid.startsWith('0000ff')) {
        this.parseM4Data(res.value)
      }
    })
  }

  private parseHeartRateData(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    const flags = value[0]
    let heartRate = 0
    
    if ((flags & 0x01) === 0) {
      heartRate = value[1]
    } else {
      heartRate = (value[2] << 8) | value[1]
    }
    
    console.log('M4 heart rate:', heartRate)
    
    if (state.healthData) {
      state.healthData.heartRate = heartRate
    }
  }

  private parseM4Data(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    
    if (value.length >= 8 && value[0] === 0xaa) {
      const cmdType = value[1]
      
      if (cmdType === 0x07) {
        const heartRate = value[2]
        const systolic = (value[3] << 8) | value[4]
        const diastolic = (value[5] << 8) | value[6]
        
        console.log('M4 HR:', heartRate, 'BP:', systolic + '/' + diastolic)
        
        if (state.healthData) {
          state.healthData.heartRate = heartRate
          state.healthData.systolicPressure = systolic
          state.healthData.diastolicPressure = diastolic
        }
      } else if (cmdType === 0x08) {
        const steps = (value[4] << 24) | (value[3] << 16) | (value[2] << 8) | value[1]
        
        console.log('M4 steps:', steps)
        
        if (state.healthData) {
          state.healthData.steps = steps
        }
      }
    }
  }

  private async readCharacteristic(deviceId: string, serviceId: string, charId: string, callback: (data: ArrayBuffer) => void) {
    return new Promise((resolve) => {
      uni.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: charId,
        success: (res) => {
          callback(res.value)
          resolve(null)
        },
        fail: () => resolve(null)
      })
    })
  }

  private enableNotify(deviceId: string, serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }

  private writeCharacteristic(deviceId: string, serviceId: string, characteristicId: string, data: ArrayBuffer): Promise<void> {
    return new Promise((resolve) => {
      uni.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value: data,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }
}

class GenericProtocol implements ProtocolHandler {
  private readonly HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb'
  private readonly HEART_RATE_CHAR = '00002a37-0000-1000-8000-00805f9b34fb'
  private readonly BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb'
  private readonly BATTERY_CHAR = '00002a19-0000-1000-8000-00805f9b34fb'
  private readonly STEPS_SERVICE = '00001815-0000-1000-8000-00805f9b34fb'
  private readonly STEPS_CHAR = '00002a47-0000-1000-8000-00805f9b34fb'

  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('Generic BLE protocol: Starting notify')
    
    for (const service of services) {
      const uuid = service.uuid.toLowerCase()
      
      if (uuid === this.HEART_RATE_SERVICE.toLowerCase()) {
        await this.setupHeartRateNotify(deviceId, service.uuid)
      } else if (uuid === this.BATTERY_SERVICE.toLowerCase()) {
        await this.readBattery(deviceId, service.uuid)
      } else if (uuid === this.STEPS_SERVICE.toLowerCase()) {
        await this.setupStepsNotify(deviceId, service.uuid)
      }
    }
    
    this.setupValueChangeListener(deviceId)
  }

  private async setupHeartRateNotify(deviceId: string, serviceUuid: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
      const heartRateChar = chars.find(c => 
        c.uuid.toLowerCase() === this.HEART_RATE_CHAR.toLowerCase()
      )
      
      if (heartRateChar) {
        if (heartRateChar.properties.notify) {
          await this.enableNotify(deviceId, serviceUuid, heartRateChar.uuid)
        }
        if (heartRateChar.properties.read) {
          await this.readHeartRate(deviceId, serviceUuid, heartRateChar.uuid)
        }
      }
    } catch (error) {
      console.log('Generic HR setup failed:', error)
    }
  }

  private async setupStepsNotify(deviceId: string, serviceUuid: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
      const stepsChar = chars.find(c => 
        c.uuid.toLowerCase() === this.STEPS_CHAR.toLowerCase()
      )
      
      if (stepsChar) {
        if (stepsChar.properties.notify) {
          await this.enableNotify(deviceId, serviceUuid, stepsChar.uuid)
        }
        if (stepsChar.properties.read) {
          await this.readSteps(deviceId, serviceUuid, stepsChar.uuid)
        }
      }
    } catch (error) {
      console.log('Generic steps setup failed:', error)
    }
  }

  private async readBattery(deviceId: string, serviceUuid: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, serviceUuid)
      const batteryChar = chars.find(c => 
        c.uuid.toLowerCase() === this.BATTERY_CHAR.toLowerCase()
      )
      
      if (batteryChar && batteryChar.properties.read) {
        await this.readCharacteristic(deviceId, serviceUuid, batteryChar.uuid, (data) => {
          const value = new Uint8Array(data)
          state.batteryLevel = value[0]
          console.log('Battery level:', state.batteryLevel)
        })
      }
    } catch (error) {
      console.log('Generic battery read failed:', error)
    }
  }

  private async readHeartRate(deviceId: string, serviceUuid: string, charUuid: string) {
    await this.readCharacteristic(deviceId, serviceUuid, charUuid, (data) => {
      const value = new Uint8Array(data)
      const flags = value[0]
      let heartRate = 0
      
      if ((flags & 0x01) === 0) {
        heartRate = value[1]
      } else {
        heartRate = (value[2] << 8) | value[1]
      }
      
      if (state.healthData) {
        state.healthData.heartRate = heartRate
      }
      console.log('Heart rate:', heartRate)
    })
  }

  private async readSteps(deviceId: string, serviceUuid: string, charUuid: string) {
    await this.readCharacteristic(deviceId, serviceUuid, charUuid, (data) => {
      const value = new Uint8Array(data)
      const steps = (value[3] << 24) | (value[2] << 16) | (value[1] << 8) | value[0]
      
      if (state.healthData) {
        state.healthData.steps = steps
      }
      console.log('Steps:', steps)
    })
  }

  private setupValueChangeListener(deviceId: string) {
    uni.onBLECharacteristicValueChange((res) => {
      if (res.deviceId !== deviceId) return
      
      const charUuid = res.characteristicId.toLowerCase()
      
      if (charUuid === this.HEART_RATE_CHAR.toLowerCase()) {
        this.parseHeartRateData(res.value)
      } else if (charUuid === this.STEPS_CHAR.toLowerCase()) {
        this.parseStepsData(res.value)
      } else if (charUuid === this.BATTERY_CHAR.toLowerCase()) {
        this.parseBatteryData(res.value)
      }
    })
  }

  private parseHeartRateData(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    const flags = value[0]
    let heartRate = 0
    
    if ((flags & 0x01) === 0) {
      heartRate = value[1]
    } else {
      heartRate = (value[2] << 8) | value[1]
    }
    
    console.log('Heart rate changed:', heartRate)
    
    if (state.healthData) {
      state.healthData.heartRate = heartRate
    }
  }

  private parseStepsData(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    const steps = (value[3] << 24) | (value[2] << 16) | (value[1] << 8) | value[0]
    
    console.log('Steps changed:', steps)
    
    if (state.healthData) {
      state.healthData.steps = steps
    }
  }

  private parseBatteryData(data: ArrayBuffer) {
    const value = new Uint8Array(data)
    state.batteryLevel = value[0]
    console.log('Battery changed:', state.batteryLevel)
  }

  private async readCharacteristic(deviceId: string, serviceId: string, charId: string, callback: (data: ArrayBuffer) => void) {
    return new Promise((resolve) => {
      uni.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId: charId,
        success: (res) => {
          callback(res.value)
          resolve(null)
        },
        fail: () => resolve(null)
      })
    })
  }

  private enableNotify(deviceId: string, serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  }
}

export const bluetoothService = BluetoothService.getInstance()