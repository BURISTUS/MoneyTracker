# Прогресс

## Выполненные задачи

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

### Багфиксы при написании тестов (2026-05-16)
- [x] **AccountsController**: добавлен `@UseGuards(JwtAuthGuard)` на `GET :id`, `POST`, `DELETE` — без них `req.user` был undefined
- [x] **CategoriesService**: `update/delete` проверяли `{ userId: { not: null } }` вместо `{ userId }` — любой юзер мог удалить чужую категорию
- [x] **WishlistService**: `reject()/purchase()` возвращали старые данные (до обновления БД) — исправлено на возврат обновлённой записи
- [x] **CategoriesService**: `create()` бросал raw `Error` вместо `AppException` — исправлено
- [x] **TransactionsService**: убраны `console.log` из продакшн-кода

## Бэклог

### Приоритет высокий (запрошено PM)
- [ ] **DeepSeek AI инфраструктура** — `deepseek-ai-section`: чат, пресеты, rate limiting, system prompt
- [ ] **Speech-to-text транзакции** — `speech-to-text-transactions`: голосовой ввод → AI → предзаполнение формы
- [ ] **Скан чеков** — `receipt-scanning`: фото → DeepSeek Vision → позиции → транзакции
- [ ] **Главный экран** — `home-screen-redesign`: переработка UX/UI (последняя очередь)
- [ ] **Бюджеты — редизайн** — `budget-rethink`: inline indicators, возможно удаление отдельной вкладки

### Приоритет средний (аналитические находки)
- [ ] Transfer между счетами (TransactionType.TRANSFER) — `transfer-accounts`
- [ ] Редактирование категорий
- [ ] Регулярные транзакции — `recurring-transactions`
- [ ] Уведомления (in-app) — `notifications-module`

### Приоритет низкий / Premium
- [ ] Семейный бюджет (Family module) — `family-module`
- [ ] Депозиты/кредиты (Deposit/Loan modules) — `deposits-loans`
- [ ] Прогнозирование (ForecastScenario)
- [ ] Пуш-уведомления
- [ ] Оффлайн-режим
- [ ] Виджеты
---
