const { Server } = require('socket.io');
const redis = require('./redis');

let io = null;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    // Judge worker alag process/container mein chalta hai, isliye ye is
    // process ka io instance direct use nahi kar sakta. Worker Redis pe
    // 'verdicts' channel pe publish karega, hum yahan subscribe karke
    // us user ke room mein emit karenge. Ye multi-instance server
    // deployment (load balancer ke peeche) mein bhi kaam karta hai,
    // kyunki har server instance is channel ko subscribe karta hai.
    const subscriber = redis.duplicate();

    subscriber.on('error', (err) => {
        console.error('Redis subscriber error:', err.message);
    });

    subscriber.subscribe('verdicts', (err) => {
        if (err) {
            console.error('Failed to subscribe to verdicts channel:', err.message);
        } else {
            console.log('Subscribed to Redis "verdicts" channel');
        }
    });

    subscriber.on('message', (channel, message) => {
        if (channel !== 'verdicts') return;

        try {
            const { userId, submissionId, verdict, executionTime, errorOutput } = JSON.parse(message);
            io.to(userId.toString()).emit('verdict', {
                submissionId,
                verdict,
                executionTime,
                errorOutput
            });
        } catch (err) {
            console.error('Failed to process verdict message:', err.message);
        }
    });

    return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };