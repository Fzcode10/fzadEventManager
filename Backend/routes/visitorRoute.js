const express = require('express');
const upload = require('../middleware/uploadPhotos');
const validateRegistration = require('../middleware/validateRegistration');

const {signupVisitor, loginVisitor, registerEvent, allEventDetials, getticket, isExist, sentOtp, verifyOtp, allEvent} = require('../controllers/visitor');

const router = express.Router();


// Signup for Visitor
router.post('/signup', signupVisitor);

//Login page for visitor
router.post('/login', loginVisitor);

// Registarion of event 
router.post('/registration',  upload.single("photo"),  registerEvent);

// All registred event
router.post('/allregistredevent', allEventDetials);

// Generate Qr to attend event
router.post('/ticket', getticket);

// Email already Exists in databse
router.post('/isexists', isExist);

// Send otp to visitor mail
router.post('/sendotp', sentOtp);

// Verify Sended otp 
router.post('/verifyotp', verifyOtp);

router.get('/events/all', allEvent);

module.exports = router