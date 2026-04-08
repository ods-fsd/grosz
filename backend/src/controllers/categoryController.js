import Category from '../models/Category.js';

export const createCategory = async (req, res) => {
    try {
        const {
            name,
            type,
            icon,
            color,
            monthlyLimit
        } = req.body;

        const userId = req.user.id;

        const existingCategory = await Category.findOne({
            userId,
            name
        });
        if (existingCategory) {
            return res.status(400).json({
                message: 'Категорія з такою назвою вже існує'
            });
        }

        const category = await Category.create({
            userId,
            name,
            type,
            icon,
            color,
            monthlyLimit
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('[CategoryController] Помилка створення:', error);
        res.status(500).json({
            message: 'Помилка сервера при створенні категорії'
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            userId: req.user.id
        }).sort({
            createdAt: -1
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: 'Помилка отримання категорій'
        });
    }
};