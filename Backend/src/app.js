const express = require('express');
const app = express();
const cors = require('cors');


app.use(cors());
app.use(express.json());
const userRoute=require("../src/routes/userRoute")
const resumeRoutes = require('../src/routes/resumeRoute');
const authToken = require('../src/middlewares/authToken');
const interviewRoute = require('../src/routes/interview');
app.get("/api/health", (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/protected', authToken, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
});

app.use("/api/user",userRoute)
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoute);

module.exports = app;



