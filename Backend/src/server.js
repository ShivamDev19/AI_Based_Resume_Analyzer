const express = require('express');
require('dotenv').config();
const app = require('./app');
const dbConnect = require('./db/db');

dbConnect();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

groq.models.list()
    .then(models => {
        console.log("AVAILABLE GROQ MODELS:");
        models.data.forEach(model => {
            console.log(model.id);
        });
    })
    .catch(err => {
        console.error("GROQ MODEL LIST ERROR:", err);
    });
