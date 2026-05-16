import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SubscriptionService } from '../src/subscription/subscription.service';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function () {
  return this.toString();
};

describe('MoneyTracker E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let subscriptionService: SubscriptionService;

  let authToken: string;
  let userId: string;
  let accountId: string;
  let categoryId: string;
  let secondAccountId: string;

  let premiumToken: string;
  let premiumUserId: string;
  let premiumAccountId: string;
  let premiumCategoryId: string;

  const testUser = {
    email: `e2e-free-${Date.now()}@test.com`,
    password: 'test123456',
    name: 'Test Free User',
    hourlyRate: 1000,
    monthlyHours: 176,
  };

  const premiumUser = {
    email: `e2e-prem-${Date.now()}@test.com`,
    password: 'test123456',
    name: 'Test Premium User',
    hourlyRate: 2000,
    monthlyHours: 176,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          load: [
            () => ({
              DATABASE_URL:
                'postgresql://postgres:password@localhost:5433/money_tracker_test',
              JWT_SECRET: 'test-jwt-secret-e2e',
              DEEPSEEK_API_KEY: 'test-key',
              REDIS_HOST: 'localhost',
              REDIS_PORT: '6379',
            }),
          ],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
    subscriptionService = app.get(SubscriptionService);
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const cleanDb = async () => {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    for (const { tablename } of tables) {
      if (tablename !== '_prisma_migrations') {
        try {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
          );
        } catch (_) {}
      }
    }
  };

  const registerUser = async (userData: typeof testUser) => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    return { token: res.body.token, userId: res.body.user.id };
  };

  const activatePremium = async (uId: string) => {
    await subscriptionService.activatePremium(uId, {
      plan: 'premium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  };

  const getAccounts = async (token: string) => {
    const res = await request(app.getHttpServer())
      .get('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return res.body;
  };

  const getCategories = async (token: string) => {
    const res = await request(app.getHttpServer())
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    return res.body;
  };

  describe('Auth', () => {
    beforeAll(async () => {
      await cleanDb();
      await prisma.exchangeRate.upsert({
        where: { code: 'RUB' },
        update: { rate: 0.011 },
        create: { code: 'RUB', name: 'Russian Ruble', rate: 0.011, type: 'FIAT', popular: true, date: new Date().toISOString().split('T')[0] },
      });
      await prisma.exchangeRate.upsert({
        where: { code: 'USD' },
        update: { rate: 1 },
        create: { code: 'USD', name: 'US Dollar', rate: 1, type: 'FIAT', popular: true, date: new Date().toISOString().split('T')[0] },
      });
    });

    it('POST /auth/register — should register new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.hourlyRate).toBe(testUser.hourlyRate);
      expect(res.body.user.monthlyHours).toBe(testUser.monthlyHours);

      authToken = res.body.token;
      userId = res.body.user.id;
    });

    it('POST /auth/register — creates default accounts', async () => {
      const accounts = await getAccounts(authToken);
      expect(accounts.length).toBeGreaterThanOrEqual(2);
      const names = accounts.map((a: any) => a.name);
      expect(names).toContain('Наличные');
      expect(names).toContain('Банковский счёт');

      accountId = accounts.find((a: any) => a.name === 'Наличные').id;
      secondAccountId = accounts.find(
        (a: any) => a.name === 'Банковский счёт',
      ).id;
    });

    it('POST /auth/register — creates default categories', async () => {
      const categories = await getCategories(authToken);
      expect(categories.length).toBeGreaterThanOrEqual(16);

      const incomeNames = categories
        .filter((c: any) => c.type === 'INCOME')
        .map((c: any) => c.name);
      expect(incomeNames).toContain('Зарплата');

      const expenseNames = categories
        .filter((c: any) => c.type === 'EXPENSE')
        .map((c: any) => c.name);
      expect(expenseNames).toContain('Продукты');

      categoryId = categories.find((c: any) => c.name === 'Зарплата').id;
    });

    it('POST /auth/register — rejects duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('POST /auth/register — validates input', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'bad', password: '1', name: '' })
        .expect(400);
    });

    it('POST /auth/login — should login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('POST /auth/login — rejects wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrong-password' })
        .expect(401);
    });

    it('POST /auth/login — rejects nonexistent email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'no@no.com', password: '123456' })
        .expect(401);
    });

    it('GET /auth/me — returns user data', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe(testUser.email);
    });

    it('GET /auth/me — rejects without token', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('POST /auth/logout — returns success', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('registers premium user for later tests', async () => {
      const { token, userId: uId } = await registerUser(premiumUser);
      premiumToken = token;
      premiumUserId = uId;
      await activatePremium(uId);

      const accounts = await getAccounts(premiumToken);
      premiumAccountId = accounts.find((a: any) => a.name === 'Наличные').id;

      const categories = await getCategories(premiumToken);
      premiumCategoryId = categories.find(
        (c: any) => c.name === 'Зарплата',
      ).id;
    });
  });

  describe('Accounts', () => {
    it('GET /accounts — returns user accounts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /accounts/public — returns available types without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/accounts/public')
        .expect(200);

      expect(res.body.availableTypes).toBeDefined();
      expect(res.body.availableTypes).toContain('CASH');
      expect(res.body.availableTypes).toContain('BANK');
    });

    it('GET /accounts/:id — returns single account', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(accountId);
      expect(res.body.userId).toBe(userId);
    });

    it('GET /accounts/:id — 404 for nonexistent', async () => {
      await request(app.getHttpServer())
        .get('/api/accounts/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('GET /accounts/:id — requires auth', async () => {
      await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .expect(401);
    });

    it('POST /accounts — creates account', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Bank', type: 'BANK', currency: 'USD' })
        .expect(201);

      expect(res.body.name).toBe('Test Bank');
      expect(res.body.type).toBe('BANK');
      expect(res.body.currency).toBe('USD');
      expect(res.body.balance).toBe('0');
    });

    it('POST /accounts — free plan limits account types', async () => {
      await request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Credit', type: 'CREDIT' })
        .expect(403);
    });

    it('POST /accounts — requires auth', async () => {
      await request(app.getHttpServer())
        .post('/api/accounts')
        .send({ name: 'Test', type: 'CASH' })
        .expect(401);
    });

    it('PATCH /accounts/:id — updates account', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'My Cash Updated', balance: 50000 })
        .expect(200);

      expect(res.body.name).toBe('My Cash Updated');
    });

    it('GET /accounts/total-balance — returns balance', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/accounts/total-balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('currency');
    });

    it('DELETE /accounts/:id — requires auth', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: 'ToDelete', type: 'BANK' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/accounts/${createRes.body.id}`)
        .expect(401);

      const verify = await request(app.getHttpServer())
        .get(`/api/accounts/${createRes.body.id}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);
      expect(verify.body.name).toBe('ToDelete');
    });

    it('DELETE /accounts/:id — deletes own account', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/accounts')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: 'ToDelete2', type: 'BANK' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/accounts/${createRes.body.id}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/accounts/${createRes.body.id}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });
  });

  describe('Categories', () => {
    it('GET /categories/icons — returns icon list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories/icons')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });

    it('GET /categories/types — returns account types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories/types')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const values = res.body.map((t: any) => t.value);
      expect(values).toContain('CASH');
      expect(values).toContain('BANK');
    });

    it('GET /categories — returns user categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(16);
    });

    it('POST /categories — creates personal category', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Category',
          type: 'EXPENSE',
          icon: 'material:test',
          color: '#FF0000',
        })
        .expect(201);

      expect(res.body.name).toBe('Test Category');
      expect(res.body.type).toBe('EXPENSE');
      expect(res.body.userId).toBe(userId);
    });

    it('PATCH /categories/:id — updates category', async () => {
      const categories = await getCategories(authToken);
      const personal = categories.find(
        (c: any) => c.name === 'Test Category',
      );

      const res = await request(app.getHttpServer())
        .patch(`/api/categories/${personal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Category Updated', color: '#00FF00' })
        .expect(200);

      expect(res.body.name).toBe('Test Category Updated');
      expect(res.body.color).toBe('#00FF00');
    });

    it('DELETE /categories/:id — deletes personal category', async () => {
      const before = await getCategories(authToken);
      const personal = before.find(
        (c: any) => c.name === 'Test Category Updated',
      );

      await request(app.getHttpServer())
        .delete(`/api/categories/${personal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const after = await getCategories(authToken);
      expect(after.length).toBe(before.length - 1);
    });

    it('DELETE /categories/:id — cannot delete default categories of other user', async () => {
      const categories = await getCategories(authToken);
      const cat = categories[0];

      await request(app.getHttpServer())
        .delete(`/api/categories/${cat.id}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });

    it('POST /categories/defaults — idempotent', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories/defaults')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(res.body.created).toBe(0);
      expect(res.body.skipped).toBe(16);
    });
  });

  describe('Transactions', () => {
    let expenseCategoryId: string;
    let transactionId: string;
    let incomeTransactionId: string;

    beforeAll(async () => {
      const categories = await getCategories(authToken);
      const expenseCat = categories.find(
        (c: any) => c.name === 'Продукты',
      );
      const incomeCat = categories.find((c: any) => c.name === 'Зарплата');
      expenseCategoryId = expenseCat ? expenseCat.id : categoryId;
    });

    it('POST /transactions — creates EXPENSE transaction and updates balance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId,
          categoryId: expenseCategoryId,
          amount: 5000,
          type: 'EXPENSE',
          description: 'Groceries',
        })
        .expect(201);

      expect(res.body.type).toBe('EXPENSE');
      expect(res.body.amount).toBeDefined();
      transactionId = res.body.id;

      const accRes = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Number(accRes.body.balance)).toBe(45000);
    });

    it('POST /transactions — creates INCOME transaction and updates balance', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId,
          categoryId,
          amount: 100000,
          type: 'INCOME',
          description: 'Salary',
        })
        .expect(201);

      expect(res.body.type).toBe('INCOME');
      incomeTransactionId = res.body.id;

      const accRes = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Number(accRes.body.balance)).toBe(145000);
    });

    it('POST /transactions — rejects invalid account', async () => {
      await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId: '00000000-0000-0000-0000-000000000000',
          categoryId: expenseCategoryId,
          amount: 100,
          type: 'EXPENSE',
        })
        .expect(400);
    });

    it('POST /transactions — rejects invalid category', async () => {
      await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId,
          categoryId: '00000000-0000-0000-0000-000000000000',
          amount: 100,
          type: 'EXPENSE',
        })
        .expect(400);
    });

    it('GET /transactions — returns all transactions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /transactions — filters by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/transactions?type=INCOME')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.every((t: any) => t.type === 'INCOME')).toBe(true);
    });

    it('GET /transactions/:id — returns single transaction', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).toBe(transactionId);
      expect(res.body.account).toBeDefined();
      expect(res.body.category).toBeDefined();
    });

    it('PATCH /transactions/:id — updates description', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated groceries' })
        .expect(200);

      expect(res.body.description).toBe('Updated groceries');
    });

    it('DELETE /transactions/:id — deletes and reverts balance', async () => {
      const accBefore = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const balanceBefore = Number(accBefore.body.balance);

      await request(app.getHttpServer())
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const accAfter = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      expect(Number(accAfter.body.balance)).toBe(balanceBefore + 5000);
    });

    it('GET /transactions/summary — returns income/expense summary', async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const res = await request(app.getHttpServer())
        .get(
          `/api/transactions/summary?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('income');
      expect(res.body).toHaveProperty('expenses');
      expect(res.body).toHaveProperty('balance');
      expect(res.body).toHaveProperty('transactionCount');
      expect(res.body.income).toBe(100000);
      expect(res.body.expenses).toBe(0);
    });

    it('GET /transactions/analytics — returns analytics data', async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const res = await request(app.getHttpServer())
        .get(
          `/api/transactions/analytics?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totals');
      expect(res.body).toHaveProperty('byCategory');
      expect(res.body).toHaveProperty('byDay');
      expect(res.body).toHaveProperty('comparison');
      expect(res.body.totals).toHaveProperty('income');
      expect(res.body.totals).toHaveProperty('expense');
    });

    it('POST /transactions/transfer — transfers between accounts', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAccountId: accountId,
          toAccountId: secondAccountId,
          amount: 10000,
          description: 'Test transfer',
        })
        .expect(201);

      expect(res.body.fromTransaction).toBeDefined();
      expect(res.body.toTransaction).toBeDefined();
      expect(res.body.fromTransaction.type).toBe('TRANSFER');
      expect(res.body.toTransaction.type).toBe('TRANSFER');

      const acc1 = await request(app.getHttpServer())
        .get(`/api/accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const acc2 = await request(app.getHttpServer())
        .get(`/api/accounts/${secondAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Number(acc1.body.balance)).toBe(140000);
      expect(Number(acc2.body.balance)).toBe(10000);
    });

    it('POST /transactions/transfer — rejects same account', async () => {
      await request(app.getHttpServer())
        .post('/api/transactions/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fromAccountId: accountId,
          toAccountId: accountId,
          amount: 100,
        })
        .expect(400);
    });
  });

  describe('Users', () => {
    it('GET /users/profile — returns profile with subscription', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.email).toBe(testUser.email);
      expect(res.body).toHaveProperty('plan');
      expect(res.body).toHaveProperty('isPremium');
      expect(res.body.plan).toBe('FREE');
      expect(res.body.isPremium).toBe(false);
    });

    it('PATCH /users/profile — updates name and currency', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name', currency: 'USD' })
        .expect(200);

      expect(res.body.name).toBe('Updated Name');
      expect(res.body.currency).toBe('USD');

      await request(app.getHttpServer())
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currency: 'RUB' })
        .expect(200);
    });

    it('PATCH /users/hourly-rate — sets hourly rate in kopecks', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/users/hourly-rate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hourlyRate: 1500 })
        .expect(200);

      expect(Number(res.body.hourlyRate)).toBe(1500 * 100);
    });

    it('GET /users/profile — premium user has isPremium=true', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(res.body.isPremium).toBe(true);
      expect(res.body.plan).toBe('PREMIUM');
    });
  });

  describe('Life-Cost', () => {
    it('GET /life-cost/rate — returns hourly rate in rubles', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/life-cost/rate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('hourlyRate');
      expect(typeof res.body.hourlyRate).toBe('number');
    });

    it('POST /life-cost/calculate — calculates hours', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/life-cost/calculate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 15000000 })
        .expect(201);

      expect(res.body).toHaveProperty('rubles');
      expect(res.body).toHaveProperty('hours');
      expect(res.body).toHaveProperty('workingDays');
      expect(res.body).toHaveProperty('message');
      expect(res.body.rubles).toBe(150000);
    });

    it('POST /life-cost/simulate — simulates investment', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/life-cost/simulate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 10000000, years: 10 })
        .expect(201);

      expect(res.body).toHaveProperty('initialAmount');
      expect(res.body).toHaveProperty('futureValue');
      expect(res.body).toHaveProperty('profit');
      expect(res.body).toHaveProperty('years');
      expect(res.body.futureValue).toBeGreaterThan(res.body.initialAmount);
    });

    it('GET /life-cost/rate — rejects without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/life-cost/rate')
        .expect(401);
    });
  });

  describe('Wishlist (Premium)', () => {
    let wishItemId: string;

    it('GET /wishlist — free user can access (limit 5)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('all');
    });

    it('POST /wishlist — creates item for premium user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          name: 'New iPhone',
          price: 12000000,
          description: 'I really need it for work',
          cooldownDays: 7,
        })
        .expect(201);

      expect(res.body.name).toBe('New iPhone');
      expect(res.body.status).toBe('PENDING');
      expect(res.body.cooldownEnds).toBeDefined();
      wishItemId = res.body.id;
    });

    it('GET /wishlist — returns items for premium user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('ready');
      expect(res.body).toHaveProperty('pending');
      expect(res.body).toHaveProperty('history');
      expect(res.body).toHaveProperty('all');
      expect(res.body.all.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /wishlist/:id/reject — rejects item with compound interest', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/wishlist/${wishItemId}/reject`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(201);

      expect(res.body.item.status).toBe('REJECTED');
      expect(res.body.futureValue).toBeGreaterThan(0);
      expect(res.body.message).toBeDefined();
    });

    it('POST /wishlist/:id/reject — rejects already decided item', async () => {
      await request(app.getHttpServer())
        .post(`/api/wishlist/${wishItemId}/reject`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(400);
    });

    it('full reject-purchase flow', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          name: 'MacBook',
          price: 20000000,
          description: 'For development work',
        })
        .expect(201);

      const purchaseRes = await request(app.getHttpServer())
        .post(`/api/wishlist/${createRes.body.id}/purchase`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(201);

      expect(purchaseRes.body.item.status).toBe('PURCHASED');
      expect(purchaseRes.body.message).toContain('MacBook');
    });

    it('POST /wishlist/:id/snooze — extends cooldown', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({
          name: 'PlayStation',
          price: 5000000,
          description: 'Maybe for gaming',
        })
        .expect(201);

      const snoozeRes = await request(app.getHttpServer())
        .post(`/api/wishlist/${createRes.body.id}/snooze`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(201);

      expect(snoozeRes.body.success).toBe(true);
    });
  });

  describe('Goals (Premium)', () => {
    let goalId: string;

    it('GET /goals — free user gets 403', async () => {
      await request(app.getHttpServer())
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('POST /goals — creates goal for premium user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/goals')
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: 'Emergency Fund', targetAmount: 50000000 })
        .expect(201);

      expect(res.body.name).toBe('Emergency Fund');
      expect(res.body.targetAmount).toBeDefined();
      expect(res.body.percentComplete).toBe(0);
      expect(res.body.isCompleted).toBe(false);
      goalId = res.body.id;
    });

    it('GET /goals — returns goals for premium user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/goals')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /goals/:id — returns single goal', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(res.body.id).toBe(goalId);
    });

    it('PATCH /goals/:id — updates goal', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ name: 'Emergency Fund Updated', targetAmount: 100000000 })
        .expect(200);

      expect(res.body.name).toBe('Emergency Fund Updated');
    });

    it('POST /goals/:id/contribution — adds contribution', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/goals/${goalId}/contribution`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ amount: 25000000, note: 'First deposit' })
        .expect(201);

      expect(res.body.percentComplete).toBe(25);
      expect(res.body.isCompleted).toBe(false);
    });

    it('POST /goals/:id/contribution — completes goal', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/goals/${goalId}/contribution`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .send({ amount: 75000000, note: 'Final deposit' })
        .expect(201);

      expect(res.body.isCompleted).toBe(true);
    });

    it('DELETE /goals/:id — deletes goal', async () => {
      await request(app.getHttpServer())
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(404);
    });
  });

  describe('Subscription', () => {
    it('GET /subscription/status — returns full status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/subscription/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('plan');
      expect(res.body).toHaveProperty('isPremium');
      expect(res.body).toHaveProperty('features');
      expect(res.body).toHaveProperty('allowedAccountTypes');
      expect(res.body).toHaveProperty('accountLimit');
      expect(res.body.plan).toBe('free');
      expect(res.body.isPremium).toBe(false);
      expect(res.body.accountLimit).toBe(3);
      expect(res.body.allowedAccountTypes).toEqual(['CASH', 'BANK']);
    });

    it('GET /subscription/account-types — returns types', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/subscription/account-types')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('types');
      expect(res.body).toHaveProperty('limit');
      expect(res.body.types).toContain('CASH');
    });

    it('POST /subscription/toggle — cycles plans', async () => {
      const toggle1 = await request(app.getHttpServer())
        .post('/api/subscription/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
      expect(toggle1.body.plan).toBe('premium');

      const toggle2 = await request(app.getHttpServer())
        .post('/api/subscription/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
      expect(toggle2.body.plan).toBe('premium_family');

      const toggle3 = await request(app.getHttpServer())
        .post('/api/subscription/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
      expect(toggle3.body.plan).toBe('free');
    });

    it('POST /subscription/activate — activates premium', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/subscription/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          plan: 'premium',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      expect(res.body.plan).toBe('PREMIUM');
    });

    it('POST /subscription/cancel — marks as cancelled', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/subscription/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(res.body.cancelledAt).toBeDefined();
    });
  });

  describe('Full User Flow', () => {
    let flowToken: string;
    let flowUserId: string;
    let flowAccountId: string;
    let flowExpenseCatId: string;
    let flowIncomeCatId: string;

    it('Step 1: Register', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `flow-${Date.now()}@test.com`,
          password: 'flowtest123',
          name: 'Flow User',
          hourlyRate: 500,
          monthlyHours: 176,
        })
        .expect(201);

      flowToken = res.body.token;
      flowUserId = res.body.user.id;
    });

    it('Step 2: Verify default accounts', async () => {
      const accounts = await getAccounts(flowToken);
      expect(accounts.length).toBe(2);
      flowAccountId = accounts[0].id;
    });

    it('Step 3: Verify default categories', async () => {
      const cats = await getCategories(flowToken);
      expect(cats.length).toBeGreaterThanOrEqual(16);
      flowIncomeCatId = cats.find((c: any) => c.name === 'Зарплата').id;
      flowExpenseCatId = cats.find((c: any) => c.name === 'Продукты').id;
    });

    it('Step 4: Set hourly rate', async () => {
      await request(app.getHttpServer())
        .patch('/api/users/hourly-rate')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({ hourlyRate: 500 })
        .expect(200);
    });

    it('Step 5: Calculate life cost', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/life-cost/calculate')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({ amount: 5000000 })
        .expect(201);

      expect(res.body.hours).toBeCloseTo(100, 0);
    });

    it('Step 6: Add income', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({
          accountId: flowAccountId,
          categoryId: flowIncomeCatId,
          amount: 10000000,
          type: 'INCOME',
          description: 'Salary',
        })
        .expect(201);

      expect(res.body.type).toBe('INCOME');
    });

    it('Step 7: Add expense', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/transactions')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({
          accountId: flowAccountId,
          categoryId: flowExpenseCatId,
          amount: 300000,
          type: 'EXPENSE',
          description: 'Bread and milk',
        })
        .expect(201);

      expect(res.body.type).toBe('EXPENSE');
    });

    it('Step 8: Check summary', async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const res = await request(app.getHttpServer())
        .get(
          `/api/transactions/summary?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        )
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(200);

      expect(res.body.income).toBe(10000000);
      expect(res.body.expenses).toBe(300000);
      expect(res.body.balance).toBe(9700000);
    });

    it('Step 9: Check account balance reflects transactions', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/accounts/${flowAccountId}`)
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(200);

      expect(Number(res.body.balance)).toBe(9700000);
    });

    it('Step 10: Toggle to premium', async () => {
      await request(app.getHttpServer())
        .post('/api/subscription/toggle')
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(201);

      const profile = await request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(200);

      expect(profile.body.plan).toBe('PREMIUM');
    });

    it('Step 11: Create goal and add contributions', async () => {
      const goal = await request(app.getHttpServer())
        .post('/api/goals')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({ name: 'Vacation', targetAmount: 20000000 })
        .expect(201);

      const contrib = await request(app.getHttpServer())
        .post(`/api/goals/${goal.body.id}/contribution`)
        .set('Authorization', `Bearer ${flowToken}`)
        .send({ amount: 5000000, note: 'First savings' })
        .expect(201);

      expect(contrib.body.percentComplete).toBe(25);
    });

    it('Step 12: Add wishlist item', async () => {
      const wish = await request(app.getHttpServer())
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${flowToken}`)
        .send({
          name: 'New Headphones',
          price: 3000000,
          description: 'For better focus at work',
        })
        .expect(201);

      expect(wish.body.name).toBe('New Headphones');
      expect(wish.body.status).toBe('PENDING');

      const reject = await request(app.getHttpServer())
        .post(`/api/wishlist/${wish.body.id}/reject`)
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(201);

      expect(reject.body.futureValue).toBeGreaterThan(0);
    });

    it('Step 13: Logout', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${flowToken}`)
        .expect(201);
    });
  });
});
