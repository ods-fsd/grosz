import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


const generateToken = (id) => {
    return jwt.sign({
        id
    }, process.env.JWT_SECRET || 'grosz_secret_key_2026', {
        expiresIn: '30d',
    });
};

/**
 * @desc    Реєстрація нового користувача
 * @route   POST /api/auth/register
 */
export const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        const userExists = await User.findOne({
            email
        });
        if (userExists) {
            return res.status(400).json({
                message: 'Користувач із такою поштою вже існує'
            });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: 'credentials'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при реєстрації'
        });
    }
};

/**
 * @desc    Вхід (Логін)
 * @route   POST /api/auth/login
 */
export const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({
                message: 'Невірний email або пароль'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Помилка при вході'
        });
    }
};