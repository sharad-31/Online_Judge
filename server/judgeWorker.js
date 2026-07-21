require('dotenv').config();
const mongoose = require('mongoose');
const amqp = require('amqplib');

const { executeCode } = require('./controllers/submissionController');
const Submission = require('./models/Submission');
const User = require('./models/User');
const axios = require("axios");

// io yahan mat lo — neeche lena hai
const startWorker = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Worker: MongoDB Connected');

        const connection = await amqp.connect(
            `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`
        );
        const channel = await connection.createChannel();
        await channel.assertQueue('submissions', { durable: true });
        channel.prefetch(1);
        
        console.log('Worker: Waiting for submissions...');

        channel.consume('submissions', async (msg) => {
            if (!msg) return;
            
            const data = JSON.parse(msg.content.toString());
            console.log('Processing submission:', data.submissionId);

            let finalVerdict = 'AC';
            let totalTime = 0;

            for (const testCase of data.testCases) {
                const result = await executeCode(
                    data.language,
                    data.code,
                    testCase.input,
                    data.timeLimit
                );

                totalTime += result.executionTime || 0;

                if (result.verdict === 'CE') { finalVerdict = 'CE'; break; }
                if (result.verdict !== 'OK') { finalVerdict = result.verdict; break; }
                if (result.output.trim() !== testCase.output.trim()) { 
                    finalVerdict = 'WA'; break; 
                }
            }

            await Submission.findByIdAndUpdate(data.submissionId, {
                verdict: finalVerdict,
                executionTime: totalTime
            });

            // User stats update
            if (finalVerdict === "AC") {
                const submission = await Submission.findById(data.submissionId);
                const userDoc = await User.findById(submission.userId);

                const alreadySolved = userDoc.solvedQuestions
                    .map(id => id.toString())
                    .includes(data.questionId.toString());

                if (!alreadySolved) {
                    await User.findByIdAndUpdate(submission.userId, {
                        $inc: {
                            questionsSolved: 1,
                            ranking: 10
                        },
                        $addToSet: {
                            solvedQuestions: data.questionId
                        }
                    });
                }
            }

            // Socket verdict server ko bhejo
            try {
                await axios.post(
                    "http://localhost:5000/api/v1/submissions/internal/verdict",
                    {
                        submissionId: data.submissionId,
                        userId: data.userId,
                        verdict: finalVerdict,
                        executionTime: totalTime
                    }
                );

                console.log("Verdict sent to server successfully");
            } catch (err) {
                console.error(
                    "Failed to send verdict:",
                    err.response?.data || err.message
                );
            }

            console.log("Verdict:", finalVerdict, "for", data.submissionId);

            channel.ack(msg);
        }, { noAck: false });

    } catch (error) {
        console.error('Worker error:', error);
    }
};

startWorker();