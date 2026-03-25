const express = require('express');

const {sendInvite, makeFreeAndInvitation, getUpcomingEvents, setApproval, rejectApprovel, createEventRequest} = require('../controllers/host');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const router = express.Router();

router.post('/sendinvite', sendInvite);

router.post('/approve', makeFreeAndInvitation);

router.get('/upcomingevents', authMiddleware, authorize(['host']), getUpcomingEvents);

router.post('/requestevent',authMiddleware, authorize(['host']),  createEventRequest)

router.patch('/approval/:id', setApproval);

module.exports = router