# Системная архитектура

## Бизнес-контекст

### Название
**MoneyTracker** — «Побег из общества потребления»

### Суть продукта
Финансовый трекер с геймификацией, который не просто учитывает расходы, а меняет отношение пользователя к деньгам. Приложение конвертирует цены в **часы жизни** и помогает бороться с импульсивными покупками через «Инкубатор желаний».

### Целевая аудитория
Люди 20-40 лет, которые хотят осознанно управлять финансами, избавиться от импульсивных покупок и начать накапливать.

### Киллер-фичи

#### 1. «Цена твоей жизни» (Time-is-Money Converter)
- При регистрации пользователь вводит зарплату и рабочие часы → рассчитывается **Real Hourly Rate**
- Каждая трата показывается не только в рублях, но и в **часах/минутах работы**
- Пример: «Новый iPhone 120 000 ₽ = 160 часов = 20 рабочих дней. Ты готов просидеть в офисе месяц ради этого?»
- Сквозная фича — life-hours отображаются везде: в транзакциях, инкубаторе, категориях, на дашборде

#### 2. «Инкубатор желаний» (Wishlist / Anti-Spend Impulse)
- Желание добавляется с таймером остывания (7 дней по умолчанию)
- Кнопка «Купить» заблокирована до окончания таймера
- Через 7 дней — вопрос: «Ты всё ещё хочешь это?»
- Отказ = дофаминовая награда: XP, визуализация сэкономленного, прогноз инвестиционного роста
- Покупка тоже доступна, но UI подталкивает к отказу (зелёная кнопка «Мне это не нужно» крупнее красной «Купить»)

#### 3. RPG-прогрессия (Уровни осознанности)
| Уровень | Статус | Описание |
|---------|--------|----------|
| 1 | Потребитель (Consumer Drone) | Есть долги, нет накоплений |
| 2 | Пробудившийся (Awakened) | Начал отслеживать траты |
| 3 | Аскет (Ascetic) | Закрыл долги, отказался от 5+ импульсивных покупок |
| 4 | Стратег (Strategist) | Есть подушка безопасности |
| 5 | Капиталист (Capitalist) | Пассивный доход покрывает 10% трат |
| 6 | Архитектор (Financial Architect) | Финансовая независимость |

#### 4. Ачивки (примеры)
- 🏆 «Убийца маркетинга» — не покупал одежду 3 месяца (кроме базы)
- ☕ «Кофеин-детокс» — 30 дней без кофе на вынос
- 📉 «Шорт трендов» — отказ от вещи после инкубатора

### Месседж
Приложение не говорит «Не трать». Оно говорит: **«Не меняй свою жизнь на мусор»**.

### Монетизация (план)
- **Free:** Учёт расходов, базовые категории, инкубатор (лимит 3 желания), life-hours
- **Premium:** Безлимитный инкубатор с аналитикой, продвинутые ачивки, кастомные скины аватара, семейный бюджет, прогнозы

### Дизайн-референс
Стиль **1Money** — тёмная тема, donut-диаграмма расходов на главном экране, bottom-sheet модалки, calculator numpad при вводе суммы, иконки категорий вокруг диаграммы.

## Стек технологий

### Backend
- **Framework:** NestJS 10 (TypeScript strict)
- **ORM:** Prisma 5 (PostgreSQL 15)
- **Cache:** Redis 7 (ioredis)
- **Auth:** Passport JWT (bcrypt хеширование)
- **API Docs:** Swagger (@nestjs/swagger)
- **Валидация:** class-validator + class-transformer
- **Порт:** 3001, глобальный префикс `/api/`
- **Менеджер пакетов:** yarn 1.22

### Mobile
- **Framework:** React Native (Expo SDK 54)
- **Routing:** expo-router (file-based)
- **State:** Zustand (persist + expo-secure-store) + React Query (@tanstack/react-query)
- **HTTP:** Axios (base config в services/api.ts)
- **i18n:** i18next + react-i18next + expo-localization. Переводы загружаются с бэкенда (`GET /api/i18n/translations/:lang`), локальный fallback. `Accept-Language` header на каждый запрос. 8 языков: en, ru, es, pt, fr, de, ja, zh.
- **Токен:** JWT в expo-secure-store (ключ `authToken`)
- **SVG:** react-native-svg (без LinearGradient/stop — крашат Android)
- **Запрещены:** react-native-reanimated и react-native-gesture-handler в компонентах (краш Android)
- **Тема:** Dark mode (#0A0A0F фон, #1C1C1E карточки)

## База данных (Prisma)

### Конвенция
- Все ID — UUID строки
- Все денежные суммы — BigInt (копейки). На фронт делим на 100.
- `hourlyRate` — в копейках ОСНОВНОЙ валюты пользователя (User.currency)
- `Account.currency` — валюта счёта (ISO 4217). Счета могут быть в разных валютах
- Общий баланс: счета в User.currency складываем напрямую, остальные конвертируем через CurrencyRate
- USD — только как технический хаб для кросс-курсов (RUB → USD → EUR). Пользователь USD не видит
- BigInt.toJSON monkey-patch — сериализуется как string
- **Конвенция hourlyRate на фронте:** `getHourlyRate()` возвращает **единицы** (делит на 100). Все расчёты life-hours: `(сумма_в_единицах) / getHourlyRate()`

### Основные модели
| Модель | Описание |
|--------|----------|
| User | email, password(bcrypt), name, currency(ISO 4217, default RUB), language(default en), hourlyRate, monthlyHours |
| Session | userId, token, expiresAt |
| Account | userId, name, type(CASH/BANK/CREDIT/INVESTMENT/DEBT), balance(BigInt), currency |
| Category | userId(nullable — null = системная), name, type(INCOME/EXPENSE), icon, color, isBaseNeed |
| Transaction | userId, accountId, categoryId, amount(BigInt), type(INCOME/EXPENSE/TRANSFER), date |
| Budget | userId, categoryId, amount, period(WEEKLY/MONTHLY/YEARLY) |
| Goal | userId, name, targetAmount, currentAmount, deadline |
| UserGamification | userId(unique), xp, level, savedAmount, status |
| WishlistItem | userId, name, price, description(String, обязательное), status(PENDING/READY/REJECTED/PURCHASED), cooldownDays(7) |
| Achievement | code(unique), name, xpReward, conditionType, tier |
| Deposit | userId, type, principal, annualRate, compounding |
| Loan | userId, type, principal, currentBalance, monthlyPayment |
| SavingsGoal | userId, name, targetAmount, currentAmount |
| ForecastScenario | userId, monthlyIncome, monthlyExpenses, forecastYears |
| ExchangeRate | code(unique), name, symbol, rate(1USD=X), type(FIAT/CRYPTO/METAL), popular(bool), source, date(YYYY-MM-DD) |
| Translation | language, group, key, value (unique combo) |

### Нереализованные модели (файлы есть, модули не подключены)
Family, FamilyMember, Notification, Challenge, UserChallenge, DepositTransaction, LoanPayment

## Backend — структура папок
```
backend/src/
├── app.module.ts          # Root (PrismaModule, RedisModule, AuthModule, UsersModule, TransactionsModule, CategoriesModule, AccountsModule, BudgetModule, GoalsModule, WishlistModule, GamificationModule, LifeCostModule)
├── main.ts                # CORS, ValidationPipe, Swagger, BigInt.toJSON, port 3001
├── prisma/                # PrismaService
├── redis/                 # RedisService
├── auth/                  # JWT auth (login, register, /auth/me, /auth/logout)
├── users/                 # CRUD users
├── accounts/              # CRUD accounts
├── categories/            # CRUD + system categories seeder + icons + accountTypes
├── transactions/          # CRUD + summary + category OR query (system + personal)
├── budget/                # CRUD budgets
├── goals/                 # CRUD goals
├── wishlist/              # CRUD wishlist
├── gamification/          # XP, level, status
├── life-cost/             # Hourly rate, calculate hours
├── currency/              # Currency rates (~300+ currencies, Redis cache, exchange-api, upsert on refresh)
├── i18n-controller/       # GET /api/i18n/translations/:lang, GET /api/i18n/languages
├── i18n/                  # Translation JSON files: en/, ru/, es/, pt/, fr/, de/, ja/, zh/
└── (не подключены: notifications, family)
```

## Mobile — структура папок
```
mobile/
├── app/                   # expo-router routes
│   ├── _layout.tsx        # Root: QueryClientProvider + ThemeProvider + Stack
│   ├── index.tsx          # Auth gate (checkAuth → /main или /auth/login)
│   ├── auth/              # login.tsx, register.tsx
│   └── main/              # Authenticated screens
│       ├── _layout.tsx    # TabBar + Stack (12 экранов)
│       ├── index.tsx      # Home (balance, monthly stats, recent transactions)
│       ├── transactions/  # Dashboard с DonutChart + TransactionActionModal
│       ├── categories/    # List + Create + Chart
│       ├── wishlist/      # Incubator (cooldown 7 дней, life-hours)
│       ├── accounts/      # Accounts list
│       ├── budget/        # Budget page
│       ├── goals/         # Goals page
│       ├── life-cost/     # Life cost calculator
│       └── profile/       # Profile settings
├── src/
│   ├── types/index.ts     # Все TypeScript типы (430 строк)
│   ├── theme/             # Dark theme colors, spacing, typography
│   ├── utils/formatters.ts # formatCurrency (копейки→рубли), formatDate
│   ├── services/          # API services (api.ts, auth, accounts, categories, transactions, lifeCost)
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts   # user, isAuthenticated, isDemoMode, login/logout/loginMock/checkAuth
│   │   └── dataStore.ts   # accounts, transactions, categories, budgets, goals, wishlist, gamification, getHourlyRate/setHourlyRate
│   ├── hooks/             # Custom hooks (useAccounts, useTransactions, etc.)
│   └── components/
│       ├── ui/            # Базовые: Screen, Text, Button, Input, Card, Icon, Loading, DonutChart, SpendingChart, AddTransactionModal, TransactionActionModal, DatePickerModal
│       ├── features/      # Составные: AccountCard, TransactionItem, WishlistCard, XPBar, etc.
│       └── layout/        # Header, TabBar
```

## API эндпоинты

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /auth/register | Регистрация (создаёт дефолтный аккаунт) |
| POST | /auth/login | Логин (email + password) |
| GET | /auth/me | Текущий юзер (JWT) |
| POST | /auth/logout | Удаление токена клиента |

### Accounts
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /accounts | Все счета юзера |
| POST | /accounts | Создать счёт |

### Categories
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /categories | Все категории (системные + личные) |
| GET | /categories/system | Только системные (без auth) |
| POST | /categories | Создать категорию |
| GET | /categories/account-types | Типы счетов |
| GET | /categories/icons | Список иконок |

### Transactions
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /transactions | Все транзакции (filters: startDate, endDate, categoryId, type) |
| GET | /transactions/summary | Сводка (income, expenses, balance) |
| GET | /transactions/:id | Одна транзакция |
| POST | /transactions | Создать (обновляет баланс аккаунта) |
| PATCH | /transactions/:id | Обновить (description, date) |
| DELETE | /transactions/:id | Удалить (восстанавливает баланс) |

### Users
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /users/profile | Профиль юзера (с gamification) |
| PATCH | /users/profile | Обновить name, monthlyHours |
| PATCH | /users/hourly-rate | Установить hourlyRate (копейки) |

### Life-Cost
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /life-cost/rate | Получить hourlyRate |
| POST | /life-cost/calculate | Рассчитать часы |

### Currency
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /currency/list | Пагинированный список валют с поиском (?search=&type=&popular=&page=&limit=) |
| GET | /currency/rates | Все курсы валют (Redis cache 24ч) |
| GET | /currency/convert | Конвертация (?amount=&from=&to=) |
| GET | /currency/fetch | Обновить с exchange-api (auth) |

### i18n
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /i18n/translations/:lang | Все переводы для языка |
| GET | /i18n/languages | Список поддерживаемых языков |

## Демо-режим
- Кнопка «Начать (демо)» на login/register → `loginMock()`
- `isDemoMode: true` в authStore (persisted)
- `initializeData()` пропускает API-вызовы в демо-режиме
- `checkAuth()` пропускает `/auth/me` в демо-режиме
- Нет реального JWT-токена — только моковые данные в Zustand

## Docker
```yaml
# docker-compose.yml
postgres: PostgreSQL 15 Alpine (port 5432)
redis: Redis 7 Alpine (port 6379, AOF persistence)
backend: NestJS (port 3001, depends on postgres + redis)
```

## Переменные окружения (backend/.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/money_tracker
JWT_SECRET=your-secret-key-here
```
