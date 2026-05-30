const express = require('express');
const { notify } = require('../controllers/notificationController');
const verifyServiceKey = require('../middlewares/verifyServiceKey');

const router = express.Router();

router.post('/notify', verifyServiceKey, notify);

module.exports = router;
