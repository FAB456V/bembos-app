import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushToken() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [pushError, setPushError] = useState('');

  useEffect(() => {
    let active = true;

    async function register() {
      if (Platform.OS === 'web' || !Device.isDevice) {
        return;
      }

      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('orders', {
            name: 'Estado de pedidos',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
          });
        }

        const current = await Notifications.getPermissionsAsync();
        let status = current.status;

        if (status !== 'granted') {
          const requested = await Notifications.requestPermissionsAsync();
          status = requested.status;
        }

        if (status !== 'granted') {
          throw new Error('Permiso de notificaciones no concedido');
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId
          || Constants.easConfig?.projectId;

        if (!projectId) {
          throw new Error('EAS projectId no configurado');
        }

        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        if (active) setExpoPushToken(token.data);
      } catch (error) {
        if (active) setPushError(error.message || 'No se pudo registrar notificaciones');
      }
    }

    register();
    return () => { active = false; };
  }, []);

  return { expoPushToken, pushError };
}
