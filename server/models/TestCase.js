const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  hidden: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

module.exports = mongoose.model('TestCase', testCaseSchema);