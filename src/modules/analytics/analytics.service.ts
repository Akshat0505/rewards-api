import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../../database/schemas/transaction.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
  ) {}

  async getRewardsDistribution() {
    const distribution = await this.transactionModel.aggregate([
      {
        $group: {
          _id: '$category',
          totalPoints: { $sum: '$pointsEarned' },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          totalPoints: 1,
          totalAmount: 1,
          transactionCount: 1,
          averagePointsPerTransaction: {
            $divide: ['$totalPoints', '$transactionCount'],
          },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
    ]);

    const totalPoints = distribution.reduce((sum, item) => sum + item.totalPoints, 0);
    const totalTransactions = distribution.reduce((sum, item) => sum + item.transactionCount, 0);

    return {
      distribution,
      summary: {
        totalPoints,
        totalTransactions,
        categories: distribution.length,
      },
    };
  }
} 