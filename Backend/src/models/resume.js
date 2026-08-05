const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    pdf_content: {
    type: String
},
aiAnalysis: {
    type: String
},
isAnalyzed: {
    type: Boolean,
    default: false
},
atsAnalysis: {
    type: String
}
}, { timestamps: true })

const Resume = mongoose.model('Resume', resumeSchema)

module.exports = Resume