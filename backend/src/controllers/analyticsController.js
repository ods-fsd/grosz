import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';


export const getDashboardStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);


        const stats = await Transaction.aggregate([{
                $match: {
                    userId
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{
                                $eq: ['$type', 'INCOME']
                            }, '$amountBase', 0]
                        }
                    },
                    totalExpenses: {
                        $sum: {
                            $cond: [{
                                $eq: ['$type', 'EXPENSE']
                            }, '$amountBase', 0]
                        }
                    },
                    paidExpenses: {
                        $sum: {
                            $cond: [{
                                    $and: [{
                                        $eq: ['$type', 'EXPENSE']
                                    }, {
                                        $eq: ['$isPaid', true]
                                    }]
                                },
                                '$amountBase',
                                0
                            ]
                        }
                    },
                    unpaidExpenses: {
                        $sum: {
                            $cond: [{
                                    $and: [{
                                        $eq: ['$type', 'EXPENSE']
                                    }, {
                                        $eq: ['$isPaid', false]
                                    }]
                                },
                                '$amountBase',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalIncome: 0,
            totalExpenses: 0,
            paidExpenses: 0,
            unpaidExpenses: 0
        };

        const balance = Number((result.totalIncome - result.totalExpenses).toFixed(2));

        res.status(200).json({
            ...result,
            balance
        });
    } catch (error) {
        console.error('[AnalyticsController] Помилка:', error);
        res.status(500).json({
            message: 'Помилка сервера при отриманні статистики'
        });
    }
};


export const getCategoryBreakdown = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);


        const breakdown = await Category.aggregate([{
                $match: {
                    userId
                }
            },
            {
                $lookup: {
                    from: 'transactions',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'trans'
                }
            },
            {
                $project: {
                    name: 1,
                    type: 1,
                    color: 1,
                    monthlyLimit: 1,
                    spent: {
                        $sum: {
                            $map: {
                                input: '$trans',
                                as: 't',
                                in: '$$t.amountBase'
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json(breakdown);
    } catch (error) {
        console.error('[AnalyticsController] Помилка:', error);
        res.status(500).json({
            message: 'Помилка аналітики категорій'
        });
    }
};