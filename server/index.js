require('dotenv').config();
const express = require('express');
const http = require('http');           // ← add kiya
const { Server } = require('socket.io'); // ← add kiya
const connectDB = require('./config/db');
const cors = require('cors');
const redis = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const questionRoutes = require('./routes/questionRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { connectRabbitMQ } = require('./config/rabbitmq');
const { initSocket } = require('./config/socket');
connectDB();
connectRabbitMQ();

const app = express();
const server = http.createServer(app);  // ← app se server banaya
const io = initSocket(server);
// Socket.io setup

// Socket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // User apna userId bhejta hai — us room mein daal do
    socket.on('join', (userId) => {
        socket.join(userId.toString());
        console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is healthy' });
});

const PORT = process.env.PORT || 5000;

// app.listen → server.listen
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { io }; // ← worker ke liye export