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
