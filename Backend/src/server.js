const express = require('express');
require('dotenv').config();
const app = require('./app');
const dbConnect = require('./db/db');

dbConnect();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});