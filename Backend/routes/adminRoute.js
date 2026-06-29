const express = require('express');
const {getProfile, createEvent, allEvents, updateEventStatus, requestEventUpdate, adNewStaff, sendUpdateOtp, updateProfile, getCheckLogs, getAllVisitors, getUser, updateUserRole, deleteUser} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/uploadPhotos');

const router = express.Router();

router.get('/getprofile', authMiddleware, getProfile);

router.post('/createevent', authMiddleware, createEvent);

router.get('/allevents', authMiddleware, allEvents);

router.patch('/events/:id/status', authMiddleware, updateEventStatus);

router.patch('/events/:id/request-update', authMiddleware, requestEventUpdate);

router.post('/addnewstaff', authMiddleware, adNewStaff);

router.post('/send-update-otp', authMiddleware, sendUpdateOtp);

router.post('/update-profile', authMiddleware, upload.single("profilePhoto"), updateProfile);
 
router.get('/checklogs', authMiddleware, getCheckLogs);

router.get('/visitors', authMiddleware, getAllVisitors);

router.get('/users', authMiddleware, getUser);

router.patch('/users/:id/role', authMiddleware, updateUserRole);

router.delete('/users/:id', authMiddleware, deleteUser);

module.exports = router