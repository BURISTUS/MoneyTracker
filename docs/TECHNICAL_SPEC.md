# Техническое задание - Money Tracker "Escape from Consumer Society"

## 1. Общее описание

Финансовый трекер с геймификацией для борьбы с импульсивными покупками. Концепция "Побег из общества потребления" - пользователь начинает как "Потребитель" и достигает статуса "Архитектор".

**Стек:**
- Backend: NestJS + Prisma + PostgreSQL + Redis
- Mobile: Expo + React Native + Tamagui
- Monorepo: Turborepo

---

## 2. Статус реализации

### ✅ Завершено

#### 2.1 Инфраструктура
- [x] Структура backend проекта
- [x] package.json с зависимостями
- [x] tsconfig.json
- [x] nest-cli.json
- [x] Docker-compose.yml (PostgreSQL + Redis)
- [x] .env.example

#### 2.2 Prisma Schema (18 моделей)
- [x] User, Session
- [x] Account, Transaction, Category
- [x] Budget, Goal
- [x] UserGamification, Achievement, UserAchievement
- [x] WishlistItem (Инкубатор желаний)
- [x] Challenge, UserChallenge
- [x] Family, FamilyMember
- [x] Notification

#### 2.3 Core Modules
- [x] PrismaModule + PrismaService
- [x] RedisModule + RedisService
- [x] AuthModule (JWT, register, login, guards)
- [x] UsersModule (profile, hourly rate)
- [x] AccountsModule (CRUD)
- [x] CategoriesModule (CRUD)
- [x] TransactionsModule (CRUD + summary)

#### 2.4 Gamification Modules
- [x] BudgetModule (progress tracking)
- [x] GoalsModule (progress tracking)
- [x] GamificationModule (XP, levels, status)
- [x] WishlistModule (7-day timer, REJECTED/PURCHASED logic)
- [x] ChallengesModule (join challenges)
- [x] LifeCostModule (hourly rate, time converter)
- [x] FamilyModule (shared budget)
- [x] AchievementsModule (seed + tracking)
- [x] NotificationsModule (wishlist ready, level up, etc.)

#### 2.5 Financial Forecast Module (МОДУЛЬНАЯ АРХИТЕКТУРА)
- [x] Prisma models: Deposit, DepositTransaction, Loan, LoanPayment, SavingsGoal, ForecastScenario
- [x] DepositsModule (CRUD + projections with compound interest)
- [x] LoansModule (CRUD + amortization schedule + early payoff)
- [x] SavingsGoalsModule (goals with projections)
- [x] ForecastsModule (scenarios + quick summary)
- [x] FinancialSummaryCard for dashboard

---

### ⏳ В процессе

- [ ] Установка npm зависимостей
- [ ] Генерация Prisma client
- [ ] Запуск Docker containers
- [ ] Миграция БД
- [ ] Тестирование сервера

---

### ❌ Не начато

#### Mobile (Expo + React Native + Tamagui)
- [ ] Настройка Expo проекта
- [ ] Настройка Tamagui темы
- [ ] Навигация (Expo Router)
- [ ] Экран дашборда
- [ ] Экран транзакций
- [ ] Экран "Инкубатора" с таймерами
- [ ] Экран "Цена жизни" конвертера
- [ ] Экран достижений и прогресса
- [ ] Интеграция Lottie анимаций
- [ ] Push notifications (Expo)

#### Financial Forecast - ✅ ЗАВЕРШЕНО (Модульная архитектура)
- [x] Добавить модели в Prisma: Deposit, DepositTransaction, Loan, LoanPayment, SavingsGoal, ForecastScenario
- [x] Создать DepositsModule (deposit CRUD + проекции)
- [x] Создать LoansModule (loan CRUD + график платежей)
- [x] Создать SavingsGoalsModule (цели накоплений)
- [x] Создать ForecastsModule (сценарии прогнозов)
- [x] Создать FinancialSummaryCard для дашборда

#### Тестирование и качество
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation (Swagger уже настроен)
- [ ] CI/CD pipeline

---

## 3. API Endpoints

### Authentication
```
POST   /api/auth/register     ✅ Создан
POST   /api/auth/login        ✅ Создан
GET    /api/auth/me           ✅ Создан
```

### Users
```
GET    /api/users/profile     ✅ Создан
PATCH  /api/users/profile     ✅ Создан
PATCH  /api/users/hourly-rate ✅ Создан
```

### Accounts
```
GET    /api/accounts          ✅ Создан
POST   /api/accounts          ✅ Создан
GET    /api/accounts/:id      ✅ Создан
PATCH  /api/accounts/:id      ✅ Создан
DELETE /api/accounts/:id      ✅ Создан
```

### Categories
```
GET    /api/categories        ✅ Создан
POST   /api/categories        ✅ Создан
PATCH  /api/categories/:id    ✅ Создан
DELETE /api/categories/:id    ✅ Создан
```

### Transactions
```
GET    /api/transactions      ✅ Создан
POST   /api/transactions      ✅ Создан
GET    /api/transactions/:id  ✅ Создан
PATCH  /api/transactions/:id  ✅ Создан
DELETE /api/transactions/:id  ✅ Создан
GET    /api/transactions/summary ✅ Создан
```

### Budgets
```
GET    /api/budgets           ✅ Создан
POST   /api/budgets           ✅ Создан
GET    /api/budgets/:id/progress ✅ Создан
DELETE /api/budgets/:id       ✅ Создан
```

### Goals
```
GET    /api/goals             ✅ Создан
POST   /api/goals             ✅ Создан
PATCH  /api/goals/:id         ✅ Создан
DELETE /api/goals/:id         ✅ Создан
```

### Gamification
```
GET    /api/gamification/profile ✅ Создан
GET    /api/gamification/levels  ✅ Создан
```

### Achievements
```
GET    /api/achievements      ✅ Создан
GET    /api/achievements/earned ✅ Создан
GET    /api/achievements/available ✅ Создан
```

### Wishlist (Кладбище импульсов)
```
GET    /api/wishlist          ✅ Создан
POST   /api/wishlist          ✅ Создан
POST   /api/wishlist/:id/reject ✅ Создан
POST   /api/wishlist/:id/purchase ✅ Создан
POST   /api/wishlist/:id/snooze ✅ Создан
```

### Life Cost (Цена жизни)
```
GET    /api/life-cost/rate    ✅ Создан
POST   /api/life-cost/calculate ✅ Создан
POST   /api/life-cost/simulate ✅ Создан
```

### Challenges
```
GET    /api/challenges        ✅ Создан
GET    /api/challenges/my     ✅ Создан
GET    /api/challenges/:id/status ✅ Создан
POST   /api/challenges/:id/join ✅ Создан
```

### Family
```
POST   /api/family            ✅ Создан
POST   /api/family/join       ✅ Создан
GET    /api/family            ✅ Создан
GET    /api/family/members    ✅ Создан
GET    /api/family/budget     ✅ Создан
```

### Financial Forecast (Вклады, кредиты, прогнозы) - НОВЫЙ
См. docs/FINANCIAL_FORECAST.md

```
# Deposits (Вклады)
GET    /api/deposits                          # Все вклады
POST   /api/deposits                          # Создать вклад
GET    /api/deposits/:id                      # Один вклад
GET    /api/deposits/:id/projection           # Проекция роста
POST   /api/deposits/:id/deposit              # Пополнить
POST   /api/deposits/:id/withdraw             # Снять

# Loans (Кредиты)
GET    /api/loans                             # Все кредиты
POST   /api/loans                             # Создать кредит
GET    /api/loans/:id/schedule                # График платежей
POST   /api/loans/:id/pay                     # Внести платеж
POST   /api/loans/calculate                   # Калькулятор платежа
POST   /api/loans/:id/early-payoff            # Расчет досрочного погашения

# Savings Goals (Цели накоплений)
GET    /api/savings-goals                     # Все цели
POST   /api/savings-goals                     # Создать цель
GET    /api/savings-goals/:id/projection      # Прогноз достижения

# Forecast Scenarios (Прогнозы)
GET    /api/forecasts                         # Все сценарии
POST   /api/forecasts                         # Создать сценарий
POST   /api/forecasts/:id/calculate           # Рассчитать прогноз
GET    /api/forecasts/quick-summary           # Быстрый прогноз
```

---

## 4. Зависимости проекта

### Backend Dependencies
```json
{
  "@nestjs/common": "^10.3.0",
  "@nestjs/core": "^10.3.0",
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "@nestjs/platform-express": "^10.3.0",
  "@nestjs/schedule": "^4.0.0",
  "@nestjs/swagger": "^7.2.0",
  "@prisma/client": "^5.8.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.1",
  "ioredis": "^5.3.2",
  "passport-jwt": "^4.0.1"
}
```

---

## 5. Запуск проекта

### Требования
- Node.js 18+
- Docker + Docker Compose
- PostgreSQL 15
- Redis 7

### Шаги запуска

1. **Установить зависимости:**
   ```bash
   cd backend
   npm install
   ```

2. **Запустить Docker:**
   ```bash
   docker-compose up -d
   ```

3. **Сгенерировать Prisma client:**
   ```bash
   cd backend
   npx prisma generate
   ```

4. **Запустить миграцию:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Запустить сервер:**
   ```bash
   npm run start:dev
   ```

6. **Открыть Swagger:**
   ```
   http://localhost:3001/docs
   ```

---

## 6. Структура файлов

```
money-tracker/
├── backend/
│   ├── src/
│   │   ├── auth/           # Аутентификация
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/          # Пользователи
│   │   ├── accounts/       # Счета
│   │   ├── categories/     # Категории
│   │   ├── transactions/   # Транзакции
│   │   ├── budget/         # Бюджеты
│   │   ├── goals/          # Цели
│   │   ├── gamification/   # Геймификация
│   │   ├── wishlist/       # Инкубатор желаний
│   │   ├── challenges/     # Челленджи
│   │   ├── life-cost/      # Калькулятор жизни
│   │   ├── family/         # Семейный бюджет
│   │   ├── achievements/   # Достижения
│   │   ├── notifications/  # Уведомления
│   │   ├── financial-forecast/  # Финансовые прогнозы (МОДУЛЬНАЯ АРХИТЕКТУРА)
│   │   │   ├── deposits/       # Вклады
│   │   │   │   ├── dto/
│   │   │   │   ├── deposits.service.ts
│   │   │   │   └── deposits.controller.ts
│   │   │   ├── loans/          # Кредиты
│   │   │   │   ├── dto/
│   │   │   │   ├── loans.service.ts
│   │   │   │   └── loans.controller.ts
│   │   │   ├── savings-goals/  # Цели накоплений
│   │   │   │   ├── dto/
│   │   │   │   ├── savings-goals.service.ts
│   │   │   │   └── savings-goals.controller.ts
│   │   │   ├── forecasts/      # Прогнозы
│   │   │   │   ├── dto/
│   │   │   │   ├── forecasts.service.ts
│   │   │   │   └── forecasts.controller.ts
│   │   │   └── financial-forecast.module.ts
│   │   ├── prisma/         # Prisma
│   │   ├── redis/          # Redis
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── mobile/                  # Expo + React Native + Tamagui (ПЛАН: docs/MOBILE_DEV_PLAN.md)
├── docker-compose.yml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── TECHNICAL_SPEC.md
│   ├── FINANCIAL_FORECAST.md  # ✅ Завершено
│   └── MOBILE_DEV_PLAN.md     # НОВЫЙ - План разработки mobile
└── README.md
```

---

## 7. Следующие шаги

1. **Завершить настройку backend:**
   - [ ] Установить npm зависимости
   - [ ] Сгенерировать Prisma client
   - [ ] Запустить Docker containers
   - [ ] Создать миграцию БД
   - [ ] Протестировать API

2. **Разработать Financial Forecast (новая фича):**
   - [ ] Добавить модели Deposit, Loan, SavingsGoal в Prisma
   - [ ] Создать FinancialForecastModule
   - [ ] Реализовать калькулятор вкладов
   - [ ] Реализовать калькулятор кредитов
   - [ ] Создать систему прогнозов
   - [ ] Интегрировать с дашбордом

3. **Начать разработку mobile:**
   - [ ] Инициализировать Expo проект
   - [ ] Настроить Tamagui
   - [ ] Создать базовые экраны

4. **Тестирование:**
   - [ ] Unit tests для сервисов
   - [ ] E2E тесты API

---

## 8. Документация

- **Общая архитектура:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Техническое задание:** [`docs/TECHNICAL_SPEC.md`](docs/TECHNICAL_SPEC.md)
- **Financial Forecast:** [`docs/FINANCIAL_FORECAST.md`](docs/FINANCIAL_FORECAST.md) - ✅ Завершено
- **Mobile Development Plan:** [`docs/MOBILE_DEV_PLAN.md`](docs/MOBILE_DEV_PLAN.md) - Новый план разработки

---

## 9. План разработки мобильного приложения

См. [`docs/MOBILE_DEV_PLAN.md`](docs/MOBILE_DEV_PLAN.md) - подробный план разработки на основе завершенного backend.

**Технический стек:**
- Expo + React Native + Tamagui
- Expo Router для навигации
- TanStack Query для состояния данных
- Lottie для анимаций
- Expo Notifications для push-уведомлений

**Этапы:** ~13-17 рабочих дней

### Прогноз роста капитала

```
Пользователь: 30 лет, инженер, зарплата 120,000 ₽
- Вклад в Сбербанке: 500,000 ₽ (ставка 10%)
- Ипотека: 3,000,000 ₽ (ставка 12%, остаток 20 лет)

Прогноз на 10 лет:
┌─────────┬──────────────┬──────────────┬──────────────┐
│ Год     │ Сбережения    │ Долги        │ Чистая стоим.│
├─────────┼──────────────┼──────────────┼──────────────┤
│ Сейчас  │ 500,000      │ 3,000,000    │ -2,500,000   │
│ 1       │ 1,100,000    │ 2,400,000    │ -1,300,000   │
│ 5       │ 4,000,000    │ 1,200,000    │ +2,800,000   │
│ 10      │ 8,500,000    │ 0            │ +8,500,000   │
└─────────┴──────────────┴──────────────┴──────────────┘

"Если вы будете откладывать 30,000 ₽/мес (25% от зарплаты),
через 10 лет у вас будет 8.5 миллионов и вы станете Financial Architect!"
```
