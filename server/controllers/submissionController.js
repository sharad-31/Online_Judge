const Submission = require('../models/Submission');
const Question = require('../models/Question');
const TestCase = require('../models/TestCase');
const User = require('../models/User');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const redis = require('../config/redis');
const { getChannel } = require('../config/rabbitmq');

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const langMap = {
    'c++': 'cpp', 'cpp': 'cpp',
    'c': 'c',
    'java': 'java',
    'python': 'python', 'python3': 'python'
};

const executeCode = (language, code, input, timeLimit) => {
    return new Promise((resolve, reject) => {
        const fileId = uuidv4();
        const extensions = { 
            'cpp': 'cpp', 'c': 'c', 
            'java': 'java', 'python': 'py' 
        };
        const ext = extensions[language];
        const fileName = `solution_${fileId}.${ext}`;
        const filePath = path.join(tempDir, fileName);
        
        fs.writeFileSync(filePath, code);

        // Java ke public class ka naam file ke naam se exactly match hona
        // zaroori hai javac ke liye. Purana single-file launcher mode
        // (`java file.java`) is baat ko ignore kar deta tha — koi bhi
        // class name chalta tha. Ab explicit javac step use kar rahe hain
        // (taaki compile time TLE window se bahar rahe), isliye code se
        // hi actual class name nikalte hain — hardcoded "Main" farz nahi
        // karte, warna student ne "public class Solution" likha ho toh
        // wo galat CE ban jayega, sirf naming ki wajah se.
        const extractJavaClassName = (src) => {
            const publicMatch = src.match(/public\s+(?:final\s+|abstract\s+)?class\s+(\w+)/);
            if (publicMatch) return publicMatch[1];
            const anyMatch = src.match(/(?:^|\s)class\s+(\w+)/);
            if (anyMatch) return anyMatch[1];
            return 'Main'; // koi class hi na mile toh safe fallback
        };
        const javaClassName = language === 'java' ? extractJavaClassName(code) : null;

        // Host pe file ka naam random hi rehta hai (uuid collision avoid
        // karne ke liye) — sirf docker container ke andar student ke
        // actual class name se mount karte hain, jisse javac ko sahi
        // filename mile.
        const containerFileName = language === 'java' ? `${javaClassName}.java` : fileName;

        // Interpreter/JVM startup apne aap mein overhead hai jo candidate
        // ke algorithm ki galti nahi hai — isliye un languages ko thoda
        // extra time dete hain taaki genuine TLE aur startup-overhead ki
        // wajah se aaya fake TLE mein farq rahe. Compiled C/C++ binaries
        // ko iski zaroorat nahi.
        const timeMultiplier = { java: 2, python: 1.5, cpp: 1, c: 1 };
        const effectiveTimeLimit = Math.ceil(timeLimit * (timeMultiplier[language] || 1));

        const commands = {
            'cpp': {
                compile: `g++ -o /code/solution /code/${containerFileName}`,
                run: `/code/solution`
            },
            'python': {
                compile: null,
                run: `python3 /code/${containerFileName}`
            },
            'c': {
                compile: `gcc -o /code/solution /code/${containerFileName}`,
                run: `/code/solution`
            },
            'java': {
                // Pehle compile nahi ho raha tha — "java Main.java" single-
                // file launcher mode compile + run dono ek saath karta hai,
                // aur dono hi tight `timeout` window ke andar the. Ab C/C++
                // jaisa hi explicit compile step hai jo timeout ke bahar
                // chalta hai, sirf actual run wale part pe time limit lagta hai.
                compile: `javac /code/${containerFileName}`,
                run: `java -cp /code ${javaClassName}`
            }
        };

        const cmd = commands[language];
        if (!cmd) {
            fs.unlinkSync(filePath);
            return resolve({ verdict: 'CE', output: 'Unsupported language' });
        }

        const inputFileName = `input_${fileId}.txt`;
        const inputFilePath = path.join(tempDir, inputFileName);
        fs.writeFileSync(inputFilePath, input);

        const dockerFilePath = filePath.replace(/\\/g, '/').replace(/^([A-Z]):/, (_, drive) => `/${drive.toLowerCase()}`);
        const dockerInputPath = inputFilePath.replace(/\\/g, '/').replace(/^([A-Z]):/, (_, drive) => `/${drive.toLowerCase()}`);

        const dockerCmd = cmd.compile
            ? `docker run --rm --network none --memory 256m --cpus 1 -v "${dockerFilePath}:/code/${containerFileName}" -v "${dockerInputPath}:/code/input.txt" oj-judge sh -c "${cmd.compile} && timeout ${effectiveTimeLimit} ${cmd.run} < /code/input.txt"`
            : `docker run --rm --network none --memory 256m --cpus 1 -v "${dockerFilePath}:/code/${containerFileName}" -v "${dockerInputPath}:/code/input.txt" oj-judge sh -c "timeout ${effectiveTimeLimit} ${cmd.run} < /code/input.txt"`;

        const startedAt = Date.now();

        exec(dockerCmd, { timeout: (effectiveTimeLimit + 2) * 1000 }, (error, stdout, stderr) => {
            const executionTime = Date.now() - startedAt;
            try { fs.unlinkSync(filePath); } catch (e) {}
            try { fs.unlinkSync(inputFilePath); } catch (e) {}

            if (error) {
                if (error.killed || error.code === 124) {
                    return resolve({ verdict: 'TLE', output: '', executionTime });
                }
                if (stderr) {
                    return resolve({ verdict: 'CE', output: stderr, executionTime });
                }
                return resolve({ verdict: 'RE', output: error.message, executionTime });
            }

            resolve({ verdict: 'OK', output: stdout.trim(), executionTime });
        });
    });
};

const submitCode = async (req, res) => {
    try {
        const { questionId, language, code, codingTime } = req.body;
        const userId = req.user._id;

        // 1. Validation
        if (!questionId || !language || !code || !codingTime) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 2. Cooldown check — Redis
        const cooldownKey = `cooldown:${userId}`;
        const onCooldown = await redis.get(cooldownKey);
        if (onCooldown) {
            const ttl = await redis.ttl(cooldownKey);
            return res.status(429).json({ 
                message: `Please wait ${ttl} seconds before submitting again.` 
            });
        }

        // 3. Language normalize
        const normalizedLanguage = langMap[language.toLowerCase()];
        if (!normalizedLanguage) {
            return res.status(400).json({ message: 'Unsupported language' });
        }

        // 4. Question fetch
        const question = await Question.findById(questionId); 
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // 5. Test cases fetch
        const testCases = await TestCase.find({ 
            questionId: questionId,
            hidden: true
        });

        if (testCases.length === 0) {
            return res.status(404).json({ message: 'No test cases found' });
        }

        // 6. Submission save — PENDING
        const submission = new Submission({
            userId,
            questionId,
            language: normalizedLanguage,
            code,
            codingTime,
            verdict: 'PENDING'
        });
        await submission.save();

        // 7. Cooldown set karo
        await redis.set(cooldownKey, 1, 'EX', 30);
        

        // 8. Queue mein daalo

        console.log({
            submissionId: submission._id,
            userId: userId.toString()
        });
        const channel = getChannel();
        if (channel) {
            const message = JSON.stringify({
                submissionId: submission._id,
                userId: userId.toString(),
                questionId,
                language: normalizedLanguage,
                code,
                timeLimit: question.timeLimit,
                testCases: testCases.map(tc => ({
                    input: tc.input,
                    output: tc.output
                }))
            });
            channel.sendToQueue('submissions', Buffer.from(message), {
                persistent: true
            });
            console.log('Submission queued:', submission._id);
        }
        console.log("Submission queued");

        // 9. Turant response
        res.status(200).json({ 
            message: 'Submission received — processing',
            submissionId: submission._id,
            verdict: 'PENDING'
        });

    } catch (error) {
        console.error('SUBMISSION ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }
        res.status(200).json({ submission });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid submission ID' });
        }
        res.status(500).json({ message: error.message });
    }
};

const getUserSubmissions = async (req, res) => {
    try {
        if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }
        const submissions = await Submission.find({ 
            userId: req.params.userId 
        })
        .populate('questionId', 'title')
        .sort({ createdAt: -1 });
        res.status(200).json({ submissions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuestionSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ 
            questionId: req.params.questionId,
            userId: req.user._id
        }).sort({ createdAt: -1 });
        res.status(200).json({ submissions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    submitCode, 
    executeCode, 
    getSubmissionById, 
    getUserSubmissions, 
    getQuestionSubmissions 
};