require('dotenv').config();

const app = require('./app');
const dbConnect = require('./db/db');
const groq = require('./config/aiConfig');

dbConnect();

app.listen(process.env.PORT, async () => {
    console.log(`Server is running on port ${process.env.PORT}`);

    console.log("========== GROQ TEST ==========");
    console.log("API KEY EXISTS:", !!process.env.GROQ_API_KEY);

    try {
        const models = await groq.models.list();

        console.log("MODELS:");
        console.log(models.data.map(model => model.id));

    } catch (error) {
        console.error("GROQ TEST FAILED:");
        console.error(error.message);
    }

    console.log("================================");
});
