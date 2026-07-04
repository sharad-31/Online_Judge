const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    }
  },
  statement: {
    type: String,
    required: [true, 'Problem statement is required']
  },
  sampleInput: {
    type: String,
    required: [true, 'Sample input is required']
  },
  sampleOutput: {
    type: String,
    required: [true, 'Sample output is required']
  },
  timeLimit: {
    type: Number,
    default: 2,
    min: 1
  },
  memoryLimit: {
    type: Number,
    default: 256,
    min: 16
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
},{ timestamps: true });


module.exports = mongoose.model('Question', questionSchema);