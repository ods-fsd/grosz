import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

            req.user = {
                id: decoded.id
            };
            return next();
        } catch (error) {
            console.error('[AuthMiddleware] Помилка токена:', error.message);
            return res.status(401).json({
                message: 'Не авторизовано, токен недійсний'
            });
        }
    }


    if (!token) {
        res.status(401).json({
            message: 'Не авторизовано, токен відсутній'
        });
    }
};