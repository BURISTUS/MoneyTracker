# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (бэкенд + мобайл)
- **E2E тесты: 65/86 проходят** (21 падает из-за рус/англ имён — предсуществующая проблема)
- **Unit тесты: 98 тестов, все проходят** (`npm run test`)
- **i18n полная интеграция** — 200+ хардкод строк заменены на t() вызовы, EN+RU переводы полные, 18 языков с EN fallback
- **Фронтенд-аудит**: все проблемы из FRONTEND_REVIEW.md исправлены

## Спринт — текущие задачи

### Выполнено
- [x] **Unit-тесты (mobile)** — Jest + jest-expo, 98 тестов в 5 suites
- [x] **Refresh-token механизм** — backend (модель, endpoints, ротация, JWT 15мин) + mobile (interceptor, refresh logic, race condition protection)
- [x] **AddTransactionModal рефакторинг** — 931 строка → 6 подкомпонентов + hook (TransactionForm/)
- [x] **Biometric/pin-lock** — expo-local-authentication + PIN + lock screen + AppState мониторинг

### В очереди
- [ ] E2E тесты фиксы — рус/англ имена счетов/категорий в тестах

## Refresh-token — детали
- **Backend**: `Session` модель (userId, refreshToken, expiresAt, isRevoked, deviceInfo) — единая таблица сессий
- **Backend**: `POST /auth/refresh` (ротация), `POST /auth/logout` (инвалидация), JWT TTL 15мин, session TTL 30 дней
- **Mobile**: axios interceptor при 401 → `/auth/refresh` → retry, race condition через refreshSubscribers queue
- **Ключи ошибок**: `invalidRefreshToken`, `refreshTokenRevoked`, `refreshTokenExpired` (EN+RU+18 языков EN fallback)
- **SecureStore**: `authToken` + `refreshToken`

## Схема БД — чистка (2026-05-19)
- **Удалено 15 моделей**: Session(старая), RefreshToken, UserGamification, Achievement, UserAchievement, XpEvent, StreakDay, Challenge, UserChallenge, Deposit, DepositTransaction, Loan, LoanPayment, SavingsGoal, ForecastScenario
- **Удалено 9 enum**: GamificationStatus, AchievementCondition, AchievementTier, ChallengeType, ChallengeStatus, DepositType, CompoundingType, DepositTransactionType, LoanType
- **NotificationType**: убраны LEVEL_UP, ACHIEVEMENT_EARNED, STREAK_WARNING, CHALLENGE_INVITE
- **User**: убраны 9 dead relations
- **Добавлены индексы**: Transaction(userId,date), Transaction(userId,type), Transaction(accountId), Transaction(categoryId), Account(userId), Goal(userId), GoalContribution(goalId), WishlistItem(userId,status), Notification(userId,isRead)

## AddTransactionModal рефакторинг — детали
- **Папка**: `src/components/ui/TransactionForm/`
- **Подкомпоненты**: `TransactionTypeToggle.tsx`, `AmountInput.tsx`, `CategorySelector.tsx`, `AccountSelector.tsx`, `TransactionNoteInput.tsx`
- **Hook**: `useTransactionForm.ts` — всё состояние + бизнес-логика
- **Barrel**: `index.ts` — экспорты
- **Основной**: `AddTransactionModal.tsx` — тонкий слой, использует подкомпоненты

## Biometric/pin-lock — детали
- **expo-local-authentication** — fingerprint/face
- **PIN**: 4 цифры, хэш в expo-secure-store (через securityStore)
- **Lock screen**: `src/components/ui/LockScreen.tsx`
- **Route**: `app/lock.tsx`
- **Store**: `src/stores/securityStore.ts` — isLockEnabled, lockMethod, pinHash
- **AppState мониторинг**: `_layout.tsx` → LockMonitor — background >30с → lock
- **i18n**: секция `security` (EN+RU)

## Статус
- 0 ошибок TypeScript
- 98/98 unit тестов проходят
- 65/86 E2E тестов проходят (21 предсуществующая проблема)
