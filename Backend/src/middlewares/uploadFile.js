const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    console.log('Resolved path:', path.join(__dirname, '../../uploads'));
    cb(null, path.join(__dirname, '../../uploads'));
},
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);  // naam kya rakhna hai
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);   // accept
    } else {
        cb(new Error('Only PDF files allowed'), false);  // reject
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }  // 5MB
});

module.exports = upload;