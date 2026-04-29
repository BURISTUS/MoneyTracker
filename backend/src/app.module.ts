import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { I18nModule, AcceptLanguageResolver, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';
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
import { LifeCostModule } from './life-cost/life-cost.module';
import { CurrencyModule } from './currency/currency.module';
import { I18nApiModule } from './i18n-controller/i18n-api.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: process.env.NODE_ENV === 'development',
      },
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['Accept-Language']),
        AcceptLanguageResolver,
      ],
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
    LifeCostModule,
    CurrencyModule,
    I18nApiModule,
    ChatModule,
  ],
})
export class AppModule {}
