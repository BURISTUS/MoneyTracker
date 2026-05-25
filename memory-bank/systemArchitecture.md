# Системная архитектура

## Бизнес-контекст

### Название
**MoneyTracker** — «Побег из общества потребления»

### Суть продукта
Финансовый трекер, который не просто учитывает расходы, а меняет отношение пользователя к деньгам. Приложение конвертирует цены в **часы жизни** и помогает бороться с импульсивными покупками через «Инкубатор желаний».

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
- Отказ = отображение сэкономленного времени, статистика savings
- Покупка тоже доступна, но UI подталкивает к отказу (зелёная кнопка «Мне это не нужно» крупнее красной «Купить»)

### Месседж
Приложение не говорит «Не трать». Оно говорит: **«Не меняй свою жизнь на мусор»**.

### Монетизация (план)
- **Free:** Учёт расходов, базовые категории, инкубатор, life-hours
- **Premium:** Безлимитный инкубатор с аналитикой, кастомные скины аватара, семейный бюджет, прогнозы

### Дизайн-референс
Стиль **1Money** — тёмная тема, donut-диаграмма расходов на главном экране, bottom-sheet модалки, calculator numpad при вводе суммы, иконки категорий вокруг диаграммы.

## Стек технологий

### Landing Page
- **Location:** `landing/` в корне проекта
- **Tech:** Static HTML + CSS + Vanilla JS (no build step)
- **App Name:** SpendWise — Financial Tracker
- **Design:** 1Money-like, точные токены из themeStore.ts, dark (#0A0A0F) / light (#F5F1EB) тема
- **Colors Dark:** Primary #6366F1 (indigo), Orange #FB9554, Green #34C759, Tab active #818CF8
- **Colors Light:** Primary #D97706 (amber), Orange #D97706, Green #059669, Tab active #D97706
- **i18n:** 20 языков (en, ru, es, pt, fr, de, ja, zh, ko, ar, hi, it, nl, pl, tr, uk, th, vi, id, bn)
- **JS:** Theme toggle (localStorage), language switcher, scroll animations, navbar blur, smooth scroll
- **Sections:** Hero (phone mockup), Life-Cost, AI Financial Advisor (chat demo), Wish Incubator, Analytics (6 cards), Features (6 cards), How It Works, Premium, CTA/Download, Footer
- **Responsive:** Breakpoints at 480px, 768px, 1024px
- **RTL:** Arabic support

### Backend
- **Framework:** NestJS 10 (TypeScript strict)
- **ORM:** Prisma 5 (PostgreSQL 15)
- **Cache:** Redis 7 (ioredis)
- **Auth:** Passport JWT (bcrypt хеширование), JWT TTL 15мин, refresh TTL 30 дней
- **API Docs:** Swagger (@nestjs/swagger)
- **Валидация:** class-validator + class-transformer
- **Порт:** 3001, глобальный префикс `/api/`
- **Менеджер пакетов:** yarn 1.22

### Mobile
- **Framework:** React Native (Expo SDK 54)
- **Routing:** expo-router (file-based)
- **UI Library:** gluestack-ui v3 (copy-paste, NativeWind/Tailwind)
- **Styling:** NativeWind v4 (Tailwind CSS для RN) + react-native-css-interop@0.2.3 (с patch-package патчем)
- **CSS Vars:** nativewind `vars()` в gluestack-ui-provider/config.ts (light/dark токены) — GluestackUIProvider применяет через `style={config[mode]}` на wrapper View
- **State:** Zustand (persist + expo-secure-store) + React Query (@tanstack/react-query)
- **HTTP:** Axios (base config в services/api.ts)
- **i18n:** i18next + react-i18next + expo-localization. Переводы загружаются с бэкенда (`GET /api/i18n/translations/:lang`), локальный fallback. `Accept-Language` header на каждый запрос. 8 языков: en, ru, es, pt, fr, de, ja, zh.
- **Токен:** JWT access (15мин) + refresh (30 дней) в expo-secure-store (ключи `authToken`, `refreshToken`)
- **SVG:** react-native-svg (без LinearGradient/stop — крашат Android)
- **Запрещены:** react-native-reanimated и react-native-gesture-handler в компонентах (краш Android)
- **Тема:** Dark mode (#0A0A0F фон, #1C1C1E карточки) через gluestack-ui tokens + NativeWind vars

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
| Session | userId, refreshToken(unique), expiresAt, isRevoked, deviceInfo |
| Account | userId, name, type(CASH/BANK/CREDIT/INVESTMENT/DEBT), balance(BigInt), currency |
| Category | userId(nullable — null = системная), name, type(INCOME/EXPENSE), icon, color, isBaseNeed |
| Transaction | userId, accountId, categoryId, amount(BigInt), type(INCOME/EXPENSE/TRANSFER), date |
| Budget | userId, categoryId, amount(BigInt), period(MONTHLY default), startDate/endDate(auto текущий месяц), alertThreshold(default 80) |
| Goal | userId, name, targetAmount, currentAmount, deadline |
| WishlistItem | userId, name, price, description(String, обязательное), status(PENDING/READY/REJECTED/PURCHASED), cooldownDays(7) |
| Deposit | userId, type, principal, annualRate, compounding |
| Loan | userId, type, principal, currentBalance, monthlyPayment |
| SavingsGoal | userId, name, targetAmount, currentAmount |
| ForecastScenario | userId, monthlyIncome, monthlyExpenses, forecastYears |
| RecurringRule | userId, accountId, categoryId, amount(BigInt), type(TransactionType), period(WEEKLY/MONTHLY), dayOfWeek?, dayOfMonth?, description?, isActive, nextRunDate, lastRunDate |
| Transaction | userId, accountId, categoryId, amount(BigInt), type(TransactionType), description?, date, recurringRuleId?(nullable) |
| ExchangeRate | code(unique), name, symbol, rate(1USD=X), type(FIAT/CRYPTO/METAL), popular(bool), source, date(YYYY-MM-DD) |
| Translation | language, group, key, value (unique combo) |

### Нереализованные модели (файлы есть, модули не подключены)
Family, FamilyMember, DepositTransaction, LoanPayment

## Backend — структура папок
```
backend/src/
├── app.module.ts          # Root (PrismaModule, RedisModule, AuthModule, UsersModule, TransactionsModule, CategoriesModule, AccountsModule, BudgetModule, GoalsModule, WishlistModule, LifeCostModule, RecurringModule)
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
├── life-cost/             # Hourly rate, calculate hours
├── chat/                  # Chat messages
├── currency/              # Currency rates (~300+ currencies, Redis cache, exchange-api, upsert on refresh)
├── i18n-controller/       # GET /api/i18n/translations/:lang, GET /api/i18n/languages
├── i18n/                  # Translation JSON files: en/, ru/, es/, pt/, fr/, de/, ja/, zh/
├── recurring/             # Recurring rules (CRUD, pause/activate, @Cron auto-generation)
└── (не подключены: family, deposits, loans)
```

## Mobile — структура папок
```
mobile/
├── app/                   # expo-router routes
│   ├── _layout.tsx        # Root: GluestackUIProvider + ToastProvider + QueryClientProvider + ThemeProvider + Stack, import global.css
│   ├── index.tsx          # Auth gate (checkAuth → /main или /auth/login)
│   ├── auth/              # login.tsx, register.tsx
│   └── main/              # Authenticated screens
│       ├── _layout.tsx    # TabBar + Stack
│       ├── index.tsx      # Home (balance, monthly stats, recent transactions)
│       ├── transactions/  # Dashboard с DonutChart + TransactionActionModal
│       ├── categories/    # List + Create + Chart
│       ├── wishlist/      # Incubator (cooldown 7 дней, life-hours)
│       ├── chat/          # AI чат с пресетами
│       ├── accounts/      # Accounts list
│       ├── budget/        # Budget page
│       ├── goals/         # Goals page
│       ├── life-cost/     # Life cost calculator
│       └── profile/       # Profile settings
├── src/
│   ├── types/index.ts     # Все TypeScript типы
│   ├── utils/formatters.ts # formatCurrency (копейки→рубли), formatDate
│   ├── services/          # API services (api.ts, auth, accounts, categories, transactions, lifeCost)
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts   # user, isAuthenticated, isDemoMode, login/logout/loginMock/checkAuth
│   │   └── dataStore.ts   # accounts, transactions, categories, budgets, goals, wishlist, hourlyRate
│   ├── hooks/             # Custom hooks (useAccounts, useTransactions, etc.)
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts   # user, isAuthenticated, isDemoMode, login/logout/loginMock/checkAuth
│   │   ├── dataStore.ts   # accounts, transactions, categories, budgets, goals, wishlist, hourlyRate
│   │   ├── securityStore.ts # isLockEnabled, lockMethod, pinHash
│   │   └── subscriptionStore.ts # premium status, features
│   ├── hooks/             # Custom hooks (useAccounts, useTransactions, etc.)
│   └── components/
│       ├── ui/            # Базовые: Loading, CategoryIcon, DonutChart, SpendingChart, AddTransactionModal, TransactionActionModal, DatePickerModal, DateRangePickerModal, CurrencyPicker, Toast, ConfirmModal, LockScreen
│       ├── ui/TransactionForm/ # Подкомпоненты AddTransactionModal: AmountInput, CategorySelector, AccountSelector, TransactionNoteInput, TransactionTypeToggle, useTransactionForm
│       ├── features/      # Составные: AccountCard, TransactionItem, WishlistCard, BudgetCard, GoalCard, StatCard
│       └── layout/        # TabBar
```

## API эндпоинты

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /auth/register | Регистрация (создаёт дефолтный аккаунт, возвращает access+refresh) |
| POST | /auth/login | Логин (возвращает access+refresh) |
| POST | /auth/refresh | Обмен refresh token на новую пару (ротация) |
| GET | /auth/me | Текущий юзер (JWT) |
| POST | /auth/logout | Инвалидация refresh token |

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

### Budget
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /budgets | Все бюджеты с прогрессом за текущий месяц |
| GET | /budgets/:id/progress | Прогресс конкретного бюджета |
| POST | /budgets | Создать месячный бюджет (categoryId, amount, alertThreshold) |
| PATCH | /budgets/:id | Обновить сумму/порог |
| DELETE | /budgets/:id | Удалить бюджет |

### Users
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /users/profile | Профиль юзера |
| PATCH | /users/profile | Обновить name, monthlyHours, currency, language |
| PATCH | /users/hourly-rate | Установить hourlyRate (копейки) |

### Life-Cost
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /life-cost/rate | Получить hourlyRate |
| POST | /life-cost/calculate | Рассчитать часы |

### Recurring
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /recurring | Все recurring rules юзера |
| POST | /recurring | Создать правило (WEEKLY/MONTHLY, dayOfWeek/dayOfMonth) |
| PATCH | /recurring/:id | Обновить правило |
| DELETE | /recurring/:id | Удалить (?keepTransactions=true/false) |
| PATCH | /recurring/:id/pause | Поставить на паузу |
| PATCH | /recurring/:id/activate | Активировать (пересчёт nextRunDate) |
| GET | /recurring/:id/preview | Предпросмотр следующих N дат (?count=3) |

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

### Chat
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /chat/messages | История сообщений |
| POST | /chat/message | Отправить сообщение (USER → ASSISTANT) |
| DELETE | /chat/messages | Очистить историю |

## Демо-режим
- Кнопка «Начать (демо)» на login/register → `loginMock()`
- `isDemoMode: true` в authStore (persisted)
- `initializeData()` пропускает API-вызовы в демо-режиме
- `checkAuth()` пропускает `/auth/me` в демо-режиме
- Нет реального JWT-токена — только моковые данные в Zustand

## Spec-Driven Development (OpenSpec)
```
openspec/
├── config.yaml           # Project context, tech stack, conventions, rules
├── specs/                # Capability specs (living documentation)
│   ├── auth-users/spec.md
│   ├── accounts/spec.md
│   ├── categories/spec.md
│   ├── transactions/spec.md
│   ├── budgets/spec.md
│   ├── goals/spec.md
│   ├── wishlist/spec.md
│   ├── life-cost/spec.md
│   ├── currency/spec.md
│   ├── notifications/spec.md
│   └── family/spec.md
└── changes/              # Change proposals (archive/)
    └── <change-id>/
        ├── proposal.md
        ├── design.md
        └── tasks.md
```
- Каждая спека: Purpose + Requirements в формате GIVEN/WHEN/THEN
- Контекст проекта (стек, конвенции, API) — в `config.yaml`
- Новые фичи: создавать change proposal в `openspec/changes/`

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
