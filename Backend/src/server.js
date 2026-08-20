require('dotenv').config();

const app = require('./app');
const dbConnect = require('./db/db');
const groq = require('./config/aiConfig');

console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);
console.log(
    "GROQ KEY PREFIX:",
    process.env.GROQ_API_KEY
        ? process.env.GROQ_API_KEY.substring(0, 7)
        : "NO KEY"
);

dbConnect();

app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);

    try {
        const models = await groq.models.list();

        console.log("===== AVAILABLE GROQ MODELS =====");

        models.data.forEach(model => {
            console.log(model.id);
        });

        console.log("================================");
    } catch (error) {
        console.error("===== GROQ MODEL LIST ERROR =====");
        console.error(error);
        console.error("================================");
    }
});
