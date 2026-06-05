let bgServiceTimer = null;
let locationTimer = null;
let heartbeatTimer = null;
let silentAudio = null;
let isBgServiceRunning = false;

export const BackgroundService = {
    start() {
        if (isBgServiceRunning) return;
        
        const isElderly = uni.getStorageSync('isElderlyUser') === 'true';
        if (!isElderly) return;
        
        const platform = uni.getSystemInfoSync().platform;
        
        if (platform === 'android') {
            this.startAndroidService();
        } else if (platform === 'ios') {
            this.startiOSService();
        }
        
        this.startLocationReport();
        this.startHeartbeat();
        
        isBgServiceRunning = true;
        console.log('Background service started');
    },

    stop() {
        if (!isBgServiceRunning) return;
        
        this.clearTimers();
        
        if (silentAudio) {
            try {
                silentAudio.stop();
            } catch (e) {}
            silentAudio = null;
        }
        
        isBgServiceRunning = false;
        console.log('Background service stopped');
    },

    startAndroidService() {
        this.showAndroidNotification();
        this.playSilentMusic();
    },

    showAndroidNotification() {
        try {
            const main = plus.android.runtimeMainActivity();
            const Context = plus.android.import('android.content.Context');
            const NotificationManager = plus.android.import('android.app.NotificationManager');
            const NotificationChannel = plus.android.import('android.app.NotificationChannel');
            const Notification = plus.android.import('android.app.Notification');
            const PendingIntent = plus.android.import('android.app.PendingIntent');
            const Intent = plus.android.import('android.content.Intent');
            
            const nm = main.getSystemService(Context.NOTIFICATION_SERVICE);
            
            const channel = new NotificationChannel('elderly_service', '老人监护服务', NotificationManager.IMPORTANCE_LOW);
            channel.description = '用于持续定位和健康数据推送';
            channel.setShowBadge(false);
            channel.enableVibration(false);
            channel.enableLights(false);
            nm.createNotificationChannel(channel);
            
            const intent = new Intent(main, main.getClass());
            const pi = PendingIntent.getActivity(main, 0, intent, PendingIntent.FLAG_IMMUTABLE);
            
            const notification = new Notification.Builder(main, 'elderly_service')
                .setContentTitle('老人监护系统')
                .setContentText('正在运行中...')
                .setSmallIcon('static/logo.png')
                .setContentIntent(pi)
                .setOngoing(true)
                .build();
            
            nm.notify(1001, notification);
        } catch (e) {
            console.log('Show notification failed:', e);
        }
    },

    playSilentMusic() {
        try {
            silentAudio = plus.audio.createPlayer('_www/static/silent.mp3');
            silentAudio.setLoop(true);
            silentAudio.setVolume(0);
            silentAudio.play();
            console.log('Silent music playing');
        } catch (e) {
            console.log('Play silent music failed:', e);
        }
    },

    startiOSService() {
        try {
            this.setupBackgroundLocation();
        } catch (e) {
            console.log('iOS background setup failed:', e);
        }
    },

    setupBackgroundLocation() {
        const that = this;
        uni.startLocationUpdate({
            success: () => {
                console.log('iOS background location started');
                uni.onLocationChange((location) => {
                    that.reportLocation(location);
                });
            },
            fail: (err) => {
                console.log('Start location update failed:', err);
            }
        });
    },

    startLocationReport() {
        const that = this;
        locationTimer = setInterval(() => {
            uni.getLocation({
                type: 'gcj02',
                altitude: true,
                success: (location) => {
                    that.reportLocation(location);
                },
                fail: (err) => {
                    console.log('Get location failed:', err);
                }
            });
        }, 30000);
    },

    reportLocation(location) {
        const userStr = uni.getStorageSync('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const token = uni.getStorageSync('token');
        
        uni.request({
            url: 'http://10.0.2.2:8080/api/location',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            data: {
                latitude: location.latitude,
                longitude: location.longitude,
                altitude: location.altitude || 0,
                accuracy: location.accuracy || 0,
                speed: location.speed || 0
            },
            success: (res) => {
                console.log('Location reported successfully');
            },
            fail: (err) => {
                console.log('Location report failed:', err);
            }
        });
    },

    startHeartbeat() {
        heartbeatTimer = setInterval(() => {
            this.sendHeartbeat();
        }, 60000);
    },

    sendHeartbeat() {
        const token = uni.getStorageSync('token');
        if (!token) return;
        
        uni.request({
            url: 'http://10.0.2.2:8080/api/heartbeat',
            method: 'POST',
            header: {
                'Authorization': 'Bearer ' + token
            },
            success: (res) => {
                console.log('Heartbeat sent');
            },
            fail: (err) => {
                console.log('Heartbeat failed:', err);
            }
        });
    },

    clearTimers() {
        if (locationTimer) clearInterval(locationTimer);
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (bgServiceTimer) clearInterval(bgServiceTimer);
        locationTimer = null;
        heartbeatTimer = null;
        bgServiceTimer = null;
    },

    isRunning() {
        return isBgServiceRunning;
    }
};