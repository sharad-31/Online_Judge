require('dotenv').config();
const mongoose = require('mongoose');
const amqp = require('amqplib');

const { executeCode } = require('./controllers/submissionController');
const Submission = require('./models/Submission');
const User = require('./models/User');
const redis = require('./config/redis');

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

            let data;
            let finalVerdict = 'AC';
            let totalTime = 0;
            let errorOutput = '';

            try {
                data = JSON.parse(msg.content.toString());
                console.log('Processing submission:', data.submissionId);

                for (const testCase of data.testCases) {
                    const result = await executeCode(
                        data.language,
                        data.code,
                        testCase.input,
                        data.timeLimit
                    );

                    totalTime += result.executionTime || 0;

                    if (result.verdict === 'CE') {
                        finalVerdict = 'CE';
                        errorOutput = (result.output || '').slice(0, 4000);
                        break;
                    }
                    if (result.verdict !== 'OK') {
                        finalVerdict = result.verdict;
                        if (result.verdict === 'RE') {
                            errorOutput = (result.output || '').slice(0, 4000);
                        }
                        break;
                    }
                    if (result.output.trim() !== testCase.output.trim()) {
                        finalVerdict = 'WA';
                        break;
                    }
                }

                await Submission.findByIdAndUpdate(data.submissionId, {
                    verdict: finalVerdict,
                    executionTime: totalTime,
                    errorOutput
                });

                // User stats update
                if (finalVerdict === "AC") {
                    const submission = await Submission.findById(data.submissionId);
                    const userDoc = await User.findById(submission.userId);

                    if (userDoc) {
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
                }

                console.log("Verdict:", finalVerdict, "for", data.submissionId);

            } catch (err) {
                // Kuch bhi upar crash ho jaye (docker exec fail, DB error,
                // malformed message, missing user, whatever) — submission ko
                // PENDING mein hamesha ke liye stuck nahi chhodna. SYSTEM_ERROR
                // verdict ke saath DB update karo taaki user ko pata chale
                // kuch galat hua, "Processing..." mein hamesha ke liye atka na rahe.
                console.error('Judge worker processing error:', err);
                finalVerdict = 'SYSTEM_ERROR';
                errorOutput = 'Something went wrong while judging your submission. Please try submitting again.';

                if (data?.submissionId) {
                    try {
                        await Submission.findByIdAndUpdate(data.submissionId, {
                            verdict: finalVerdict,
                            executionTime: totalTime,
                            errorOutput
                        });
                    } catch (dbErr) {
                        console.error('Failed to persist SYSTEM_ERROR verdict:', dbErr.message);
                    }
                }
            }

            // data.submissionId/userId na mile (e.g. malformed message) toh
            // kisi ko notify nahi kar sakte — bas ack karke aage badho.
            if (!data?.submissionId || !data?.userId) {
                console.error('Skipping verdict notification — malformed message');
                channel.ack(msg);
                return;
            }

            // Socket verdict Redis pe publish karo — server (chahe kitne
            // bhi instances chal rahe hon, kisi bhi container/host pe)
            // 'verdicts' channel subscribe karke sahi user ko emit kar
            // dega. Worker ko server ka network location jaanne ki
            // zaroorat hi nahi.
            try {
                await redis.publish('verdicts', JSON.stringify({
                    submissionId: data.submissionId,
                    userId: data.userId,
                    verdict: finalVerdict,
                    executionTime: totalTime,
                    errorOutput
                }));

                console.log("Verdict published to Redis");
            } catch (err) {
                console.error("Failed to publish verdict:", err.message);
            }

            // Har haal mein ack karo — chahe humne SYSTEM_ERROR hi kyun
            // na diya ho. Ack na karne se message RabbitMQ mein wapas
            // requeue ho jayega aur wahi submission baar baar fail hoke
            // infinite loop bana degi.
            channel.ack(msg);
        }, { noAck: false });

    } catch (error) {
        console.error('Worker error:', error);
    }
};

startWorker();