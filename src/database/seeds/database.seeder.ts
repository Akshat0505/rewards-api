import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { Reward, RewardDocument } from '../schemas/reward.schema';

@Injectable()
export class DatabaseSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {}

  async seed() {
    // Clear existing data
    await this.userModel.deleteMany({});
    await this.transactionModel.deleteMany({});
    await this.rewardModel.deleteMany({});

    // Create mock users
    const users = [
      {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      {
        id: 'user456',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
      {
        id: 'user789',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
      },
    ];

    await this.userModel.insertMany(users);

    // Create sample transactions for user123
    const transactions = [
      {
        userId: 'user123',
        amount: 100,
        category: 'shopping',
        pointsEarned: 50,
        timestamp: new Date('2024-01-15'),
      },
      {
        userId: 'user123',
        amount: 200,
        category: 'dining',
        pointsEarned: 100,
        timestamp: new Date('2024-01-20'),
      },
      {
        userId: 'user123',
        amount: 150,
        category: 'travel',
        pointsEarned: 75,
        timestamp: new Date('2024-01-25'),
      },
      {
        userId: 'user123',
        amount: 80,
        category: 'shopping',
        pointsEarned: 40,
        timestamp: new Date('2024-01-30'),
      },
      {
        userId: 'user123',
        amount: 300,
        category: 'entertainment',
        pointsEarned: 150,
        timestamp: new Date('2024-02-01'),
      },
      {
        userId: 'user456',
        amount: 120,
        category: 'shopping',
        pointsEarned: 60,
        timestamp: new Date('2024-01-18'),
      },
      {
        userId: 'user456',
        amount: 90,
        category: 'dining',
        pointsEarned: 45,
        timestamp: new Date('2024-01-22'),
      },
      {
        userId: 'user789',
        amount: 250,
        category: 'travel',
        pointsEarned: 125,
        timestamp: new Date('2024-01-28'),
      },
    ];

    await this.transactionModel.insertMany(transactions);

    // Create reward records with calculated total points
    const rewardData = [
      {
        userId: 'user123',
        totalPoints: 415, // 50 + 100 + 75 + 40 + 150
        updatedAt: new Date(),
      },
      {
        userId: 'user456',
        totalPoints: 105, // 60 + 45
        updatedAt: new Date(),
      },
      {
        userId: 'user789',
        totalPoints: 125, // 125
        updatedAt: new Date(),
      },
    ];

    await this.rewardModel.insertMany(rewardData);

    console.log('Database seeded successfully!');
    console.log('Mock users created:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.id})`);
    });
  }
} 