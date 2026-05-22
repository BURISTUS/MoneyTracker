# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (бэкенд + мобайл)
- **E2E тесты: 86/86 проходят** (фикс рус→англ имён)
- **Unit тесты: 98 тестов, все проходят** (`npm run test`)
- **i18n полная интеграция** — 200+ хардкод строк заменены на t() вызовы, EN+RU переводы полные, 18 языков с EN fallback
- **Фронтенд-аудит**: все проблемы из FRONTEND_REVIEW.md исправлены

## Спринт — текущие задачи

### Выполнено
- [x] **E2E тесты фиксы** — рус/англ имена счетов/категорий заменены на английские (Cash, Bank Account, Salary, Groceries)
- [x] **Budget Module (backend)** — Prisma Budget model + BudgetModule (CRUD + carry-forward + spent на лету)
- [x] **Budget Widget (mobile Home)** — виджет на Home с мини-прогресс барами, premium only
- [x] **Budget Service + Store (mobile)** — budgetsService + dataStore методы

### В очереди
- _пусто_

## Notifications Module — детали
- **Prisma**: NotificationType enum расширен (WISHLIST_READY, BUDGET_ALERT, GOAL_COMPLETED, MONTHLY_SUMMARY)
- **Backend**: NotificationsController (GET, PATCH read, PATCH read-all, GET unread-count)
- **Backend**: NotificationsService — create, getByUser (paginated), markAsRead, markAllAsRead, getUnreadCount, deleteOldNotifications
- **Backend**: Триггер budget alert при создании EXPENSE транзакции (>80% и >100%)
- **Backend**: NotificationsModule подключён в AppModule
- **Backend**: Тексты English
- **Mobile**: notificationsService (`src/services/notifications.ts`)
- **Mobile**: notificationsStore (Zustand)
- **Mobile**: Экран `/main/notifications/` — FlatList, иконки по типу, relative time, mark all read
- **Mobile**: Bell icon с бейджем на Home header
- **i18n**: notifications.* ключи (EN+RU)
- **Миграция**: `add_notification_types`, `add_article_premium`

## Budget Module — детали
- **Prisma**: `Budget` модель (id, userId, categoryId, amount BigInt, month "YYYY-MM", unique userId+categoryId+month)
- **Backend**: `src/budget/` — BudgetModule, BudgetController, BudgetService, DTOs
- **Endpoints**: GET /budgets?month=, POST /budgets, PATCH /budgets/:id, DELETE /budgets/:id, POST /budgets/carry-forward
- **spent**: считается на лету через Prisma aggregate (EXPENSE transactions за месяц)
- **Premium**: все endpoints защищены PremiumGuard
- **Mobile service**: `src/services/budgets.ts`
- **Mobile store**: dataStore — budgets[], fetchBudgets, addBudget, updateBudget, deleteBudget, carryForwardBudgets
- **Home виджет**: между Month Summary и Daily Pulse — мини-карточки с прогресс барами, CTA если нет бюджетов
- **i18n**: budget.* ключи добавлены EN+RU (backend + mobile)
- **Миграция**: `add_budget_model`

## Статус
- 0 ошибок TypeScript
- 98/98 unit тестов проходят
- 86/86 E2E тестов проходят
