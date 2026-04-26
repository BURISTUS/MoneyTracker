# Прогресс

## Выполненные задачи

### Инициализация проекта
- [x] Репозиторий создан (NestJS backend + Expo mobile)
- [x] Docker Compose: PostgreSQL 15 + Redis 7 + Backend
- [x] Prisma schema (21 модель, 13 enum)
- [x] Backend модули: Auth, Users, Accounts, Categories, Transactions, Budget, Goals, Wishlist, Gamification, Life-Cost
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
- [x] Home dashboard — «Осознанный пульт управления»: баланс времени, зона решений, морозилка, быстрые действия
- [x] Transactions dashboard — DonutChart, период (день/неделя/месяц/год), тип toggle, список с группировкой по датам
- [x] AddTransactionModal — numpad с мат.операциями (+−×÷=), life-hours, выбор категории/счёта/заметки, DatePickerModal
- [x] TransactionActionModal — просмотр/редактирование описания, удаление с подтверждением, life-hours
- [x] Categories list — группировка по типу (расходы/доходы), системные/личные
- [x] Categories create — TextInput, палитра 18 цветов, каталог иконок (64), тип
- [x] Categories chart — реальные данные с прогресс-барами, life-hours
- [x] Wishlist/Incubator — cooldown 7 дней, купить/отказаться, life-hours
- [x] Profile — ссылка на категории
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

### Transaktionen — редактирование/удаление
- [x] TransactionActionModal — просмотр, редактирование описания, удаление с Alert
- [x] dataStore: deleteTransaction, updateTransaction методы
- [x] Исправлен apiPost → apiPatch для update endpoint

### Life-hours интеграция (доработка)
- [x] На каждом transaction card в списке (⏱ X ч работы)
- [x] Summary под DonutChart на dashboard (⏱ X ч работы)

### Wishlist — описание (backend)
- [x] Prisma schema: `description String @default("")` в WishlistItem
- [x] Миграция `20260417121332_add_wishlist_description` применена
- [x] Backend wishlist controller/service принимает description при создании
- [x] Mobile wishlist отправляет description в API

### Hourly rate — сохранение на сервер
- [x] `PATCH /users/hourly-rate` — endpoint уже существовал
- [x] `lifeCostService.updateHourlyRate(rateKopecks)` — новый метод в mobile
- [x] `dataStore.setHourlyRate()` — вызывает API (+ fallback для демо-режима)
- [x] Life-cost калькулятор: кнопка «Сохранить» → API + локальный state

### CategoryIcon — замена emoji на vector icons
- [x] `<CategoryIcon>` component (`src/components/ui/CategoryIcon.tsx`) — рендерит MaterialCommunityIcons
- [x] categories/index.tsx — CategoryIcon вместо emoji circle
- [x] categories/chart.tsx — CategoryIcon вместо emoji circle
- [x] transactions/index.tsx — CategoryIcon вместо emoji circle
- [x] AddTransactionModal.tsx — CategoryIcon в кнопке категории и в picker-сетке
- [x] TransactionActionModal.tsx — CategoryIcon вместо emoji circle
- [x] DonutChart.tsx — CategoryIcon вокруг donut вместо emoji
- [x] CategoryIcon.icon prop: `string | null` (совместимость с Category.icon)
- [x] Backend: seed системных категорий обновлён на `material:xxx` формат
- [x] Backend: upsert обновляет icon у существующих категорий

### CurrencyModule — все валюты из API + CurrencyPicker
- [x] Backend: `refreshRates()` использует `upsert` вместо `updateMany` — все ~300+ валют сохраняются
- [x] Backend: `classifyCurrency()` — классификация FIAT/CRYPTO/METAL по множествам кодов
- [x] Backend: Batch upsert по 50 записей параллельно
- [x] Backend: `GET /currency/list?search=&type=&popular=&page=&limit=` — пагинированный список с поиском
- [x] Mobile: `CurrencyPicker` компонент — модальный пикер с поиском, табами, пагинацией
- [x] Mobile: Выбор основной валюты в профиле → CurrencyPicker → `PATCH /users/profile`
- [x] Mobile: `setUserCurrency()` сохраняет на сервер через API
- [x] Mobile: Валюта при создании счёта — кнопка в BottomSheet, `filterType="FIAT"`
- [x] Mobile: `setCurrencyConfig()` принимает динамический символ из API

### NativeWind/gluestack-ui полная миграция
- [x] gluestack-ui v3 + NativeWind v4 настроены (tailwind.config.js, global.css, babel, metro)
- [x] 14 экранов переписаны на Tailwind className
- [x] 8 feature-компонентов мигрированы (XPBar, AccountCard, TransactionItem, WishlistCard, GoalCard, BudgetCard, StatCard, BalanceHero)
- [x] 4 UI-модалки мигрированы (AddTransactionModal, TransactionActionModal, DatePickerModal, CurrencyPicker)
- [x] 2 chart-компонента мигрированы (DonutChart, SpendingChart)
- [x] Loading.tsx, TabBar.tsx, CreateCategoryModal.tsx мигрированы
- [x] Budget screen — inline ProgressBar
- [x] Удалены 12 старых UI-компонентов (BottomSheet, Button, Text, Input, Card, Icon, Chip, Divider, Badge, Avatar, Screen, ProgressBar)
- [x] Удалена старая тема src/theme/ (colors, spacing, typography, shadows, index)
- [x] Удалён Header.tsx (не использовался)
- [x] CategoryIcon.tsx — не зависит от темы (vector icons)

### Миграция — критические фиксы (2026-04-19)
- [x] react@19.1.4 → react@19.1.0 (версия renderer в react-native@0.81.5 строго 19.1.0)
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
- [x] Фильтр-чипы компактные (h-6 fixed height, text-[11px])
- [x] TabBar: убран синий прямоугольник, активный таб = цветная иконка + точка снизу

### Редактирование счетов
- [x] Accounts screen — тап по карточке открывает модалку редактирования (название + баланс)
- [x] При изменении баланса автоматически рассчитывается разница и предлагается добавить транзакцию
- [x] Transaction modal — показывает тип (доход/расход), сумму, поле для заметки, кнопки "Пропустить" / "Добавить"
- [x] FlatList для списка счетов (оптимизация рендеринга)
- [x] dataStore: updateAccount метод уже существовал, используется напрямую

### Базовые счета при регистрации
- [x] Убран третий дефолтный счёт (Альфа/CREDIT)
- [x] Оставлено два базовых счёта: "Наличные" (CASH) и "Банковский счёт" (BANK)
- [x] Бэкенд `accounts.service.ts` метод `createDefaultsForUser` обновлён

### Бюджеты — месячный лимит по категории
- [x] Backend `BudgetService` — упрощённое создание (categoryId + amount + alertThreshold), period=MONTHLY, даты start/end текущего месяца авто
- [x] Backend `GET /budgets` — inline прогресс за текущий месяц (spent, remaining, percentUsed, isOverBudget, isNearLimit)
- [x] Backend `PATCH /budgets/:id` — редактирование суммы/порога
- [x] Backend DTO `CreateBudgetDto`, `UpdateBudgetDto` с class-validator
- [x] Mobile `BudgetService` (`src/services/budget.ts`) — API wrapper
- [x] Mobile `dataStore` — `fetchBudgets`, `createBudget`, `updateBudget`, `deleteBudgetApi`
- [x] Mobile `initializeData` — загружает бюджеты
- [x] Mobile `BudgetScreen` — список с прогресс-барами, FAB «Добавить», AddBudgetModal (категория + сумма + порог 50/70/80/90%), редактирование/удаление
- [x] Mobile `TransactionsScreen` — dot-индикатор лимита рядом с категорией (зелёный <80%, жёлтый 80-100%, красный >100%)
- [x] Mobile `AddTransactionModal` — прогресс-бар остатка лимита под кнопкой категории

### Цели (Goals) — полная реализация
- [x] Backend `GoalsService` — `serializeGoal` для BigInt→string, inline прогресс (percentComplete, remaining)
- [x] Backend `GET /goals` — все цели с прогрессом
- [x] Backend `POST /goals` — создание (name, targetAmount, deadline)
- [x] Backend `PATCH /goals/:id` — редактирование name/target/deadline
- [x] Backend `PATCH /goals/:id/progress` — пополнение currentAmount
- [x] Backend `DELETE /goals/:id` — удаление
- [x] Backend DTO `CreateGoalDto`, `UpdateGoalDto`, `UpdateGoalProgressDto`
- [x] Prisma schema: `deadline` теперь `@default(now())` (опционально при создании)
- [x] Mobile `GoalsService` (`src/services/goals.ts`) — API wrapper
- [x] Mobile `dataStore` — `fetchGoals`, `createGoal`, `updateGoalApi`, `addGoalProgress`, `deleteGoalApi`
- [x] Mobile `initializeData` — загружает цели
- [x] Mobile `GoalsScreen` — список с прогрессом, FAB «+», модалки: создать (name + target + deadline), редактировать (name + target + deadline + удалить), пополнить (amount)

### Дефолтные категории для существующего юзера
- [x] Backend `POST /categories/defaults` — endpoint для создания дефолтных категорий текущему юзеру
- [x] `createDefaultsForUser` теперь пропускает существующие категории по имени (не создаёт дубли)
- [x] Новые юзеры получают категории автоматически при регистрации (через `auth.service.ts`)

## Бэклог
- [ ] Transfer между счетами (TransactionType.TRANSFER)
- [ ] Редактирование категорий
- [ ] Семейный бюджет (Family module)
- [ ] Депозиты/кредиты (Deposit/Loan modules)
- [ ] Прогнозирование (ForecastScenario)
- [ ] Достижения и челленджи
- [ ] Уведомления
