const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(
            `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`
        );
        channel = await connection.createChannel();
        
        // Queue declare karo
        await channel.assertQueue('submissions', { durable: true });
        
        console.log('RabbitMQ Connected!');
        return channel;
    } catch (error) {
        console.error('RabbitMQ Error:', error.message);
    }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
