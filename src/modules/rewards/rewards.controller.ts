import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { RedeemRewardDto } from '../../common/dto/redeem-reward.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // Get user's current points balance
  @Get('points/:userId')
  @ApiOperation({ summary: 'Get total reward points for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: 'Returns the total reward points for the user',
    schema: {
      type: 'object',
      properties: {
        totalPoints: {
          type: 'number',
          example: 1500,
        },
        multiplier: {
          type: 'number',
          example: 1.5,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getRewardPoints(@Param('userId') userId: string) {
    return this.rewardsService.getRewardPoints(userId);
  }

  // Get user's transaction history
  @Get('transactions/:userId')
  @ApiOperation({ summary: 'Get user transactions with pagination' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated transactions for the user',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              userId: { type: 'string' },
              amount: { type: 'number' },
              category: { type: 'string' },
              pointsEarned: { type: 'number' },
              timestamp: { type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getTransactions(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.rewardsService.getTransactions(userId, paginationDto);
  }

  // Redeem points for rewards
  @Post('redeem/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem reward points for a specific option' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pointsToRedeem: { type: 'number', example: 200 },
        rewardType: { type: 'string', example: 'voucher' },
      },
      required: ['pointsToRedeem', 'rewardType'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reward redeemed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        redemption: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            pointsRedeemed: { type: 'number' },
            rewardType: { type: 'string' },
            timestamp: { type: 'string' },
            remainingPoints: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient points or invalid request',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async redeemReward(
    @Param('userId') userId: string,
    @Body() redeemDto: RedeemRewardDto,
  ) {
    return this.rewardsService.redeemReward(userId, redeemDto);
  }

  // Get available reward options
  @Get('options')
  @ApiOperation({ summary: 'Get available reward options' })
  @ApiResponse({
    status: 200,
    description: 'Returns available reward options',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          pointsRequired: { type: 'number' },
          value: { type: 'number' },
        },
      },
    },
  })
  async getRewardOptions() {
    return this.rewardsService.getRewardOptions();
  }

  // Helper endpoint for testing/seeding (not part of requirements but useful)
  @Post('add-points/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add points to user account (for testing)' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        points: { type: 'number', example: 100 },
        category: { type: 'string', example: 'shopping' },
        amount: { type: 'number', example: 50.0 },
      },
      required: ['points', 'category', 'amount'],
    },
  })
  async addPoints(
    @Param('userId') userId: string,
    @Body() body: { points: number; category: string; amount: number },
  ) {
    // Validate request body
    if (!body || !body.points || !body.category || !body.amount) {
      throw new BadRequestException('Missing required fields: points, category, amount');
    }
    
    return this.rewardsService.addPoints(
      userId,
      body.points,
      body.category,
      body.amount,
    );
  }

  // Helper endpoint for creating users (for testing)
  @Post('create-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new user (for testing)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'user123' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
      },
      required: ['id', 'name', 'email'],
    },
  })
  async createUser(
    @Body() body: { id: string; name: string; email: string },
  ) {
    // Validate request body
    if (!body || !body.id || !body.name || !body.email) {
      throw new BadRequestException('Missing required fields: id, name, email');
    }
    
    return this.rewardsService.createUser(body.id, body.name, body.email);
  }

  // Admin endpoints to view database data
  @Get('admin/users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all users in the database',
  })
  async getAllUsers() {
    return this.rewardsService.getAllUsers();
  }

  @Get('admin/rewards')
  @ApiOperation({ summary: 'Get all reward records (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all reward records in the database',
  })
  async getAllRewards() {
    return this.rewardsService.getAllRewards();
  }

  @Get('admin/transactions')
  @ApiOperation({ summary: 'Get all transactions (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all transactions in the database',
  })
  async getAllTransactions() {
    return this.rewardsService.getAllTransactions();
  }

  @Get('admin/redemptions')
  @ApiOperation({ summary: 'Get all redemptions (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all redemptions in the database',
  })
  async getAllRedemptions() {
    return this.rewardsService.getAllRedemptions();
  }

  @Get('admin/database-summary')
  @ApiOperation({ summary: 'Get database summary (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Returns summary of all collections',
  })
  async getDatabaseSummary() {
    return this.rewardsService.getDatabaseSummary();
  }
} 