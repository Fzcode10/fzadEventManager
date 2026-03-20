const express = require('express');
const {eventDetials, eventVisitorRegister} = require('../controllers/event');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/eventvisitor/:id', authMiddleware, eventVisitorRegister);

router.get('/:id', authMiddleware, eventDetials);

module.exports = router