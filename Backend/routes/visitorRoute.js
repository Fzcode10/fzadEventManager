const express = require('express');

const {signupVisitor, loginVisitor, registerEvent, allEventDetials, getticket} = require('../controllers/visitor');

const router = express.Router();


// Signup for Visitor
router.post('/signup', signupVisitor);

//Login page for visitor
router.post('/login', loginVisitor);

// Registarion of event 
router.post('/registration', registerEvent);

// All registred event
router.post('/allregistredevent', allEventDetials);

// Generate Qr to attend event
router.post('/ticket', getticket);

module.exports = router