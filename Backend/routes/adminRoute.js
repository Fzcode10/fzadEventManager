const express = require('express');
const {getProfile, createEvent, allEvents, updateEventStatus, requestEventUpdate, adNewStaff} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/getprofile', authMiddleware, getProfile);

router.post('/createevent', createEvent);

router.get('/allevents', authMiddleware, allEvents);

router.patch('/events/:id/status', authMiddleware, updateEventStatus);

router.patch('/events/:id/request-update', authMiddleware, requestEventUpdate);

router.post('/addnewstaff', authMiddleware, adNewStaff);
 
module.exports = router