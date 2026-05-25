# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 новых ошибок от recurring (существующие 567 от className/NativeWind)
- **E2E тесты: 86/86 проходят**
- **Unit тесты: 98 тестов, все проходят** (`npm run test`)

## Спринт — текущие задачи

### Выполнено
- [x] **Регулярные транзакции** — полная реализация (см. детали ниже)

### В очереди
- _пусто_

## Recurring Rules Module — детали
- **Prisma**: `RecurringRule` модель + `RecurrencePeriod` enum (WEEKLY/MONTHLY)
- **Prisma**: `recurringRuleId` поле на Transaction (опциональное, SetNull при удалении правила)
- **Миграция**: `20260522140217_add_recurring_rules`
- **Backend**: `src/recurring/` — RecurringModule, RecurringController, RecurringService, DTOs
- **Endpoints**: GET /recurring, POST /recurring, PATCH /recurring/:id, DELETE /recurring/:id, PATCH /recurring/:id/pause, PATCH /recurring/:id/activate, GET /recurring/:id/preview
- **@Cron**: Каждый день 6:00 — ищет активные правила с nextRunDate <= сегодня, создаёт транзакции
- **Backend i18n**: recurring.* ключи EN+RU+18 языков
- **Mobile types**: RecurringRule, RecurrencePeriod в types/index.ts
- **Mobile service**: `src/services/recurring.ts`
- **Mobile store**: dataStore — recurringRules[], fetchRecurringRules, addRecurringRule, deleteRecurringRule, pauseRecurringRule, activateRecurringRule
- **Mobile UI**: RecurringRulesModal (доступ из кнопки на Categories), тогл «Повторять» в AddTransactionModal, фильтр-чип «Регулярные» на Transactions
- **Mobile i18n**: recurring.* секция EN+RU

## Статус
- 0 новых TypeScript ошибок
- 98/98 unit тестов проходят
- 86/86 E2E тестов проходят
