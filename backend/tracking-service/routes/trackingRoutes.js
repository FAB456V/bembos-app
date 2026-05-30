const express = require('express');
const { getLatestLocation } = require('../controllers/trackingController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/:orderId/location', verifyToken, getLatestLocation);

module.exports = router;
