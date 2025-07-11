import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { Reward, RewardSchema } from '../../database/schemas/reward.schema';
import { Transaction, TransactionSchema } from '../../database/schemas/transaction.schema';
import { Redemption, RedemptionSchema } from '../../database/schemas/redemption.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Redemption.name, schema: RedemptionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {} 