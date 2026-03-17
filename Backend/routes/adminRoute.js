const express = require('express');
const {getProfile, createEvent} = require('../controllers/adminController');

const router = express.Router();

router.get('/getprofile', getProfile);

router.post('/createevent', createEvent);
 
module.exports = router