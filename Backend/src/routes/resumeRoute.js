const express = require('express');
const router = express.Router();
const fs = require('fs');
const groq = require('../config/aiConfig');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const upload = require('../middlewares/uploadFile');
const authToken = require('../middlewares/authToken');
const Resume = require('../models/resume');
const userModel = require('../models/user');
const { upload_resume, my_resumes, analyzed_history, parse_resume, analyze_resume, ats_check, resume_details, delete_resume } = require('../controllers/resumeController');



router.post('/upload', authToken, upload.single('resume'), upload_resume);


router.get("/my-resumes", authToken, my_resumes);


router.get("/analyzed-history", authToken,  analyzed_history )

router.post('/:id/parse',authToken, parse_resume);

router.post("/:id/analyze", authToken, analyze_resume);

router.post("/:id/ats-check", authToken, ats_check);

router.get("/:id", authToken, resume_details);

router.delete("/:id", authToken, delete_resume);



module.exports = router;