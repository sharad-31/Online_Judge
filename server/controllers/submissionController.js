const Submission = require('../models/Submission');
const Question = require('../models/Question');
const TestCase = require('../models/TestCase');
const User = require('../models/User');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Language normalize karo — "C++" → "cpp", "Python" → "python"
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

        const commands = {
            'cpp': {
                compile: `g++ -o /code/solution /code/${fileName}`,
                run: `/code/solution`
            },
            'python': {
                compile: null,
                run: `python3 /code/${fileName}`
            },
            'c': {
                compile: `gcc -o /code/solution /code/${fileName}`,
                run: `/code/solution`
            },
            'java': {
                compile: null,              
                run: `java /code/${fileName}`  
            }
        };

        const cmd = commands[language];
        if (!cmd) {
            fs.unlinkSync(filePath);
            return resolve({ verdict: 'CE', output: 'Unsupported language' });
        }

        // input file banao
        const inputFileName = `input_${fileId}.txt`;
        const inputFilePath = path.join(tempDir, inputFileName);
        fs.writeFileSync(inputFilePath, input);


        const dockerFilePath = filePath.replace(/\\/g, '/').replace(/^([A-Z]):/, (_, drive) => `/${drive.toLowerCase()}`);
        const dockerInputPath = inputFilePath.replace(/\\/g, '/').replace(/^([A-Z]):/, (_, drive) => `/${drive.toLowerCase()}`);

        const dockerCmd = cmd.compile
            ? `docker run --rm --network none --memory 256m --cpus 1 -v "${dockerFilePath}:/code/${fileName}" -v "${dockerInputPath}:/code/input.txt" oj-judge sh -c "${cmd.compile} && timeout ${timeLimit} ${cmd.run} < /code/input.txt"`
            : `docker run --rm --network none --memory 256m --cpus 1 -v "${dockerFilePath}:/code/${fileName}" -v "${dockerInputPath}:/code/input.txt" oj-judge sh -c "timeout ${timeLimit} ${cmd.run} < /code/input.txt"`;      
        console.log('DOCKER CMD:', dockerCmd);

        const startedAt = Date.now();

        exec(dockerCmd, { timeout: (timeLimit + 2) * 1000 }, (error, stdout, stderr) => {
            const executionTime = Date.now() - startedAt;
            // temp file delete karo — hamesha
          try { fs.unlinkSync(filePath); } catch (e) {}
            try { fs.unlinkSync(inputFilePath); } catch (e) {}
            console.log('STDOUT:', stdout);
            console.log('STDERR:', stderr);
            console.log('ERROR:', error?.message);

            if (error) {
                // error.killed = Node's own exec() timeout fired.
                // error.code === 124 = the shell's `timeout <n>` command fired first (standard POSIX convention).
                // Both mean the same thing: the program ran past the time limit.
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

        // Language normalize karo
        const normalizedLanguage = langMap[language.toLowerCase()];
        if (!normalizedLanguage) {
            return res.status(400).json({ message: 'Unsupported language' });
        }

// 2. Question fetch karo
        const question = await Question.findById(questionId); 
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // 2.5 Cooldown check — same user ka last submission 30 sec se purana hona chahiye
        const COOLDOWN_SECONDS = 30;
        const lastSubmission = await Submission.findOne({ userId })
            .sort({ createdAt: -1 });

        if (lastSubmission) {
            const secondsSinceLast = (Date.now() - lastSubmission.createdAt.getTime()) / 1000;
            if (secondsSinceLast < COOLDOWN_SECONDS) {
                const waitTime = Math.ceil(COOLDOWN_SECONDS - secondsSinceLast);
                return res.status(429).json({
                    message: `Please wait ${waitTime} more second(s) before submitting again`
                });
            }
        }

        // 3. Test cases fetch karo — check BEFORE saving the submission so we
        //    never leave a permanently PENDING record if none exist
        const testCases = await TestCase.find({ 
            questionId: questionId,
            hidden: true
        });

        console.log('TEST CASES FOUND:', testCases.length);

        if (testCases.length === 0) {
            return res.status(404).json({ message: 'No test cases found' });
        }

        // 4. Submission banao — PENDING
        const submission = new Submission({
            userId,
            questionId,
            language: normalizedLanguage,
            code,
            codingTime,
            verdict: 'PENDING'
        });
        await submission.save();

        console.log('STARTING EXECUTION...');

        // 5. Har test case pe execute karo
        let finalVerdict = 'AC';
        let totalTime = 0;

        for (const testCase of testCases) {
            console.log('EXECUTING TEST CASE:', testCase.input);

            const result = await executeCode(
                normalizedLanguage,  // normalized language pass karo
                code,
                testCase.input,
                question.timeLimit
            );

            totalTime += result.executionTime || 0;

            if (result.verdict === 'CE') {
                finalVerdict = 'CE';
                break;
            }

            if (result.verdict !== 'OK') {
                finalVerdict = result.verdict;
                break;
            }

            if (result.output.trim() !== testCase.output.trim()) {
                finalVerdict = 'WA';
                break;
            }
        }

        // 6. Verdict save karo
        submission.verdict = finalVerdict;
        submission.executionTime = totalTime;
        await submission.save();

        // AC hai toh user update karo
        if (finalVerdict === 'AC') {
            await User.findByIdAndUpdate(userId, {
                $inc: { questionsSolved: 1, ranking: 10 },
                $addToSet: { solvedQuestions: questionId }
            });
            await Question.findByIdAndUpdate(questionId, {
                $inc: { totalSubmissions: 1, acceptedSubmissions: 1 }
            });
        } else {
            await Question.findByIdAndUpdate(questionId, {
                $inc: { totalSubmissions: 1 }
            });
        }

        res.status(200).json({ 
            message: 'Submission evaluated', 
            verdict: finalVerdict,
            submissionId: submission._id
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
        // Only the submission's owner (or an admin) may view it
        if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You can only view your own submissions.' });
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
        // Only the user themself (or an admin) may list this history
        if (req.params.userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You can only view your own submissions.' });
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