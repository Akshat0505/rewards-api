import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('rewards-distribution')
  @ApiOperation({ summary: 'Get rewards distribution by category' })
  @ApiResponse({
    status: 200,
    description: 'Returns rewards distribution aggregated by category',
    schema: {
      type: 'object',
      properties: {
        distribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              totalPoints: { type: 'number' },
              totalAmount: { type: 'number' },
              transactionCount: { type: 'number' },
              averagePointsPerTransaction: { type: 'number' },
            },
          },
        },
        summary: {
          type: 'object',
          properties: {
            totalPoints: { type: 'number' },
            totalTransactions: { type: 'number' },
            categories: { type: 'number' },
          },
        },
      },
    },
  })
  async getRewardsDistribution() {
    return this.analyticsService.getRewardsDistribution();
  }
} 