<script>
import { BackgroundService } from './utils/background-service.js'

export default {
	onLaunch: function() {
		console.log('App Launch')
		this.checkLoginStatus()
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	},
	methods: {
		checkLoginStatus() {
			const token = uni.getStorageSync('token')
			if (!token) {
				uni.reLaunch({
					url: '/pages/login/index'
				})
			} else {
				this.initBackgroundService()
			}
		},
		initBackgroundService() {
			const userStr = uni.getStorageSync('user')
			if (!userStr) return
			
			const userData = JSON.parse(userStr)
			const isElderly = userData.userType === 'elderly'
			
			uni.setStorageSync('isElderlyUser', isElderly ? 'true' : 'false')
			
			if (isElderly) {
				BackgroundService.start()
				this.checkAutoStartPermission()
			} else {
				BackgroundService.stop()
			}
		},
		checkAutoStartPermission() {
			const hasShownGuide = uni.getStorageSync('autoStartGuideShown')
			if (hasShownGuide) return
			
			const isElderly = uni.getStorageSync('isElderlyUser') === 'true'
			if (!isElderly) return
			
			uni.showModal({
				title: '开启自启动权限',
				content: '为了确保老人端能持续定位和推送健康数据，请开启自启动权限。是否前往设置？',
				confirmText: '去设置',
				cancelText: '暂不',
				success: (res) => {
					if (res.confirm) {
						this.openAutoStartSettings()
					}
					uni.setStorageSync('autoStartGuideShown', 'true')
				}
			})
		},
		openAutoStartSettings() {
			if (uni.getSystemInfoSync().platform !== 'android') return
			
			try {
				const main = plus.android.runtimeMainActivity()
				const Intent = plus.android.import('android.content.Intent')
				const Settings = plus.android.import('android.provider.Settings')
				const Uri = plus.android.import('android.net.Uri')
				
				const intent = new Intent()
				intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
				intent.setData(Uri.parse('package:' + main.getPackageName()))
				main.startActivity(intent)
			} catch (e) {
				try {
					const main = plus.android.runtimeMainActivity()
					const Intent = plus.android.import('android.content.Intent')
					const Settings = plus.android.import('android.provider.Settings')
					const intent = new Intent(Settings.ACTION_SETTINGS)
					main.startActivity(intent)
				} catch (e2) {
					uni.showToast({ title: '请手动在设置中开启自启动', icon: 'none' })
				}
			}
		}
	}
}
</script>
<style>
/*每个页面公共css */
</style>