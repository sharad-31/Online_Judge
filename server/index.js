require('dotenv').config();
const express= require('express');
const connectDB= require('./config/db');
const cors= require('cors');
const authRoutes = require('./routes/authRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const questionRoutes = require('./routes/questionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

connectDB();

const app=express();
app.use(cors({ origin: 'http://localhost:5173'}));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);


app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});


const PORT= process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});