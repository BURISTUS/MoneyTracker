# Прогресс

## Выполненные задачи

### Refresh-token механизм (2026-05-19)
- [x] **Backend**: `RefreshToken` модель Prisma (id, token, userId, expiresAt, isRevoked)
- [x] **Backend**: `POST /auth/refresh` — ротация refresh token на новую пару access+refresh
- [x] **Backend**: `POST /auth/logout` — инвалидация refresh token
- [x] **Backend**: JWT TTL 15 мин, refresh TTL 30 дней
- [x] **Backend**: i18n ошибки (invalidRefreshToken, refreshTokenRevoked, refreshTokenExpired) EN+RU+18 языков
- [x] **Backend**: Миграция `20260518212046_add_refresh_token_model`
- [x] **Mobile**: `api.ts` — axios interceptor: 401 → `/auth/refresh` → retry оригинального запроса
- [x] **Mobile**: `api.ts` — race condition защита (isRefreshing + refreshSubscribers queue)
- [x] **Mobile**: `auth.ts` — refreshToken хранится в expo-secure-store (ключ `refreshToken`)
- [x] **Mobile**: `auth.ts` — методы `refreshTokens()`, `clearAuth()` чистят оба токена
- [x] **Mobile**: `types/index.ts` — `AuthResponse` обновлён (добавлено `refreshToken`)

### AddTransactionModal рефакторинг (2026-05-19)
- [x] 931 строка → 6 файлов: `TransactionForm/useTransactionForm.ts`, `AmountInput.tsx`, `CategorySelector.tsx`, `AccountSelector.tsx`, `TransactionNoteInput.tsx`, `TransactionTypeToggle.tsx`
- [x] `useTransactionForm.ts` — кастомный hook с состоянием формы и бизнес-логикой
- [x] Каждый подкомпонент получает props из родителя
- [x] `AddTransactionModal.tsx` — тонкий слой, делегирует подкомпонентам

### Biometric/pin-lock (2026-05-19)
- [x] `expo-local-authentication` установлен
- [x] `securityStore.ts` — isLockEnabled, lockMethod, pinHash (persisted в expo-secure-store)
- [x] `LockScreen.tsx` — PIN numpad + biometric prompt + error feedback (vibration)
- [x] `app/lock.tsx` — маршрут для lock screen
- [x] `_layout.tsx` — LockMonitor (AppState background >30с → lock)
- [x] `app/index.tsx` — проверка lock при запуске
- [x] i18n секция `security` (EN+RU)

### Backend Code Quality Refactoring (2026-05-16)
- [x] **61 проблема из аудита исправлена** (7 CRITICAL, 14 HIGH, 26 MEDIUM, 14 LOW)
- [x] DTOs созданы для ВСЕХ endpoints (20+ DTO файлов):
  - `accounts/dto/`: CreateAccountDto, UpdateAccountDto
  - `transactions/dto/`: CreateTransactionDto, UpdateTransactionDto, TransferTransactionDto
  - `users/dto/`: UpdateProfileDto, UpdateHourlyRateDto
  - `wishlist/dto/`: CreateWishlistDto
  - `categories/dto/`: CreateCategoryDto, UpdateCategoryDto
  - `goals/dto/`: CreateGoalDto, UpdateGoalDto, UpdateGoalProgressDto (подключены к контроллеру)
  - `chat/dto/`: SendMessageDto
  - `ai/dto/`: ParseVoiceDto, ParseReceiptDto
  - `family/dto/`: CreateFamilyDto, JoinFamilyDto
  - `articles/dto/`: CreateArticleDto, UpdateArticleDto
  - `subscription/dto/`: ActivateSubscriptionDto
  - `life-cost/dto/`: CalculateLifeCostDto, SimulateInvestmentDto
- [x] **CRITICAL**: Transaction create/update/delete обёрнуты в `prisma.$transaction()`
- [x] **CRITICAL**: Account update теперь через DTO с whitelist (balance валидируется)
- [x] **CRITICAL**: Subscription activate/toggle — toggle оставлен для dev, activate требует DTO
- [x] **HIGH**: Auth registration ловит Prisma P2002 (race condition email uniqueness)
- [x] **HIGH**: PremiumGuard добавлен на chat/AI/family endpoints
- [x] **HIGH**: Все raw Error/HttpException/BadRequestException → AppException с i18n
- [x] **HIGH**: Chat/AI controllers throw errors instead of `{ error: msg }` with HTTP 200
- [x] **HIGH**: Redis service — все методы обёрнуты в try/catch с graceful degradation
- [x] **HIGH**: OpenAI/DeepSeek API calls — try/catch с AppException
- [x] **HIGH**: PremiumGuard reject при отсутствии userId (вместо allow)
- [x] **MEDIUM**: `process.env` → ConfigService везде (main.ts, redis.service, chat.service, ai.service)
- [x] **MEDIUM**: JWT strategy возвращает `{ id, email, name, currency }` — `req.user.currency` работает
- [x] **MEDIUM**: Account creation race condition — count+create в `$transaction()`
- [x] **MEDIUM**: Goal deadline default = +6 месяцев (не `new Date()`)
- [x] **MEDIUM**: Goal contribution — валидация `amount > 0`
- [x] **MEDIUM**: Transactions pagination: `{ items, total, page, limit, totalPages }`
- [x] **MEDIUM**: `getSummary` через Prisma `groupBy` (не загрузка всех транзакций)
- [x] **MEDIUM**: CORS configurable через `CORS_ORIGINS` env variable
- [x] **MEDIUM**: i18n controller — async `fs/promises` вместо sync
- [x] **MEDIUM**: Currency service — error logging для failed upserts, AppException для not found
- [x] **MEDIUM**: `isPremium = true` для PREMIUM_FAMILY (не только PREMIUM)
- [x] **MEDIUM**: RateLimitGuard использует AppException с i18n (не hardcoded strings)
- [x] **LOW**: Все `console.log` → NestJS Logger (main.ts, articles.service, prisma.service)
- [x] **LOW**: Убран дубликат `game-controller` из AVAILABLE_ICONS
- [x] **LOW**: Magic numbers → константы (INVESTMENT_YEARS, ANNUAL_RATE)
- [x] **LOW**: `as any` удалены — используются Prisma enum типы
- [x] **LOW**: Chat history pagination (page/limit)
- [x] **LOW**: Account dead code (unused `findAll` call in `getTotalBalance`) удалён
- [x] **LOW**: Subscription toggle endpoint оставлен для dev/test
- [x] E2E тесты обновлены для paginated response (GET /transactions)

### Spec-Driven Development (OpenSpec)
- [x] OpenSpec структура создана (`openspec/config.yaml` + `openspec/specs/`)
- [x] Project context и conventions перенесены в `config.yaml`
- [x] Спеки созданы для основных capability
- [x] Формат спеков: Purpose + Requirements (GIVEN/WHEN/THEN сценарии)
- [x] Старый `specs/project-overview.md` сохранён как источник

### Багфиксы
- [x] **Logout 404**: добавлен `POST /auth/logout` на бэкенд (`AuthController` + `AuthService`), клиентский `authStore.logout()` теперь gracefully обрабатывает API ошибки

### Wishlist / Инкубатор — визуальный редизайн
- [x] Hero life-cost block (крупный ⏱ X ч, оранжевый `#FB9554`) в каждой карточке
- [x] PENDING карточки: синий акцент `#4F6EF7`, таймлайн из 7 сегментов, disabled кнопки
- [x] READY карточки: оранжевый акцент, кнопка «💚 НЕ НУЖНО» primary (1.25:1 размер, solid bg), «🛒 Купить» secondary (outline)
- [x] Decision Modal (bottom sheet) вместо Alert: таймлайн, hero life-cost, description в кавычках, два CTA с подписями
- [x] Reward Modal (full-screen Animated): 4 шага — ✅ check → 💰 сэкономлено → ✨ сохранённые часы → инвестиционный прогноз 10 лет
- [x] Улучшенный empty state: emotional copy «Заморозь импульс»
- [x] Улучшенная форма добавления: live life-cost preview, счётчик символов (мин 10), Indigo CTA
- [x] История: цветные левые границы (green для REJECTED, red для PURCHASED), opacity 0.7 для купленных
- [x] 0 ошибок TypeScript

### Инициализация проекта
- [x] Репозиторий создан (NestJS backend + Expo mobile)
- [x] Docker Compose: PostgreSQL 15 + Redis 7 + Backend
- [x] Prisma schema (модели для основного функционала)
- [x] Backend модули: Auth, Users, Accounts, Categories, Transactions, Budget, Goals, Wishlist, Life-Cost
- [x] Swagger документация на /docs

### Mobile — основа
- [x] Expo SDK 54 + expo-router (file-based routing)
- [x] Zustand stores (authStore + dataStore) с persist
- [x] Dark theme (#0A0A0F фон)
- [x] API слой (Axios + interceptors)
- [x] Все базовые UI компоненты (Screen, Text, Button, Input, Card, Icon, Loading, etc.)

### Mobile — экраны
- [x] Auth gate (app/index.tsx) — checkAuth → redirect
- [x] Login/Register — реальный вход + демо-режим
- [x] Home dashboard — баланс, доход/расход за период, быстрые действия
- [x] Transactions dashboard — DonutChart, период (день/неделя/месяц/год), тип toggle, список с группировкой по датам
- [x] AddTransactionModal — numpad с мат.операциями (+−×÷=), life-hours, выбор категории/счёта/заметки, DatePickerModal
- [x] TransactionActionModal — просмотр/редактирование описания, удаление с подтверждением, life-hours
- [x] Categories list — группировка по типу (расходы/доходы), системные/личные
- [x] Categories create — TextInput, палитра 18 цветов, каталог иконок (64), тип
- [x] Categories chart — реальные данные с прогресс-барами, life-hours
- [x] Wishlist/Incubator — cooldown 7 дней, купить/отказаться, life-hours
- [x] Profile — имя, email, статистика savings
- [x] Accounts, Budget, Goals, Life-Cost — базовые экраны

### Интеграция life-hours
- [x] В AddTransactionModal (под суммой ⏱ X ч работы)
- [x] В каждом transaction card (⏱ X ч работы)
- [x] В summary на dashboard (⏱ X ч работы под DonutChart)
- [x] В categories chart (⏱ для каждой категории)
- [x] В wishlist (⏱ X ч работы для каждого желания)

### DatePickerModal
- [x] Современный bottom-sheet с пресетами (Сегодня/Вчера/Позавчера)
- [x] Инпуты ДД/ММ с автофокусом (2 цифры → следующий, backspace → предыдущий)
- [x] Год всегда текущий — на сервер уходит текущий год
- [x] Закрытие только по OK или Отмена

### Калькулятор
- [x] Мат.операции +−×÷ в numpad (сетка 4×4)
- [x] Кнопка = для вычисления выражения
- [x] Цепочка операций (100 + 50 × 2)

### Backend фиксы
- [x] Categories: OR-запрос для системных категорий ({userId} OR {userId: null})
- [x] Transactions service: валидация category с системными
- [x] Transactions service: update balance при create/delete

### Auth фиксы
- [x] isDemoMode флаг в authStore (persisted)
- [x] checkAuth пропускает API в демо-режиме
- [x] initializeData пропускает API в демо-режиме
- [x] 401 interceptor: isRedirecting флаг (предотвращает каскад)
- [x] app/index.tsx: getState() после checkAuth (устранение stale closure)

### Bug фиксы
- [x] FlatList внутри ScrollView (wishlist) → scroll={false}
- [x] Дублирующиеся ключи иконок (categories/create) → composite key
- [x] apiPost → apiPatch для transactions update
- [x] Удалён DateTimePicker — заменён на DatePickerModal
- [x] SVG LinearGradient/stop убран (краш Android)
- [x] react-native-reanimated убран из компонентов (краш Android)

### Life-Cost страница
- [x] Калькулятор почасовой ставки: ввод зарплаты за час/неделю/месяц/год → рассчитывает ₽/час
- [x] Кнопка «Применить эту ставку» → сохраняет в dataStore (gamification.hourlyRate)
- [x] Отображение текущей ставки + пересчёт в месяц/год
- [x] Калькулятор стоимости в часах жизни (ввести сумму → показать часы/дни)
- [x] Прогноз инвестиций (10 лет, 12% годовых)
- [x] Примеры — нажатие подставляет сумму в калькулятор

### Bug фиксы (почасовая ставка)
- [x] life-cost/index.tsx: `amountKopecks / hourlyRate` → `amountNum / hourlyRate` (копейки÷копейки было неверно, теперь рубли÷рубли)
- [x] life-cost/index.tsx: убрано двойное деление `/100` при отображении ставки
- [x] dataStore calculateLifeCost: `amount / hourlyRate` → `amount / 100 / hourlyRate` (копейки→рубли÷рубли)

### Wishlist — описание
- [x] Добавлено обязательное поле «Зачем вам это?» при добавлении желания
- [x] Описание отображается на карточке желания
- [x] WishlistItem type обновлён (добавлено поле description)

### Transactions — редактирование/удаление
- [x] TransactionActionModal — просмотр, редактирование описания, удаление с Alert
- [x] dataStore: deleteTransaction, updateTransaction методы
- [x] Исправлен apiPost → apiPatch для update endpoint

### Custom Toast + ConfirmModal (замена Alert.alert)
- [x] `Toast.tsx` — ToastProvider + useToast hook (success/error/info, auto-dismiss 3s, animated fade+slide, dark theme)
- [x] `ConfirmModal.tsx` — кастомный confirm dialog (destructive/confirm variants, cancel + action buttons, dark theme)
- [x] ToastProvider обёрнут в `_layout.tsx` (глобально доступен)
- [x] 17 `Alert.alert` заменены в 7 файлах

### CategoryIcon — замена emoji на vector icons
- [x] `<CategoryIcon>` component (`src/components/ui/CategoryIcon.tsx`) — рендерит MaterialCommunityIcons
- [x] Все экраны обновлены: categories/index, categories/chart, transactions/index, AddTransactionModal, TransactionActionModal, DonutChart
- [x] Backend: seed системных категорий обновлён на `material:xxx` формат

### CurrencyModule — все валюты из API + CurrencyPicker
- [x] Backend: `refreshRates()` использует `upsert` — все ~300+ валют сохраняются
- [x] Backend: `GET /currency/list?search=&type=&popular=&page=&limit=` — пагинированный список с поиском
- [x] Mobile: `CurrencyPicker` компонент — модальный пикер с поиском, табами, пагинацией
- [x] Mobile: Выбор основной валюты в профиле → CurrencyPicker → `PATCH /users/profile`
- [x] Mobile: Валюта при создании счёта — кнопка в BottomSheet, `filterType="FIAT"`

### NativeWind/gluestack-ui полная миграция
- [x] gluestack-ui v3 + NativeWind v4 настроены (tailwind.config.js, global.css, babel, metro)
- [x] 14 экранов переписаны на Tailwind className
- [x] 8 feature-компонентов мигрированы
- [x] 4 UI-модалки мигрированы
- [x] 2 chart-компонента мигрированы
- [x] Loading.tsx, TabBar.tsx, CreateCategoryModal.tsx мигрированы
- [x] Budget screen — inline ProgressBar
- [x] Удалены 12 старых UI-компонентов
- [x] Удалена старая тема src/theme/

### Миграция — критические фиксы (2026-04-19)
- [x] react@19.1.0 строго (версия renderer в react-native@0.81.5 строго 19.1.0)
- [x] react-native-worklets-core установлен (требуется react-native-css-interop)
- [x] react-native-css-interop/babel.js патч (закомментирован worklets plugin, patch-package)
- [x] patch-package добавлен в devDependencies + postinstall скрипт
- [x] GluestackUIProvider: применяет CSS-переменные из config.ts через style={config[mode]}
- [x] i18n/index.ts: AsyncStorage.getItem перенесён из синхронного модульного вызова в async после init

### Transactions — навигация по периодам (2026-04-19)
- [x] DateRangePickerModal — полный календарь с сеткой дней, выбор диапазона тапом (start → end), подсветка диапазона, навигация по месяцам, пресеты
- [x] Кнопка "Период" открывает DateRangePickerModal
- [x] Свайп влево/вправо по списку транзакций — переключает период назад/вперёд (PanResponder)
- [x] Стрелки < > с лейблом текущего диапазона в одной строке с фильтр-чипами
- [x] offset-based навигация: день → вчера/позавчера, неделя → прошлая/позапрошлая, месяц → прошлый/текущий, год → прошлый/текущий

### Редактирование счетов
- [x] Accounts screen — тап по карточке открывает модалку редактирования (название + баланс)
- [x] При изменении баланса автоматически рассчитывается разница и предлагается добавить транзакцию
- [x] Transaction modal — показывает тип (доход/расход), сумму, поле для заметки, кнопки "Пропустить" / "Добавить"
- [x] FlatList для списка счетов (оптимизация рендеринга)

### Базовые счета при регистрации
- [x] Два базовых счёта: "Наличные" (CASH) и "Банковский счёт" (BANK)
- [x] Бэкенд `accounts.service.ts` метод `createDefaultsForUser` обновлён

### Бюджеты — месячный лимит по категории
- [x] Backend `BudgetService` — упрощённое создание (categoryId + amount + alertThreshold), period=MONTHLY, даты start/end текущего месяца авто
- [x] Backend `GET /budgets` — inline прогресс за текущий месяц (spent, remaining, percentUsed, isOverBudget, isNearLimit)
- [x] Backend `PATCH /budgets/:id` — редактирование суммы/порога
- [x] Mobile `BudgetScreen` — список с прогресс-барами, FAB «Добавить», AddBudgetModal
- [x] Mobile `TransactionsScreen` — dot-индикатор лимита рядом с категорией
- [x] Mobile `AddTransactionModal` — прогресс-бар остатка лимита под кнопкой категории

### Цели (Goals) — полная реализация
- [x] Backend `GoalsService` — `serializeGoal` для BigInt→string, inline прогресс (percentComplete, remaining)
- [x] Backend CRUD: GET /goals, POST /goals, PATCH /goals/:id, PATCH /goals/:id/progress, DELETE /goals/:id
- [x] Prisma schema: `deadline` теперь `@default(now())` (опционально при создании)
- [x] Mobile `GoalsScreen` — список с прогрессом, FAB «+», модалки: создать, редактировать, пополнить

### Дефолтные категории для существующего юзера
- [x] Backend `POST /categories/defaults` — endpoint для создания дефолтных категорий текущему юзеру
- [x] `createDefaultsForUser` теперь пропускает существующие категории по имени (не создаёт дубли)
- [x] Новые юзеры получают категории автоматически при регистрации

### Геймификация полностью удалена (2026-04-29)
- [x] XP, уровни, ачивки, стрики, статусы — всё удалено с фронта и бэка
- [x] Осталось: life-hours, инкубатор, статистика savings

### E2E тесты бэкенда (2026-05-16)
- [x] Тестовая БД `money_tracker_test` создана на PostgreSQL Docker (port 5433)
- [x] Jest E2E конфиг: `backend/test/jest-e2e.json`, скрипт `npm run test:e2e`
- [x] 86 E2E тестов покрывают: Auth, Accounts, Categories, Transactions, Users, Life-Cost, Wishlist, Goals, Subscription, Full User Flow
- [x] Полный флоу-тест: регистрация → счета → категории → транзакции → summary → premium → goals → wishlist → logout

### Фронтенд-аудит — исправление проблем (2026-05-18)
- [x] **Security**: удалены все console.log с email/паролем/токеном (auth.ts 9 логов, login.tsx 3 лога, api.ts 3 лога → __DEV__ guards)
- [x] **Security**: API URL fallback `http://10.0.2.2:3001/api` → `__DEV__` guarded (нет HTTP в production)
- [x] **Security**: пакеты-призраки `"i"` и `"npm"` удалены из package.json dependencies
- [x] **Security**: `react-native-web` перенесён из dependencies → devDependencies
- [x] **Code**: создан `src/utils/transactionUtils.ts` — `getTransactionCurrency()` и `formatLifeHours()`
- [x] **Code**: 13 `(x as any).account?.currency` casts заменены на типобезопасную утилиту (5 файлов)
- [x] **Code**: `formatLifeHours` дублирование убрано — общая утилита из transactionUtils.ts
- [x] **Performance**: StyleSheet.create() в AddTransactionModal (2 вызова) и HomeScreen обёрнуты в `useMemo`
- [x] **Performance**: expensive computations в transactions/index.tsx → useMemo (rangeLabel, totalAccountsBalance)
- [x] **Performance**: FlatList оптимизации в chat/index.tsx (maxToRenderPerBatch=10, windowSize=5)
- [x] **Performance**: animation cleanup при unmount в transactions/index.tsx (stopAnimation + isAnimatingOffset reset)
- [x] **UX**: alert() в login.tsx → toast.showError() (3 вызова)
- [x] **UX**: Alert.alert в home/index.tsx → toast.showError() (2 вызова: camera permission, receipt error)
- [x] **Tooling**: ESLint + Prettier добавлены (eslintrc.js, prettierrc, 8 devDeps, scripts: lint, lint:fix, format)

### i18n полная интеграция мобильного приложения (2026-05-18)
- [x] **Аудит**: 200+ захардкоженных строк найдено в 36 мобильных файлах (TSX экраны, компоненты, сервисы, stores, utils)
- [x] **Backend EN common.json**: добавлены 14 новых секций — months, monthsGen, monthsShort, weekdays, family, premium, receiptScanner, aiPreview, datePicker, dateRangePicker, transferModal, currencyPicker, components, lifeCost additions, subscription, exportSection, session, voiceInput, paywall + 20+ новых ключей в существующих секциях
- [x] **Backend RU common.json**: полностью переписан — исправлены все некорректные переводы (испанский в немецком файле и т.д.), добавлены все новые ключи с русскими переводами
- [x] **18 языков**: новые ключи добавлены с EN fallback (ar, bn, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, th, tr, uk, vi, zh)
- [x] **Mobile local fallbacks**: en.json и ru.json обновлены до ~35 секций (~988 строк), были ~413
- [x] **Месяцы/дни недели**: вынесены из хардкода (6+ файлов) в i18n ключи (months.*, monthsGen.*, monthsShort.*, weekdays.*)
- [x] **Исправлено 36 мобильных файлов**: экраны (categories, goals, accounts, wishlist, chat, analytics, profile, family, premium, transactions, life-cost, home), компоненты (AddTransactionModal, TransactionActionModal, ReceiptScanner, AiTransactionPreview, DateRangePickerModal, DatePickerModal, CategoryEditModal, ConfirmModal, TransferModal, CurrencyPicker, PaywallModal, PremiumBadge, WishlistCard, BalanceHero, GoalCard, TransactionItem, XPBar), сервисы (api.ts, export.ts), stores (authStore, dataStore, subscriptionStore), utils (formatters.ts), hooks (useLifeCost.ts)
- [x] **Фронтенд-аудит**: FRONTEND_REVIEW.md — оценка 6/10, приоритизированные рекомендации по коду, безопасности, быстродействию, актуальности

### Устранение хардкодов — English + language-aware (2026-05-16)
- [x] **currencySymbol** в chat.service.ts → импорт `KNOWN_SYMBOLS` из currency.service.ts (убран дубликат карты валют)
- [x] **FEATURES descriptions/limitUnits** → English вместо Russian (16 фич)
- [x] **ACCOUNT_TYPE_NAMES** → English (Cash, Bank, Credit Card, Investment, Debt)
- [x] **Account type labels** в categories.controller.ts → English
- [x] **Default account names** в accounts.service.ts → English (Cash, Bank Account)
- [x] **Default category names** в categories.service.ts → English (16 категорий)
- [x] **Export headers** в export.service.ts → English (Date, Type, Amount, etc.)
- [x] **Chat system prompt** → English (работает для любого языка, AI отвечает на языке пользователя)
- [x] **Chat context** (buildUserContext) → English labels
- [x] **Preset prompts** → bilingual map (en/ru), язык берётся из user.language
- [x] **AI voice/receipt system prompts** → English
- [x] **AI context builders** → English labels
- [x] **Receipt user text** → language-aware (en/ru map)
- [x] **Wishlist cooldown message** → i18n key
- [x] **DTO Swagger examples** → English
- [x] 0 ошибок TypeScript

### Багфиксы при написании тестов (2026-05-16)
- [x] **AccountsController**: добавлен `@UseGuards(JwtAuthGuard)` на `GET :id`, `POST`, `DELETE` — без них `req.user` был undefined
- [x] **CategoriesService**: `update/delete` проверяли `{ userId: { not: null } }` вместо `{ userId }` — любой юзер мог удалить чужую категорию
- [x] **WishlistService**: `reject()/purchase()` возвращали старые данные (до обновления БД) — исправлено на возврат обновлённой записи
- [x] **CategoriesService**: `create()` бросал raw `Error` вместо `AppException` — исправлено
- [x] **TransactionsService**: убраны `console.log` из продакшн-кода

### ESLint + Prettier для mobile (2026-05-18)
- [x] `.eslintrc.js` — eslint:recommended + @typescript-eslint + react + react-hooks + import/order
- [x] `.prettierrc` — single quotes, trailing comma all, 120 print width
- [x] `package.json` — 8 devDependencies (eslint, typescript-eslint, plugins, prettier)
- [x] `package.json` — 3 scripts (lint, lint:fix, format)

### Alert/Alert.alert → Toast полная замена (2026-05-18)
- [x] 10 вызовов `Alert.alert()` и `alert()` заменены в 6 файлах
- [x] family.tsx — 3 ошибки → `toast.showError()`, 1 confirm → `ConfirmModal`
- [x] analytics/index.tsx — 1 ошибка → `toast.showError()`
- [x] AiTransactionPreview.tsx — 2 ошибки → `toast.showError()`
- [x] ReceiptScanner.tsx — 3 ошибки → `toast.showError()`
- [x] export.ts — 1 success → `showGlobalSuccess()` (service file, non-React)
- [x] register.tsx — 1 ошибка → `toast.showError()`
- [x] 0 активных `Alert.alert`/`alert()` осталось в коде

### Unit-тесты mobile (2026-05-18)
- [x] **Инфраструктура**: Jest 29 + jest-expo preset, jest.config.js, jest.setup.js (моки RN модулей)
- [x] **formatters.test.ts** (18 тестов): formatCurrency, formatNumber, formatPercent, calculatePercent, getDaysRemaining, getInitials, truncateText, XP/level system
- [x] **transactionUtils.test.ts** (11 тестов): getTransactionCurrency (account/no-account), formatLifeHours (min/hours/days boundaries, zero/negative rate)
- [x] **authStore.test.ts** (17 тестов): login, register, loginMock, logout, checkAuth (demo/API/expired), updateHourlyRate, setUser, setGamification, setLoading
- [x] **dataStore.test.ts** (23 тестов): accounts CRUD, transactions, categories, goals, helpers (getTotalBalance, getMonthlyIncome/Expenses, getHourlyRate), wishlist, gamification, currency, achievements
- [x] **subscriptionStore.test.ts** (29 тестов): checkAccess (default/status features), isPremium, plan, showPaywall, closePaywall, fetchStatus, accountLimit, allowedAccountTypes, clearFamily
- [x] **98 тестов, все проходят** (`npm run test`)

### Landing Page — SpendWise (2026-05-19)
- [x] `landing/index.html` — полный редизайн в стиле 1Money, phone mockup, секции: Hero, Life-Cost, AI Advisor (chat demo), Incubator, Analytics (6 cards), Features (6 cards), How It Works, Premium, CTA, Footer
- [x] `landing/css/styles.css` — точные токены из themeStore.ts (dark #0A0A0F / light #F5F1EB), toggle тема, transition 0.3s, responsive 3 breakpoint
- [x] `landing/js/main.js` — theme toggle (localStorage sw-theme), language switcher (sw-lang), IntersectionObserver, navbar blur
- [x] `landing/i18n/` — 20 файлов с новой структурой ключей (lc, ai, inc, an, feat, prem, how, cta, footer)
- [x] Акцент на AI финансовый консультант (секция AI с чат-демо), подробная аналитика (6 карточек)
- [x] App name: SpendWise — Financial Tracker

### E2E тесты фиксы (2026-05-21)
- [x] Заменены русские имена на английские в app.e2e-spec.ts (5 блоков)
- [x] 'Наличные' → 'Cash', 'Банковский счёт' → 'Bank Account', 'Зарплата' → 'Salary', 'Продукты' → 'Groceries'
- [x] 86/86 E2E тестов теперь проходят

### Budget Module — редизайн (2026-05-21)
- [x] **Prisma**: Budget model (id, userId, categoryId, amount BigInt, month "YYYY-MM", unique userId+categoryId+month)
- [x] **Backend**: BudgetModule — CRUD + carry-forward + spent на лету (Prisma aggregate)
- [x] **Backend**: DTOs — CreateBudgetDto, UpdateBudgetDto
- [x] **Backend**: PremiumGuard на все endpoints
- [x] **Backend**: i18n ключи budget.* (EN+RU)
- [x] **Миграция**: `add_budget_model`
- [x] **Mobile**: budgetsService (`src/services/budgets.ts`)
- [x] **Mobile**: Budget type (`src/types/index.ts`)
- [x] **Mobile**: dataStore — budgets[], fetchBudgets, addBudget, updateBudget, deleteBudget, carryForwardBudgets
- [x] **Mobile**: Home виджет — мини-прогресс бары между Month Summary и Daily Pulse
- [x] **Mobile**: i18n ключи budget.* (EN+RU)
- [x] **AddTransaction hint** — limitInfo теперь читает из Budget store вместо category.monthlyLimit
- [x] **Categories screen** — прогресс-бар из Budget table вместо monthlyLimit на Category
- [x] **CategoryEditModal** — budgetAmount prop, сохранение через Budget API (addBudget/updateBudget/deleteBudget)
- [x] **Cron задача** — @Cron('0 0 1 * *') перенос бюджетов 1-го числа каждого месяца

### In-App Notifications (2026-05-21)
- [x] **Prisma**: NotificationType enum расширен (+ GOAL_COMPLETED, MONTHLY_SUMMARY)
- [x] **Backend**: NotificationsController — GET (paginated), PATCH read, PATCH read-all, GET unread-count
- [x] **Backend**: NotificationsService — CRUD + sendWishlistReady, sendBudgetAlert, sendBudgetOver, sendGoalCompleted, sendMonthlySummary
- [x] **Backend**: Триггер — budget alert при EXPENSE транзакции (>80% warn, >100% exceeded)
- [x] **Backend**: NotificationsModule подключён в AppModule
- [x] **Mobile**: notificationsService + notificationsStore (Zustand)
- [x] **Mobile**: Экран уведомлений `/main/notifications/` — FlatList, иконки по типу, relative time, mark all read
- [x] **Mobile**: Bell icon с red badge на Home header
- [x] **i18n**: notifications.* (EN+RU)

### Articles — Premium Access (2026-05-21)
- [x] **Prisma**: `isPremium Boolean @default(false)` на Article
- [x] **Backend**: GET /articles — возвращает isPremium флаг
- [x] **Backend**: GET /articles/:id — 403 если isPremium и юзер не премиум
- [x] **Backend**: Seed — 3 бесплатных + 1 премиум статья (Investing 101, EN+RU)
- [x] **Mobile**: 🔒 PRO badge на премиум статьях в Home Read tab
- [x] **Mobile**: Тап на премиум статью → PaywallModal (для free юзеров)
- [x] **i18n**: premiumRequired, articleNotFound (EN+RU)

### Регулярные транзакции (Recurring Rules) — 2026-05-24
- [x] **Prisma**: `RecurringRule` модель (id, userId, accountId, categoryId, amount BigInt, type, period WEEKLY/MONTHLY, dayOfWeek?, dayOfMonth?, isActive, nextRunDate, lastRunDate) + `RecurrencePeriod` enum
- [x] **Prisma**: `recurringRuleId` на Transaction (опциональное, onDelete SetNull)
- [x] **Миграция**: `20260522140217_add_recurring_rules`
- [x] **Backend RecurringModule**: controller, service, DTOs (CreateRecurringRuleDto, UpdateRecurringRuleDto)
- [x] **Backend CRUD**: GET /recurring, POST /recurring, PATCH /recurring/:id, DELETE /recurring/:id (keepTransactions опция)
- [x] **Backend pause/activate**: PATCH /recurring/:id/pause, PATCH /recurring/:id/activate (пересчёт nextRunDate)
- [x] **Backend preview**: GET /recurring/:id/preview (следующие 3 даты)
- [x] **Backend @Cron**: `0 6 * * *` — ежедневно создаёт транзакции для правил с nextRunDate <= сегодня
- [x] **Backend i18n**: recurring.* ключи (EN+RU+18 языков)
- [x] **Mobile types**: `RecurringRule`, `RecurrencePeriod` в `types/index.ts`
- [x] **Mobile service**: `src/services/recurring.ts` — getAll, create, update, pause, activate, delete, getPreview
- [x] **Mobile store**: dataStore — recurringRules[], fetchRecurringRules, addRecurringRule, updateRecurringRule, deleteRecurringRule, pauseRecurringRule, activateRecurringRule
- [x] **Mobile UI — RecurringRulesModal**: полноэкранная модалка (доступ из кнопки на Categories), форма создания, список активных/паузированных правил, pause/activate/delete
- [x] **Mobile UI — AddTransactionModal**: кнопка «Повторять» (repeat icon) в actionsRow → период MONTHLY/WEEKLY + выбор дня месяца
- [x] **Mobile UI — Transactions**: фильтр-чип «Регулярные» (↻ иконка) фильтрует по recurringRuleId
- [x] **Mobile i18n**: recurring.* секция (EN+RU)

## Бэклог

### Приоритет высокий — AI фичи (запрошено PM)
- [ ] **DeepSeek AI чат** — подключить DeepSeek API к бэкенду `chat/` модулю: system prompt с контекстом юзера, пресет-вопросы (bilingual en/ru), rate limiting (Redis), error handling (таймаут 30с, 2 retry), валидация JSON ответа
- [ ] **Speech-to-text транзакции** — голосовой ввод на мобайле → текст → DeepSeek → структурированная транзакция (сумма, категория, счёт) → предзаполнение AddTransactionModal. Бэкенд `ai/` модуль + `ParseVoiceDto` уже есть
- [ ] **Скан чеков** — фото чека через камеру → DeepSeek Vision API → распознавание позиций (название, сумма, дата) → маппинг в транзакции. Бэкенд `ai/` + `ParseReceiptDto` есть, мобайл `ReceiptScanner` компонент есть

### Приоритет высокий — UX/UI
- [ ] **Главный экран редизайн** — `home-screen-redesign`: переработка Home screen UX/UI (последняя очередь, после AI фич)

### Приоритет средний
- [ ] ~~Регулярные транзакции~~ *(реализовано 2026-05-24)*
- [ ] ~~Transfer между счетами~~ *(реализовано)*
- [ ] ~~Редактирование категорий~~ *(реализовано)*

### Приоритет средний — Публикация
- [ ] **Подготовка к релизу** — иконка приложения, splash screen, screenshots для сторов, metadata (название, описание, ключевые слова) на EN + RU
- [ ] **RuStore публикация** — регистрация девелопер аккаунта, загрузка APK/AAB, заполнение карточки приложения, прохождение модерации, ссылка на лендинг
- [ ] **AppGallery публикация (Huawei)** — регистрация Huawei Developer, интеграция HMS Core (если нужно), загрузка APK, прохождение ревью
- [ ] **App Store публикация** — Apple Developer аккаунт, Xcode архивация, TestFlight бета-тестирование, review guidelines compliance, возрастной рейтинг
- [ ] **Google Play публикация** — Google Play Console, signing key, AAB upload, content rating, data safety form, review
- [ ] **Лендинг хостинг** — деплой `landing/` на Vercel/Netlify/GitHub Pages, кастомный домен, SSL

### Приоритет низкий / Premium
- [ ] **Семейный бюджет** (Family module) — бэкенд файлы есть, модуль не подключён в AppModule
- [ ] **Пуш-уведомления** — Firebase Cloud Messaging / HMS Push, настройка на бэкенде, мобайл permissions
- [ ] **Оффлайн-режим** — локальное кэширование транзакций, очередь синхронизации, conflict resolution
- [ ] **Виджеты** — iOS Widgets (WidgetKit) / Android Widgets (Glance) — баланс, бюджет, последние траты
- [ ] **Депозиты/кредиты** — модели удалены из Prisma schema, требуют восстановления и миграции
- [ ] **Прогнозирование** (ForecastScenario) — модель удалена, требует восстановления
---
