import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from '../../database/schemas/reward.schema';
import { Transaction, TransactionDocument } from '../../database/schemas/transaction.schema';
import { Redemption, RedemptionDocument } from '../../database/schemas/redemption.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { RedeemRewardDto } from '../../common/dto/redeem-reward.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InsufficientPointsException } from '../../common/exceptions/insufficient-points.exception';
import { UserNotFoundException } from '../../common/exceptions/user-not-found.exception';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Redemption.name) private redemptionModel: Model<RedemptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Get user's current points balance + any multipliers
  async getRewardPoints(userId: string): Promise<{ totalPoints: number; multiplier: number }> {
    const user = await this.userModel.findOne({ id: userId });
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const userRewards = await this.rewardModel.findOne({ userId });
    
    // TODO: Move this to a proper user roles system later
    // For now, check email for premium status
    const isPremium = user.email.includes('premium') || user.email.includes('vip');
    const pointMultiplier = isPremium ? 1.5 : 1;
    
    return {
      totalPoints: userRewards ? userRewards.totalPoints : 0,
      multiplier: pointMultiplier,
    };
  }

  // Fetch user's transaction history with pagination
  async getTransactions(userId: string, paginationDto: PaginationDto) {
    const user = await this.userModel.findOne({ id: userId });
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const { page = 1, limit = 5 } = paginationDto;
    const skipCount = (page - 1) * limit;

    const userTransactions = await this.transactionModel
      .find({ userId })
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skipCount)
      .limit(limit)
      .exec();

    const totalTransactions = await this.transactionModel.countDocuments({ userId });

    return {
      transactions: userTransactions,
      pagination: {
        page,
        limit,
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / limit),
      },
    };
  }

  // Handle reward redemption - this is where the magic happens!
  async redeemReward(userId: string, redeemDto: RedeemRewardDto) {
    const user = await this.userModel.findOne({ id: userId });
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    let userReward = await this.rewardModel.findOne({ userId });
    if (!userReward) {
      // Create new reward record if user doesn't have one
      userReward = new this.rewardModel({ userId, totalPoints: 0 });
    }

    // Check if user has enough points
    if (userReward.totalPoints < redeemDto.pointsToRedeem) {
      throw new InsufficientPointsException(redeemDto.pointsToRedeem, userReward.totalPoints);
    }

    // Create redemption record
    const redemptionRecord = await this.redemptionModel.create({
      userId,
      pointsRedeemed: redeemDto.pointsToRedeem,
      rewardType: redeemDto.rewardType,
      timestamp: new Date(),
    });

    // Deduct points from user's account
    userReward.totalPoints -= redeemDto.pointsToRedeem;
    userReward.updatedAt = new Date();

    await userReward.save();

    return {
      message: 'Reward redeemed successfully',
      redemption: {
        id: redemptionRecord._id,
        pointsRedeemed: redemptionRecord.pointsRedeemed,
        rewardType: redemptionRecord.rewardType,
        timestamp: redemptionRecord.timestamp,
        remainingPoints: userReward.totalPoints,
      },
    };
  }

  // Get available reward options - these could be moved to a config file later
  async getRewardOptions() {
    return [
      {
        type: 'cashback',
        name: 'Cashback',
        description: 'Redeem points for cashback to your account',
        pointsRequired: 1000,
        value: 10, // $10 for 1000 points
      },
      {
        type: 'voucher',
        name: 'Gift Voucher',
        description: 'Redeem points for gift vouchers',
        pointsRequired: 500,
        value: 5, // $5 voucher for 500 points
      },
      {
        type: 'gift_card',
        name: 'Gift Card',
        description: 'Redeem points for gift cards from popular retailers',
        pointsRequired: 2000,
        value: 20, // $20 gift card for 2000 points
      },
    ];
  }

  // Helper method to create user (for testing purposes)
  async createUser(id: string, name: string, email: string) {
    const existingUser = await this.userModel.findOne({ id });
    if (existingUser) {
      return { message: 'User already exists', user: existingUser };
    }

    const newUser = await this.userModel.create({
      id,
      name,
      email,
    });

    return {
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  // Add points to user account - useful for testing and admin operations
  async addPoints(userId: string, points: number, category: string, amount: number) {
    const user = await this.userModel.findOne({ id: userId });
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    let userReward = await this.rewardModel.findOne({ userId });
    if (!userReward) {
      userReward = new this.rewardModel({ userId, totalPoints: 0 });
    }

    // Create transaction record
    const newTransaction = await this.transactionModel.create({
      userId,
      amount,
      category,
      pointsEarned: points,
      timestamp: new Date(),
    });

    // Add points to user's balance
    userReward.totalPoints += points;
    userReward.updatedAt = new Date();

    await userReward.save();

    return {
      message: 'Points added successfully',
      transaction: {
        id: newTransaction._id,
        pointsEarned: newTransaction.pointsEarned,
        category: newTransaction.category,
        timestamp: newTransaction.timestamp,
      },
      newBalance: userReward.totalPoints,
    };
  }

  // Admin methods to view database data
  async getAllUsers() {
    const users = await this.userModel.find().exec();
    return {
      count: users.length,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
      })),
    };
  }

  async getAllRewards() {
    const rewards = await this.rewardModel.find().exec();
    return {
      count: rewards.length,
      rewards: rewards.map(reward => ({
        userId: reward.userId,
        totalPoints: reward.totalPoints,
      })),
    };
  }

  async getAllTransactions() {
    const transactions = await this.transactionModel.find().sort({ timestamp: -1 }).exec();
    return {
      count: transactions.length,
      transactions: transactions.map(transaction => ({
        id: transaction._id,
        userId: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        pointsEarned: transaction.pointsEarned,
        timestamp: transaction.timestamp,
      })),
    };
  }

  async getAllRedemptions() {
    const redemptions = await this.redemptionModel.find().sort({ timestamp: -1 }).exec();
    return {
      count: redemptions.length,
      redemptions: redemptions.map(redemption => ({
        id: redemption._id,
        userId: redemption.userId,
        pointsRedeemed: redemption.pointsRedeemed,
        rewardType: redemption.rewardType,
        timestamp: redemption.timestamp,
      })),
    };
  }

  async getDatabaseSummary() {
    const [users, rewards, transactions, redemptions] = await Promise.all([
      this.userModel.countDocuments(),
      this.rewardModel.countDocuments(),
      this.transactionModel.countDocuments(),
      this.redemptionModel.countDocuments(),
    ]);

    const totalPoints = await this.rewardModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);

    const totalPointsRedeemed = await this.redemptionModel.aggregate([
      { $group: { _id: null, total: { $sum: '$pointsRedeemed' } } }
    ]);

    return {
      summary: {
        totalUsers: users,
        totalRewardRecords: rewards,
        totalTransactions: transactions,
        totalRedemptions: redemptions,
        totalPointsInSystem: totalPoints[0]?.total || 0,
        totalPointsRedeemed: totalPointsRedeemed[0]?.total || 0,
        netPointsAvailable: (totalPoints[0]?.total || 0) - (totalPointsRedeemed[0]?.total || 0),
      },
      collections: {
        users: { count: users },
        rewards: { count: rewards },
        transactions: { count: transactions },
        redemptions: { count: redemptions },
      },
    };
  }
} 