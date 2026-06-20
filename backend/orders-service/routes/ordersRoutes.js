const express = require('express');
const {
  createOrder,
  getHistory,
  getOrder,
  updateStatus,
} = require('../controllers/ordersController');
const verifyDeviceKey = require('../middlewares/verifyDeviceKey');
const verifyServiceKey = require('../middlewares/verifyServiceKey');
const verifyToken = require('../middlewares/verifyToken');
const { scanOrder } = require('../controllers/iotController');

const router = express.Router();

router.post('/iot/orders/scan', verifyDeviceKey, scanOrder);

router.post('/orders', verifyToken, createOrder);
router.get('/orders/history/:userId', verifyToken, getHistory);
router.get('/orders/:id', verifyToken, getOrder);
router.put('/orders/:id/status', verifyServiceKey, updateStatus);

module.exports = router;
