const express = require('express');
const {getProfile, createEvent} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/getprofile', authMiddleware, getProfile);

router.post('/createevent', createEvent);
 
module.exports = router