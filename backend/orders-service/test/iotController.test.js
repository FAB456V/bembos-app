const assert = require('node:assert/strict');
const test = require('node:test');
const { parseQrPayload, toDeviceOrder } = require('../controllers/iotController');
const { safeEqual } = require('../middlewares/verifyDeviceKey');

const TOKEN = 'a'.repeat(48);

test('parseQrPayload accepts a valid Bembos QR payload', () => {
  assert.equal(parseQrPayload(`BEMBOS_ORDER:${TOKEN}`), TOKEN);
});

test('parseQrPayload rejects malformed or unexpected values', () => {
  assert.equal(parseQrPayload(TOKEN), null);
  assert.equal(parseQrPayload('BEMBOS_ORDER:short'), null);
  assert.equal(parseQrPayload(null), null);
});

test('safeEqual compares device keys without accepting missing values', () => {
  assert.equal(safeEqual('device-secret', 'device-secret'), true);
  assert.equal(safeEqual('device-secret', 'other-secret'), false);
  assert.equal(safeEqual(undefined, 'device-secret'), false);
});

test('toDeviceOrder returns only the fields needed by the ESP32', () => {
  const order = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    estado: 'En preparacion',
    productos: [{ productId: 'clasica', nombre: 'Bembos Clasica', cantidad: 2, precioUnitario: 18.9 }],
    total: 37.8,
    direccionEntrega: 'Av. Prueba 123',
    createdAt: new Date('2026-06-20T12:00:00.000Z'),
    qrToken: TOKEN,
    userId: 'private-user-id',
  };

  const result = toDeviceOrder(order);

  assert.equal(result.numeroPedido, '439011');
  assert.deepEqual(result.productos, [{ productId: 'clasica', nombre: 'Bembos Clasica', cantidad: 2 }]);
  assert.equal(Object.hasOwn(result, 'qrToken'), false);
  assert.equal(Object.hasOwn(result, 'userId'), false);
  assert.equal(Object.hasOwn(result.productos[0], 'precioUnitario'), false);
});
