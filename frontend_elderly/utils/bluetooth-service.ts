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
        url: 'http://localhost:8080/api/health/device',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
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
      const heartRateChar = chars.find(c => c.properties.notify)

      if (heartRateChar) {
        await this.notifyCharacteristic(deviceId, this.HEART_RATE_SERVICE, heartRateChar.uuid)
        console.log('Heart rate notify enabled')
      }
    } catch (error) {
      console.log('Heart rate setup failed:', error)
    }
  }

  private async readBatteryLevel(deviceId: string) {
    try {
      const chars = await this.service['getCharacteristics'](deviceId, this.BATTERY_SERVICE)
      const batteryChar = chars.find(c => c.properties.read)

      if (batteryChar) {
        await this.readCharacteristic(deviceId, this.BATTERY_SERVICE, batteryChar.uuid)
        console.log('Battery level read')
      }
    } catch (error) {
      console.log('Battery read failed:', error)
    }
  }

  private async setupStepsNotify(deviceId: string) {
    console.log('Steps notify setup (simulated)')
  }

  private async writeCharacteristic(deviceId: string, serviceId: string, characteristicId: string, data: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.writeBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        value: data,
        success: () => resolve(),
        fail: reject
      })
    })
  }

  private async notifyCharacteristic(deviceId: string, serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.notifyBLECharacteristicValueChange({
        deviceId,
        serviceId,
        characteristicId,
        state: true,
        success: () => resolve(),
        fail: reject
      })
    })
  }

  private async readCharacteristic(deviceId: string, serviceId: string, characteristicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.readBLECharacteristicValue({
        deviceId,
        serviceId,
        characteristicId,
        success: () => resolve(),
        fail: reject
      })
    })
  }
}

class HuaweiProtocol implements ProtocolHandler {
  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('Huawei protocol: Starting notify')
  }
}

class M4Protocol implements ProtocolHandler {
  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('M4 protocol: Starting notify')
  }
}

class GenericProtocol implements ProtocolHandler {
  constructor(private service: BluetoothService) {}

  async startNotify(deviceId: string, services: Array<{ uuid: string }>) {
    console.log('Generic protocol: Starting notify')
  }
}

export const bluetoothService = BluetoothService.getInstance()