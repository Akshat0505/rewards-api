# Customization Examples - Demonstrating Code Understanding

## 1. Add New Features

### Add Point Expiration
```typescript
// In reward.schema.ts
@Prop({ default: null })
expiresAt: Date;

// In rewards.service.ts
async getRewardPoints(userId: string): Promise<{ totalPoints: number; expiringPoints: number }> {
  // Add logic to check for expiring points
  const expiringPoints = await this.rewardModel.aggregate([
    { $match: { userId, expiresAt: { $lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: null, total: { $sum: '$totalPoints' } } }
  ]);
  
  return {
    totalPoints: reward ? reward.totalPoints : 0,
    expiringPoints: expiringPoints[0]?.total || 0
  };
}
```

### Add User Roles
```typescript
// In user.schema.ts
@Prop({ default: 'user', enum: ['user', 'admin', 'premium'] })
role: string;

// In rewards.service.ts
async getRewardPoints(userId: string): Promise<{ totalPoints: number; multiplier: number }> {
  const user = await this.userModel.findOne({ id: userId });
  const multiplier = user.role === 'premium' ? 1.5 : 1;
  
  return {
    totalPoints: reward ? reward.totalPoints : 0,
    multiplier
  };
}
```

## 2. Improve Error Handling

### Add Custom Error Codes
```typescript
// In custom-exceptions.ts
export class InsufficientPointsException extends HttpException {
  constructor(requiredPoints: number, availablePoints: number) {
    super(
      {
        message: 'Insufficient points for redemption',
        error: 'INSUFFICIENT_POINTS',
        errorCode: 'REWARDS_001',
        requiredPoints,
        availablePoints,
        suggestions: ['Earn more points', 'Choose a different reward']
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
```

## 3. Add Business Logic

### Point Calculation Rules
```typescript
// In rewards.service.ts
private calculatePoints(amount: number, category: string, userRole: string): number {
  const baseRate = {
    shopping: 0.1,
    dining: 0.15,
    travel: 0.2,
    entertainment: 0.12
  };
  
  const roleMultiplier = {
    user: 1,
    premium: 1.5,
    admin: 2
  };
  
  return Math.floor(amount * baseRate[category] * roleMultiplier[userRole]);
}
```

## 4. Add Caching

### Redis Integration
```typescript
// In rewards.service.ts
@Inject('REDIS_CLIENT')
private redisClient: Redis;

async getRewardPoints(userId: string): Promise<{ totalPoints: number }> {
  // Check cache first
  const cached = await this.redisClient.get(`points:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Get from database
  const result = await this.getPointsFromDB(userId);
  
  // Cache for 5 minutes
  await this.redisClient.setex(`points:${userId}`, 300, JSON.stringify(result));
  
  return result;
}
```

## 5. Add WebSocket Support

### Real-time Updates
```typescript
// In rewards.gateway.ts
@WebSocketGateway()
export class RewardsGateway {
  @SubscribeMessage('subscribePoints')
  handleSubscribePoints(client: Socket, userId: string) {
    client.join(`points:${userId}`);
  }
  
  @SubscribeMessage('redeemPoints')
  async handleRedeemPoints(client: Socket, payload: { userId: string, points: number }) {
    const result = await this.rewardsService.redeemReward(payload.userId, payload);
    this.server.to(`points:${payload.userId}`).emit('pointsUpdated', result);
  }
}
```

## 6. Add Advanced Analytics

### Time-based Analytics
```typescript
// In analytics.service.ts
async getPointsTrend(userId: string, period: 'week' | 'month' | 'year') {
  const startDate = this.getStartDate(period);
  
  return await this.transactionModel.aggregate([
    { $match: { userId, timestamp: { $gte: startDate } } },
    { $group: { 
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      dailyPoints: { $sum: "$pointsEarned" }
    }},
    { $sort: { _id: 1 } }
  ]);
}
```

## 7. Add Security Features

### Rate Limiting
```typescript
// In rewards.controller.ts
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
@Post('redeem/:userId')
async redeemReward(@Param('userId') userId: string, @Body() redeemDto: RedeemRewardDto) {
  return this.rewardsService.redeemReward(userId, redeemDto);
}
```

## 8. Add Validation Enhancements

### Custom Validators
```typescript
// In redeem-reward.dto.ts
export class RedeemRewardDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['cashback', 'voucher', 'gift_card'])
  rewardType: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  @ValidateIf((o) => o.rewardType === 'cashback')
  @IsDivisibleBy(100)
  pointsToRedeem: number;
}
```

## 9. Add Testing Improvements

### Integration Tests
```typescript
// In rewards.e2e-spec.ts
describe('Rewards (e2e)', () => {
  it('/rewards/points/:userId (GET)', () => {
    return request(app.getHttpServer())
      .get('/rewards/points/user123')
      .expect(200)
      .expect((res) => {
        expect(res.body.totalPoints).toBeDefined();
        expect(typeof res.body.totalPoints).toBe('number');
      });
  });
});
```

## 10. Add Documentation

### Enhanced Swagger
```typescript
// In rewards.controller.ts
@ApiOperation({ 
  summary: 'Get total reward points for a user',
  description: 'Retrieves the current total reward points for a specific user. Returns 0 if user has no points.',
  tags: ['rewards']
})
@ApiParam({ 
  name: 'userId', 
  description: 'Unique identifier for the user',
  example: 'user123',
  required: true
})
@ApiResponse({
  status: 200,
  description: 'Successfully retrieved user points',
  schema: {
    type: 'object',
    properties: {
      totalPoints: {
        type: 'number',
        example: 1500,
        description: 'Total reward points available'
      }
    }
  }
})
@ApiResponse({
  status: 404,
  description: 'User not found',
  schema: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'User with ID user123 not found' },
      error: { type: 'string', example: 'User Not Found' }
    }
  }
})
```

## How to Demonstrate Understanding

1. **Explain Architecture**: "I chose NestJS for its modular architecture and dependency injection..."
2. **Discuss Trade-offs**: "I used MongoDB for flexibility with document structure..."
3. **Show Customization**: "I can easily add new reward types by modifying the getRewardOptions method..."
4. **Explain Patterns**: "I implemented the Repository pattern with Mongoose models..."
5. **Discuss Scalability**: "The modular structure allows easy addition of new features..."

## Key Points to Emphasize

- **Understanding of NestJS patterns** (Modules, Services, Controllers)
- **MongoDB/Mongoose knowledge** (Schemas, Aggregations, Indexes)
- **API design principles** (REST, Validation, Error Handling)
- **Testing strategies** (Unit tests, Integration tests)
- **Documentation practices** (Swagger, README)
- **Code organization** (DTOs, Exceptions, Common modules) 