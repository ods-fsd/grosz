import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Grosz Backend is running',
        timestamp: new Date().toISOString()
    });
});

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[MongoDB] Успішно підключено: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[MongoDB] Помилка підключення: ${error.message}`);
        process.exit(1);
    }
};
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`[Server] Запущено на порту ${PORT}`);
        console.log(`[Server] Healthcheck: http://localhost:${PORT}/api/health`);
    });
};

startServer();