import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

// Допоміжна функція для отримання курсу з NBP API
const getExchangeRate = async (currency) => {
    if (currency.toUpperCase() === 'PLN') return 1;

    try {
        // Звертаємось до відкритого API Нацбанку Польщі (Таблиця А - середні курси)
        const response = await fetch(`http://api.nbp.pl/api/exchangerates/rates/a/${currency}/?format=json`);

        if (!response.ok) {
            throw new Error(`NBP API повернув статус ${response.status}`);
        }

        const data = await response.json();
        return data.rates[0].mid; // Повертаємо середній курс (наприклад, 3.99 для USD)
    } catch (error) {
        console.error(`[NBP API Error] Не вдалося отримати курс для ${currency}:`, error.message);
        // Тут ми маємо прийняти архітектурне рішення: що робити, якщо банк "лежить"?
        // Поки що кидаємо помилку, щоб не записати транзакцію з кривим курсом.
        throw new Error('Сервіс курсів валют тимчасово недоступний');
    }
};

// @desc    Створити нову транзакцію (витрату або дохід)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
    try {
        const {
            categoryId,
            title,
            amountOriginal,
            currency = 'PLN',
            isPaid = false,
            dueDate,
            notes
        } = req.body;

        const userId = req.user.id;

        // 1. Перевіряємо, чи існує категорія і чи належить вона цьому юзеру
        const category = await Category.findOne({
            _id: categoryId,
            userId
        });
        if (!category) {
            return res.status(404).json({
                message: 'Категорію не знайдено або доступ заборонено'
            });
        }

        // 2. Отримуємо актуальний курс (якщо валюта не PLN, йдемо в банк)
        let exchangeRateToBase;
        try {
            exchangeRateToBase = await getExchangeRate(currency);
        } catch (apiError) {
            return res.status(503).json({
                message: apiError.message
            });
        }

        // 3. Рахуємо базову суму (в злотих)
        const amountBase = Number((amountOriginal * exchangeRateToBase).toFixed(2));

        // 4. Логіка дат оплати
        // Якщо чекбокс "Оплачено" стоїть, фіксуємо поточний час. Якщо ні - залишаємо null.
        const paidAt = isPaid ? new Date() : null;

        // 5. Зберігаємо в базу
        const transaction = await Transaction.create({
            userId,
            categoryId,
            title,
            type: category.type, // Беремо тип з категорії, щоб уникнути розбіжностей
            amountOriginal,
            currency: currency.toUpperCase(),
            exchangeRateToBase,
            amountBase,
            isPaid,
            dueDate,
            paidAt,
            notes
        });

        res.status(201).json(transaction);

    } catch (error) {
        console.error('[TransactionController] Помилка створення:', error);
        res.status(500).json({
            message: 'Помилка сервера при збереженні транзакції'
        });
    }
};


/**
 * @desc    Оновити статус оплати (isPaid)
 * @route   PATCH /api/transactions/:id
 */

export const updateTransactionStatus = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            isPaid
        } = req.body;
        const userId = req.user.id;

        const transaction = await Transaction.findOne({
            _id: id,
            userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: 'Транзакцію не знайдено'
            });
        }

        transaction.isPaid = isPaid;
        // Фіксуємо дату оплати, якщо статус змінено на true, або скидаємо в null
        transaction.paidAt = isPaid ? new Date() : null;

        await transaction.save();

        res.status(200).json(transaction);
    } catch (error) {
        console.error('[Transaction] Update error:', error);
        res.status(500).json({
            message: 'Помилка при оновленні статусу'
        });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const userId = req.user.id;

        const transaction = await Transaction.findOne({
            _id: id,
            userId
        });

        if (!transaction) {
            return res.status(404).json({
                message: 'Транзакцію не знайдено'
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            message: 'Транзакцію успішно видалено'
        });
    } catch (error) {
        console.error('[Transaction] Delete error:', error);
        res.status(500).json({
            message: 'Помилка при видаленні транзакції'
        });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        const transactions = await Transaction.find({
            userId
        }).populate('category', 'name icon color');

        res.status(200).json(transactions);
    } catch (error) {
        console.error('[Transaction] Get error:', error);
        res.status(500).json({
            message: 'Помилка при отриманні транзакцій'
        });
    }
};