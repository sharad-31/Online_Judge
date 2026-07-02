require('dotenv').config();
const express= require('express');
const connectDB= require('./config/db');
const cors= require('cors');
const authRoutes = require('./routes/authRoutes');

const questionRoutes = require('./routes/questionRoutes');

connectDB();

const app=express();
app.use(cors({ origin: 'http://localhost:5173'}));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/questions', questionRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});


const PORT= process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});