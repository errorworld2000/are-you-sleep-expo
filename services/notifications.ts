import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// 设置通知处理器，决定应用在前台时如何处理通知
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 显示提醒
    shouldPlaySound: true, // 播放声音
    shouldSetBadge: false, // 是否设置角标
  }),
});

// 注册推送通知并获取令牌的函数
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  // 仅在物理设备上执行，模拟器不支持推送通知
  if (!Device.isDevice) {
    alert('Must use physical device for Push Notifications');
    return;
  }

  // 检查并请求通知权限
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 如果用户未授予权限，则退出
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  // 获取 Expo 推送令牌
  try {
    // 官方推荐的获取 projectId 的方式，更健壮
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found. Please check your app.json/app.config.js and ensure you are logged in to Expo.');
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
  } catch (e) {
    console.error('Failed to get Expo push token', e);
    alert(`Failed to get push token for push notification: ${e}`);
  }


  // Android 平台需要额外设置一个通知通道
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250], // 震动模式
      lightColor: '#FF231F7C', // LED 灯颜色
    });
  }

  return token;
}
