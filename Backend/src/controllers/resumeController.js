
const fs = require('fs');
const groq = require('../config/aiConfig');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const upload = require('../middlewares/uploadFile');
const authToken = require('../middlewares/authToken');
const Resume = require('../models/resume');
const userModel = require('../models/user');

const extractTextFromPDF = async (filePath) => {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    return text;
};



const upload_resume=async (req, res) => {
    try {
        if (!req.file) {
    return res.status(400).json({ message: "Please upload a resume file", success: false });
}
const user = await userModel.findOne({ email: req.user.email });

const newResume = await Resume.create({
    user: user._id,
    originalName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size
});
return res.status(201).json({
    message: "Resume uploaded successfully",
    success: true,
    resume: newResume
});
     
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

const my_resumes=async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user._id });
        
        return res.status(200).json({ message: "Resumes fetched successfully", success: true, resumes });   
        
        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}




const analyzed_history=async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id, aiAnalysis: { $exists: true, $ne: null } });
    return res.status(200).json({ message: "Analyzed resumes fetched successfully", success: true, resumes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }

}


const parse_resume=async(req,res)=>{
    try {
        const exits_resume=await Resume.findById(req.params.id)
        if(!exits_resume){
             return res.status(404).json({ message: "Resume not Foud!", success: false });
          }
          const dataBuffer = fs.readFileSync(exits_resume.filePath); 
           const data = await extractTextFromPDF(exits_resume.filePath);
exits_resume.pdf_content = data;
await exits_resume.save();
         
            return res.status(200).json({message:"text saved successfuly!",success:true})


} catch (error) {
    console.error(error);
         return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}


const analyze_resume=async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found", success: false });
    }

    if (!resume.pdf_content) {
      return res.status(400).json({ message: "Resume content not extracted yet", success: false });
    }

    const prompt = `You are an experienced IT recruiter with 20+ years of experience. 
Analyze the following resume and provide honest feedback including:
- Strengths
- Weaknesses  
- Suggestions for improvement
- Overall rating out of 10

Resume Content:
${resume.pdf_content}

Return response in plain text format with clear sections.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });

    const text = completion.choices[0].message.content;
    resume.aiAnalysis = text;
    resume.isAnalyzed = true;
    await resume.save();

    return res.status(200).json({ message: "Resume analyzed successfully", success: true, analysis: resume.aiAnalysis });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
}



const ats_check=async (req, res) => {
    console.log("Body:", req.body)  // ye add karo
    console.log("Headers:", req.headers)  // ye bhi
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found", success: false });
        }

        if (!resume.pdf_content) {
    return res.status(400).json({ message: "Please parse resume first", success: false });
}
        const {job_description} = req.body;
        if(!job_description){
            return res.status(400).json({ message: "Job description is required", success: false });
        }
        const prompt = `You are an experienced IT recruiter with 20+ years of experience.
Analyze the following resume and job description and provide honest feedback including:
- How well the resume matches the job description
- Suggestions for improvement to make the resume more ATS-friendly
- Overall rating out of 10 


Resume Content:
${resume.pdf_content}

Job Description:
${job_description}

Return response in plain text format with clear sections.
`

 const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
    });

    const text = completion.choices[0].message.content;
   
    resume.atsAnalysis = text;
    await resume.save();


    return res.status(200).json({  message: "ATS check completed successfully", 
    success: true, 
    analysis: resume.atsAnalysis  });
        
    
    
    }
     catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

const resume_details=async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found", success: false });
        }   

        return res.status(200).json({ message: "Resume fetched successfully", success: true, resume });
        
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", success: false });
      
    }
}



const delete_resume=async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found", success: false });
        }
       fs.unlinkSync(resume.filePath);
        await resume.deleteOne();
        return res.status(200).json({ message: "Resume deleted successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}


module.exports = {
    upload_resume,
    my_resumes,
    analyzed_history,
    parse_resume,
    analyze_resume,
    ats_check,
    resume_details,
    delete_resume
}