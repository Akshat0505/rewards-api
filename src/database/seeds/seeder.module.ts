import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeeder } from './database.seeder';
import { User, UserSchema } from '../schemas/user.schema';
import { Transaction, TransactionSchema } from '../schemas/transaction.schema';
import { Reward, RewardSchema } from '../schemas/reward.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Reward.name, schema: RewardSchema },
    ]),
  ],
  providers: [DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeederModule {} 