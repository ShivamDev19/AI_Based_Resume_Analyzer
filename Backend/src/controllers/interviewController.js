const Interview = require('../models/interview');
const Resume = require('../models/resume');
const groq = require('../config/aiConfig');

// POST /api/interview/start
// Resume select karo + JD paste karo → AI 5 questions generate karta hai
const startInterview = async (req, res) => {
    try {
        const { resume_id, job_description } = req.body;

        if (!resume_id || !job_description) {
            return res.status(400).json({ message: 'resume_id and job_description required' });
        }

        const resume = await Resume.findById(resume_id);
        if (!resume) return res.status(404).json({ message: 'Resume not found' });
        if (!resume.pdf_content) return res.status(400).json({ message: 'Resume not parsed yet. Please parse resume first.' });

        const prompt = `You are an experienced technical interviewer.
Based on the candidate's resume and the job description below, generate exactly 5 interview questions.
These should be a mix of technical and behavioral questions relevant to the role.

Resume:
${resume.pdf_content}

Job Description:
${job_description}

Return ONLY a JSON array of 5 strings. No explanation, no markdown, no extra text.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const raw = completion.choices[0].message.content.trim();

        // JSON parse safely
        let questions;
        try {
            questions = JSON.parse(raw);
        } catch (e) {
            // fallback — extract array from response
            const match = raw.match(/\[[\s\S]*\]/);
            if (match) questions = JSON.parse(match[0]);
            else return res.status(500).json({ message: 'AI could not generate questions. Try again.' });
        }

        const interview = await Interview.create({
            user: req.user._id,
            resume: resume_id,
            job_description,
            questions,
            answers: [],
        });

        res.status(201).json({
            message: 'Interview started',
            interview_id: interview._id,
            questions,
        });

    } catch (err) {
        console.error('startInterview error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/interview/:id/submit-answer
// Ek answer submit karo → AI evaluate karta hai → next question
const submitAnswer = async (req, res) => {
    try {
        const { question, userAnswer } = req.body;
        const interview = await Interview.findById(req.params.id);

        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        if (interview.status === 'completed') return res.status(400).json({ message: 'Interview already completed' });

        const prompt = `You are a strict but fair technical interviewer.
Evaluate the following interview answer.

Question: ${question}
Candidate's Answer: ${userAnswer}

Provide:
1. A score out of 10
2. Brief feedback (2-3 lines max) — what was good, what was missing

Return ONLY valid JSON in this exact format:
{"score": 7, "feedback": "Your feedback here"}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const raw = completion.choices[0].message.content.trim();

        let evaluation;
        try {
            evaluation = JSON.parse(raw);
        } catch (e) {
            const match = raw.match(/\{[\s\S]*\}/);
            if (match) evaluation = JSON.parse(match[0]);
            else evaluation = { score: 5, feedback: 'Could not evaluate. Please try again.' };
        }

        interview.answers.push({
            question,
            userAnswer,
            aiFeedback: evaluation.feedback,
            score: evaluation.score,
        });

        await interview.save();

        res.status(200).json({
            message: 'Answer submitted',
            evaluation,
            answersCount: interview.answers.length,
            totalQuestions: interview.questions.length,
        });

    } catch (err) {
        console.error('submitAnswer error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/interview/:id/finish
// Saare answers ho gaye → final score + overall feedback
const finishInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        const avgScore = (
            interview.answers.reduce((sum, a) => sum + (a.score || 0), 0) /
            interview.answers.length
        ).toFixed(1);

        const answersText = interview.answers.map((a, i) =>
            `Q${i + 1}: ${a.question}\nAnswer: ${a.userAnswer}\nFeedback: ${a.aiFeedback}\nScore: ${a.score}/10`
        ).join('\n\n');

        const prompt = `You are an experienced technical interviewer.
Here is the complete interview session of a candidate:

${answersText}

Average Score: ${avgScore}/10

Give a comprehensive final evaluation:
1. Overall performance summary (3-4 lines)
2. Top 2 strengths
3. Top 2 areas to improve
4. Final recommendation: Ready / Needs Preparation / Not Ready

Return only plain text — no JSON, no markdown.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const finalFeedback = completion.choices[0].message.content.trim();

        interview.final_score = parseFloat(avgScore);
        interview.feedback = finalFeedback;
        interview.status = 'completed';
        await interview.save();

        res.status(200).json({
            message: 'Interview completed',
            final_score: interview.final_score,
            feedback: finalFeedback,
            answers: interview.answers,
        });

    } catch (err) {
        console.error('finishInterview error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/interview/my-interviews
const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ user: req.user._id })
            .populate('resume', 'originalName')
            .sort({ createdAt: -1 });
        res.status(200).json({ interviews });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/interview/:id
const getInterview = async (req, res) => {
    try {
        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: 'Interview not found' });
        res.status(200).json({ interview });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { startInterview, submitAnswer, finishInterview, getMyInterviews, getInterview };
