const assert = require('node:assert/strict');
const test = require('node:test');
const Order = require('../models/Order');
const { clearScans, dequeueScan } = require('../services/scanQueue');
const { submitScan } = require('../controllers/scanQueueController');

const TOKEN = 'c'.repeat(48);

function response() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test.beforeEach(() => clearScans());

test('submitScan queues one ready pickup order and returns its detail', async (t) => {
  t.mock.method(Order, 'findOne', async () => ({
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    estado: 'Listo para recoger',
    productos: [{ productId: 'clasica', nombre: 'Bembos Clasica', cantidad: 1 }],
    total: 18.9,
    modalidad: 'Recojo en tienda',
    tiendaRecojo: 'Bembos Centro',
  }));
  const res = response();

  await submitScan({ body: { qrPayload: `BEMBOS_ORDER:${TOKEN}` } }, res, assert.fail);

  assert.equal(res.statusCode, 202);
  assert.equal(res.payload.order.numeroPedido, '439011');
  assert.equal(dequeueScan(), `BEMBOS_ORDER:${TOKEN}`);
  assert.equal(dequeueScan(), null);
});

test('submitScan does not queue an already delivered order', async (t) => {
  t.mock.method(Order, 'findOne', async () => ({ estado: 'Entregado' }));
  const res = response();

  await submitScan({ body: { qrPayload: `BEMBOS_ORDER:${TOKEN}` } }, res, assert.fail);

  assert.equal(res.statusCode, 409);
  assert.equal(dequeueScan(), null);
});

const axios = require('axios');
const { markReady } = require('../controllers/scanQueueController');

test('markReady changes an order once and reports missing push token', async (t) => {
  const order = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    userId: 'user-1',
    estado: 'Listo para recoger',
    productos: [],
    total: 20,
    tiendaRecojo: 'Bembos Centro',
  };
  t.mock.method(Order, 'findOneAndUpdate', () => ({
    select: async () => order,
  }));
  const res = response();

  await markReady({ params: { id: order._id.toString() } }, res, assert.fail);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.order.estado, 'Listo para recoger');
  assert.deepEqual(res.payload.notification, { sent: false, reason: 'missing_push_token' });
});

test('markReady sends the ready notification when the order has a push token', async (t) => {
  const order = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    userId: 'user-1',
    estado: 'Listo para recoger',
    productos: [],
    total: 20,
    tiendaRecojo: 'Bembos Centro',
    expoPushToken: 'ExponentPushToken[test]',
  };
  t.mock.method(Order, 'findOneAndUpdate', () => ({
    select: async () => order,
  }));
  const post = t.mock.method(axios, 'post', async () => ({ data: { push: { sent: true } } }));
  const previousUrl = process.env.NOTIFICATION_SERVICE_URL;
  process.env.NOTIFICATION_SERVICE_URL = 'https://notifications.test';
  const res = response();

  try {
    await markReady({ params: { id: order._id.toString() } }, res, assert.fail);
  } finally {
    process.env.NOTIFICATION_SERVICE_URL = previousUrl;
  }

  assert.equal(res.payload.notification.sent, true);
  assert.match(post.mock.calls[0].arguments[1].mensaje, /listo para recogerlo/);
});
