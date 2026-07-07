const User = require('../models/User');

const getGlobalLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const users = await User.find()
            .sort({ranking: -1})
            .limit(limit)
            .select('name username ranking questionsSolved');

            res.status(200).json({ users });
   
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

