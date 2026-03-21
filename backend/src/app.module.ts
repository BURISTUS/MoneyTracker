import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { AccountsModule } from './accounts/accounts.module';
import { BudgetModule } from './budget/budget.module';
import { GoalsModule } from './goals/goals.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { GamificationModule } from './gamification/gamification.module';
import { LifeCostModule } from './life-cost/life-cost.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    AccountsModule,
    BudgetModule,
    GoalsModule,
    WishlistModule,
    GamificationModule,
    LifeCostModule,
  ],
})
export class AppModule {}
