const express = require('express');

const {sendInvite} = require('../controllers/host');

const router = express.Router();

router.post('/sendinvite', sendInvite);

module.exports = router