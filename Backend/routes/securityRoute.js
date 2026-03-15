const express = require('express');

const {scanQrToggle } = require('../controllers/security');

const router = express.Router();

router.post('/checkin/visitor', scanQrToggle);

module.exports = router