const express = require('express');

const {scanQrToggle } = require('../controllers/security');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const router = express.Router();

router.post('/checkin/visitor', authMiddleware, authorize(['security']), scanQrToggle);

module.exports = router