const crypto = require('crypto');

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyDeviceKey(req, res, next) {
  const deviceKey = req.headers['x-device-key'];

  if (!deviceKey || !safeEqual(deviceKey, process.env.IOT_DEVICE_API_KEY)) {
    return res.status(401).json({ message: 'Credencial de dispositivo invalida' });
  }

  return next();
}

module.exports = verifyDeviceKey;
module.exports.safeEqual = safeEqual;
