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
    modalidad: 'Recojo en tienda',
    tiendaRecojo: 'Bembos - Tienda principal',
    createdAt: new Date('2026-06-20T12:00:00.000Z'),
    qrToken: TOKEN,
    userId: 'private-user-id',
  };

  const result = toDeviceOrder(order);

  assert.equal(result.numeroPedido, '439011');
  assert.deepEqual(result.productos, [{ productId: 'clasica', nombre: 'Bembos Clasica', cantidad: 2 }]);
  assert.equal(Object.hasOwn(result, 'qrToken'), false);
  assert.equal(Object.hasOwn(result, 'userId'), false);
  assert.equal(result.tiendaRecojo, 'Bembos - Tienda principal');
  assert.equal(Object.hasOwn(result.productos[0], 'precioUnitario'), false);
});

const Order = require('../models/Order');
const { confirmPickup, scanOrder } = require('../controllers/iotController');

function mockResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test('scanOrder rejects an order that is not ready', async (t) => {
  t.mock.method(Order, 'findOne', async () => ({ estado: 'En preparacion' }));
  const res = mockResponse();
  await scanOrder({ body: { qrPayload: `BEMBOS_ORDER:${TOKEN}` } }, res, assert.fail);
  assert.equal(res.statusCode, 425);
});

test('scanOrder reports an already collected order', async (t) => {
  t.mock.method(Order, 'findOne', async () => ({ estado: 'Entregado' }));
  const res = mockResponse();
  await scanOrder({ body: { qrPayload: `BEMBOS_ORDER:${TOKEN}` } }, res, assert.fail);
  assert.equal(res.statusCode, 409);
});

test('confirmPickup atomically marks a ready order as delivered', async (t) => {
  const deliveredOrder = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    estado: 'Entregado',
    productos: [],
    total: 25,
    tiendaRecojo: 'Bembos Centro',
  };
  const findOneAndUpdate = t.mock.method(Order, 'findOneAndUpdate', async () => deliveredOrder);
  const res = mockResponse();

  await confirmPickup({ params: { id: '507f1f77bcf86cd799439011' } }, res, assert.fail);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.order.estado, 'Entregado');
  assert.deepEqual(findOneAndUpdate.mock.calls[0].arguments[0], {
    _id: '507f1f77bcf86cd799439011',
    estado: 'Listo para recoger',
  });
});
