const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });
    return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };