const express = require('express');

const {sendInvite, makeFreeAndInvitation} = require('../controllers/host');

const router = express.Router();

router.post('/sendinvite', sendInvite);

router.post('/approve', makeFreeAndInvitation);

module.exports = router