import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    // User binding
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },

    // Type of category
    type: {
        type: String,
        enum: ['INCOME', 'EXPENSE'],
        required: true
    },

    // Visual for dashboard
    icon: {
        type: String,
        default: 'folder'
    },
    color: {
        type: String,
        default: '#4f46e5'
    },


    monthlyLimit: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Category', categorySchema);