import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RewardsService } from './rewards.service';
import { Reward } from '../../database/schemas/reward.schema';
import { Transaction } from '../../database/schemas/transaction.schema';
import { Redemption } from '../../database/schemas/redemption.schema';
import { User } from '../../database/schemas/user.schema';
import { InsufficientPointsException } from '../../common/exceptions/insufficient-points.exception';
import { UserNotFoundException } from '../../common/exceptions/user-not-found.exception';

describe('RewardsService', () => {
  let service: RewardsService;
  let mockRewardModel: any;
  let mockTransactionModel: any;
  let mockRedemptionModel: any;
  let mockUserModel: any;

  beforeEach(async () => {
    mockRewardModel = {
      findOne: jest.fn(),
      countDocuments: jest.fn(),
    };
    mockTransactionModel = {
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    mockRedemptionModel = {
      new: jest.fn(),
    };
    mockUserModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        {
          provide: getModelToken(Reward.name),
          useValue: mockRewardModel,
        },
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: getModelToken(Redemption.name),
          useValue: mockRedemptionModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRewardPoints', () => {
    it('should return total points for existing user with rewards', async () => {
      const userId = 'user123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const mockReward = { userId, totalPoints: 1500 };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockRewardModel.findOne.mockResolvedValue(mockReward);

      const result = await service.getRewardPoints(userId);

      expect(result).toEqual({ totalPoints: 1500 });
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(mockRewardModel.findOne).toHaveBeenCalledWith({ userId });
    });

    it('should return 0 points for existing user without rewards', async () => {
      const userId = 'user123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockRewardModel.findOne.mockResolvedValue(null);

      const result = await service.getRewardPoints(userId);

      expect(result).toEqual({ totalPoints: 0 });
    });

    it('should throw UserNotFoundException for non-existing user', async () => {
      const userId = 'nonexistent';

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.getRewardPoints(userId)).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions for existing user', async () => {
      const userId = 'user123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const mockTransactions = [
        { _id: '1', userId, amount: 100, category: 'shopping', pointsEarned: 50 },
        { _id: '2', userId, amount: 200, category: 'dining', pointsEarned: 100 },
      ];

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockTransactionModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockTransactions),
            }),
          }),
        }),
      });
      mockTransactionModel.countDocuments.mockResolvedValue(2);

      const result = await service.getTransactions(userId, { page: 1, limit: 5 });

      expect(result.transactions).toEqual(mockTransactions);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 2,
        pages: 1,
      });
    });

    it('should throw UserNotFoundException for non-existing user', async () => {
      const userId = 'nonexistent';

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.getTransactions(userId, { page: 1, limit: 5 })).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('redeemReward', () => {
    it('should successfully redeem reward when user has sufficient points', async () => {
      const userId = 'user123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const mockReward = { userId, totalPoints: 1500, save: jest.fn() };
      const mockRedemption = {
        _id: 'redemption123',
        userId,
        pointsRedeemed: 500,
        rewardType: 'cashback',
        timestamp: new Date(),
        save: jest.fn(),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockRewardModel.findOne.mockResolvedValue(mockReward);
      mockRedemptionModel.new.mockReturnValue(mockRedemption);

      const redeemDto = { rewardType: 'cashback', pointsToRedeem: 500 };

      const result = await service.redeemReward(userId, redeemDto);

      expect(result.message).toBe('Reward redeemed successfully');
      expect(result.redemption.pointsRedeemed).toBe(500);
      expect(result.redemption.rewardType).toBe('cashback');
      expect(mockReward.save).toHaveBeenCalled();
      expect(mockRedemption.save).toHaveBeenCalled();
    });

    it('should throw InsufficientPointsException when user has insufficient points', async () => {
      const userId = 'user123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const mockReward = { userId, totalPoints: 100 };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockRewardModel.findOne.mockResolvedValue(mockReward);

      const redeemDto = { rewardType: 'cashback', pointsToRedeem: 500 };

      await expect(service.redeemReward(userId, redeemDto)).rejects.toThrow(InsufficientPointsException);
    });

    it('should create new reward record if user does not have one', async () => {
      const userId = 'user123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const mockReward = { userId, totalPoints: 0, save: jest.fn() };
      const mockRedemption = {
        _id: 'redemption123',
        userId,
        pointsRedeemed: 100,
        rewardType: 'voucher',
        timestamp: new Date(),
        save: jest.fn(),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockRewardModel.findOne.mockResolvedValue(null);
      mockRewardModel.new.mockReturnValue(mockReward);
      mockRedemptionModel.new.mockReturnValue(mockRedemption);

      const redeemDto = { rewardType: 'voucher', pointsToRedeem: 100 };

      const result = await service.redeemReward(userId, redeemDto);

      expect(result.message).toBe('Reward redeemed successfully');
      expect(mockRewardModel.new).toHaveBeenCalledWith({ userId, totalPoints: 0 });
    });
  });

  describe('getRewardOptions', () => {
    it('should return available reward options', async () => {
      const result = await service.getRewardOptions();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        type: 'cashback',
        name: 'Cashback',
        description: 'Redeem points for cashback to your account',
        pointsRequired: 1000,
        value: 10,
      });
    });
  });
}); 