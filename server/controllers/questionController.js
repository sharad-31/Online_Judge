const Question = require('../models/Question');
const TestCase = require('../models/TestCase');
const mongoose = require('mongoose');
// GET /questions  (with optional ?difficulty= & ?topic= filters)
const getAllQuestions = async (req, res) => {
  try {
    const { difficulty, topic, search } = req.query;  // ← search add karo

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const questions = await Question.find(filter).select('title topic difficulty');

    res.status(200).json({
      count: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /questions/:id
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ question });
  } catch (error) {
    // Invalid ObjectId format also lands here
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /questions/:id/testcases/sample
const getSampleTestCases = async (req, res) => {
  try {
    const { id } = req.params;

    // Confirm the question exists first
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only non-hidden testcases — never expose hidden ones via this route
    const sampleTestCases = await TestCase.find({
      questionId: id,
      hidden: false
    }).select('input output');

    res.status(200).json({
      count: sampleTestCases.length,
      testCases: sampleTestCases
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /questions  (admin only)
const createQuestion = async (req, res) => {
  try {
    const {
      title, topic, difficulty, statement,
      sampleInput, sampleOutput, timeLimit, memoryLimit
    } = req.body;

    if (!title || !topic || !difficulty || !statement || !sampleInput || !sampleOutput) {
      return res.status(400).json({ message: 'Title, topic, difficulty, statement, sampleInput and sampleOutput are required' });
    }

    const question = new Question({
      title,
      topic,
      difficulty,
      statement,
      sampleInput,
      sampleOutput,
      timeLimit,
      memoryLimit
    });

    await question.save();

    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /questions/:id  (admin only)
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only update fields that are actually provided
    const allowedFields = ['title', 'topic', 'difficulty', 'statement', 'sampleInput', 'sampleOutput', 'timeLimit', 'memoryLimit'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();

    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /questions/:id  (admin only)
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await Question.findByIdAndDelete(id);

    // Also clean up related testcases so orphaned data doesn't pile up
    await TestCase.deleteMany({ questionId: id });

    res.status(200).json({ message: 'Question and related testcases deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  getSampleTestCases,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
