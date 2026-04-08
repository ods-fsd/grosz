import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    // User binding
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Category binding
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },

    // Type of transaction
    type: {
        type: String,
        enum: ['INCOME', 'EXPENSE'],
        required: true
    },

    // --- MULTICURRENCY BLOCK ---
    amountOriginal: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'PLN'
    },

    exchangeRateToBase: {
        type: Number,
        required: true,
        default: 1
    },
    amountBase: {
        type: Number,
        required: true,
        min: 0
    },


    isPaid: {
        type: Boolean,
        default: false
    },
    // Due date
    dueDate: {
        type: Date
    },
    // Actual payment date
    paidAt: {
        type: Date
    },

    // Additional notes
    notes: {
        type: String,
        maxLength: 500,
        trim: true
    }
}, {
    timestamps: true
});


transactionSchema.index({
    userId: 1,
    paidAt: -1
});

export default mongoose.model('Transaction', transactionSchema);