const mongoose = require('mongoose');
const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    job_description: {
        type: String,
        required: true
    },
    questions: {
        type: [String],
        required: true
    },
    answers: [{
        question: String,
        userAnswer: String,
        aiFeedback: String,
        score: Number
    }],
    final_score: {
        type: Number
    },
    feedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
