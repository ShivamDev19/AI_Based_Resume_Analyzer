require('dotenv').config();

const app = require('./app');
const dbConnect = require('./db/db');
const groq = require('./config/aiConfig');

dbConnect();

app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);

    console.log("GROQ KEY EXISTS:", !!process.env.GROQ_API_KEY);

    try {
        const models = await groq.models.list();

        console.log("========== GROQ MODELS ==========");

        models.data.forEach(model => {
            console.log(model.id);
        });

        console.log("=================================");
    } catch (err) {
        console.error("========== GROQ LIST ERROR ==========");
        console.error(err.message);
        console.error("======================================");
    }
});
