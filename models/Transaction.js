const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    incomeRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'income',
        default: null
    },
    expenseRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'expense',
        default: null
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('transaction', TransactionSchema);
module.exports = Transaction;
