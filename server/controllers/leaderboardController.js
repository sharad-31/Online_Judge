const User = require('../models/User');
const redis = require('../config/redis');

const getGlobalLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cacheKey = `leaderboard:global:${limit}`;

        // Step 1 — Redis check karo
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log('Cache HIT — leaderboard');
            return res.status(200).json(JSON.parse(cached));
        }

        // Step 2 — Cache miss → DB se fetch karo
        console.log('Cache MISS — fetching from DB');
        const users = await User.find()
            .sort({ ranking: -1 })
            .limit(limit)
            .select('name username ranking questionsSolved');

        const data = { users };

        // Step 3 — Redis mein store karo — 60 sec TTL
        await redis.set(cacheKey, JSON.stringify(data), 'EX', 60);

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserStats = async (req, res) => {
    try {
        // user dhundo by id
        const userId= req.params.userId;
       
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // stats return karo

        res.status(200).json({questionsSolved: user.questionsSolved, ranking: user.ranking, solvedQuestions: user.solvedQuestions});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getGlobalLeaderboard, getUserStats };

