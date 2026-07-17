
const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        index: true,
    },
    questionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        index: true,
    },
    language:{
        type: String,
        enum: ['c', 'cpp', 'java', 'python'],
        required: true
    },
    code:{
        type: String,
        required: true
    },
    verdict:{
        type: String,
        enum: ['AC', 'WA', 'CE', 'RE', 'TLE', 'MLE', 'SYSTEM_ERROR', 'PENDING'],
        required: true,
        default: 'PENDING'
    },
    executionTime:{
        type: Number,
        default: 0
    },
    memoryUsed:{
        type: Number,
        default: 0
    },  
    codingTime:{
        type: Number,
        default: 0
    },
},{
    timestamps: true
});

module.exports=mongoose.model("Submission", submissionSchema);