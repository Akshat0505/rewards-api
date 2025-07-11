import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemRewardDto {
  @ApiProperty({
    description: 'The type of reward to redeem',
    example: 'cashback',
    enum: ['cashback', 'voucher', 'gift_card']
  })
  @IsString()
  @IsNotEmpty()
  rewardType: string;

  @ApiProperty({
    description: 'Number of points to redeem',
    example: 1000,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  pointsToRedeem: number;
} 