import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeederModule } from './database/seeds/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/rewards'),
    RewardsModule,
    AnalyticsModule,
    SeederModule,
  ],
})
export class AppModule {} 