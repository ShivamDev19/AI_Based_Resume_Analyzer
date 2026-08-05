const express = require('express');
const router = express.Router();
const authToken = require('../middlewares/authToken');
const {
    startInterview,
    submitAnswer,
    finishInterview,
    getMyInterviews,
    getInterview,
} = require('../controllers/interviewController');

// specific routes pehle — dynamic /:id baad mein
router.get('/my-interviews', authToken, getMyInterviews);
router.post('/start', authToken, startInterview);
router.post('/:id/submit-answer', authToken, submitAnswer);
router.post('/:id/finish', authToken, finishInterview);
router.get('/:id', authToken, getInterview);

module.exports = router;
