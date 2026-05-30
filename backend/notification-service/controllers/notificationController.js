const { Expo } = require('expo-server-sdk');
const Notification = require('../models/Notification');

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || undefined });

async function sendPushNotification(expoPushToken, mensaje, orderId, tipo) {
  if (!expoPushToken) {
    return { sent: false, reason: 'missing_push_token' };
  }

  if (!Expo.isExpoPushToken(expoPushToken)) {
    return { sent: false, reason: 'invalid_push_token' };
  }

  const tickets = await expo.sendPushNotificationsAsync([
    {
      to: expoPushToken,
      sound: 'default',
      body: mensaje,
      data: { orderId, tipo },
    },
  ]);

  return { sent: true, tickets };
}

async function notify(req, res, next) {
  try {
    const { userId, orderId, tipo, mensaje, expoPushToken } = req.body || {};

    if (!orderId || !tipo || !mensaje) {
      return res.status(400).json({
        message: 'orderId, tipo y mensaje son obligatorios',
      });
    }

    const push = await sendPushNotification(expoPushToken, mensaje, orderId, tipo);
    const notification = await Notification.create({
      userId,
      orderId,
      tipo,
      mensaje,
      enviadaAt: push.sent ? new Date() : undefined,
    });

    return res.status(201).json({ notification, push });
  } catch (error) {
    return next(error);
  }
}

module.exports = { notify, sendPushNotification };
