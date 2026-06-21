const assert = require('node:assert/strict');
const test = require('node:test');
const { clearScans, dequeueScan, enqueueScan } = require('../services/scanQueue');

test.beforeEach(() => clearScans());

test('scan queue returns each QR once in insertion order', () => {
  enqueueScan('BEMBOS_ORDER:first', 1000);
  enqueueScan('BEMBOS_ORDER:second', 1001);

  assert.equal(dequeueScan(1002), 'BEMBOS_ORDER:first');
  assert.equal(dequeueScan(1002), 'BEMBOS_ORDER:second');
  assert.equal(dequeueScan(1002), null);
});

test('scan queue discards QR values older than five minutes', () => {
  enqueueScan('BEMBOS_ORDER:expired', 1000);
  assert.equal(dequeueScan(1000 + 5 * 60 * 1000 + 1), null);
});
