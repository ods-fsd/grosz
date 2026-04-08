import mongoose from 'mongoose';

const currencyRateSchema = new mongoose.Schema({
    // Код валюти (напр. USD, EUR)
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    // Останній успішно отриманий середній курс до PLN
    rate: {
        type: Number,
        required: true
    },
    // Коли цей курс було оновлено в останній раз
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('CurrencyRate', currencyRateSchema);