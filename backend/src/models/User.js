import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },


    authProvider: {
        type: String,
        enum: ['credentials', 'google'],
        default: 'credentials'
    },

    // Setting app
    settings: {
        baseCurrency: {
            type: String,
            enum: ['PLN', 'USD', 'EUR', 'UAH'],
            default: 'PLN'
        },
        language: {
            type: String,
            enum: ['UA', 'EN', 'PL', 'RUS'],
            default: 'UA'
        }
    },

    // Telegram
    telegram: {
        chatId: {
            type: String,
            default: null
        },
        connectionToken: {
            type: String,
            default: null
        },
        isBotActive: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

userSchema.index({
    'telegram.connectionToken': 1
});

export default mongoose.model('User', userSchema);