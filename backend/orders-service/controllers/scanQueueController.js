const { parseQrPayload } = require('./iotController');
const { dequeueScan, enqueueScan } = require('../services/scanQueue');

function submitScan(req, res) {
  const token = parseQrPayload(req.body?.qrPayload);

  if (!token) {
    return res.status(400).json({ message: 'Codigo QR invalido' });
  }

  const qrPayload = `BEMBOS_ORDER:${token}`;
  const pending = enqueueScan(qrPayload);
  return res.status(202).json({ message: 'QR enviado al kiosco', pending });
}

function nextScan(_req, res) {
  const qrPayload = dequeueScan();

  if (!qrPayload) {
    return res.status(204).send();
  }

  return res.json({ qrPayload });
}

module.exports = { nextScan, submitScan };
