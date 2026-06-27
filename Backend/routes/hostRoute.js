const express = require('express');

const {sendInvite, makeFreeAndInvitation, getUpcomingEvents, setApproval, createEventRequest, updateEventDetails} = require('../controllers/host');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const router = express.Router();

router.post('/sendinvite', authMiddleware, authorize(['host']), sendInvite);

router.post('/approve', authMiddleware, authorize(['host']), makeFreeAndInvitation);

router.get('/upcomingevents', authMiddleware, authorize(['host']), getUpcomingEvents);

router.post('/requestevent',authMiddleware, authorize(['host']),  createEventRequest)

router.patch('/approval/:id', authMiddleware, authorize(['host']), setApproval);

router.patch('/events/:id', authMiddleware, authorize(['host']), updateEventDetails);

module.exports = router