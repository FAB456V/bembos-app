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
const { confirmPickup, scanOrder } = require('../controllers/iotController');
const { getDashboard, markReady, nextScan, submitScan } = require('../controllers/scanQueueController');

const router = express.Router();

router.post('/iot/scans', verifyDeviceKey, submitScan);
router.get('/iot/dashboard', verifyDeviceKey, getDashboard);
router.post('/iot/orders/:id/ready', verifyDeviceKey, markReady);
router.get('/iot/scans/next', verifyDeviceKey, nextScan);
router.post('/iot/orders/scan', verifyDeviceKey, scanOrder);
router.post('/iot/orders/:id/pickup-confirmed', verifyDeviceKey, confirmPickup);

router.post('/orders', verifyToken, createOrder);
router.get('/orders/history/:userId', verifyToken, getHistory);
router.get('/orders/:id', verifyToken, getOrder);
router.put('/orders/:id/status', verifyServiceKey, updateStatus);

module.exports = router;
