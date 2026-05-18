# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (бэкенд + мобайл)
- **E2E тесты: 86 тестов, все проходят** (`npm run test:e2e`)
- **Геймификация полностью удалена** — приложение серьёзное, без игровых механик
- **Полный бэкенд-рефакторинг завершён** — 61 проблема из аудита исправлена

## Ключевые изменения (бэкенд-рефакторинг 2026-05-16)
- **Все критические проблемы исправлены**: атомарные транзакции, DTO валидация, guards, error handling
- **DTOs созданы для ВСЕХ endpoints**: accounts, transactions, users, wishlist, goals, categories, chat, AI, family, articles, subscription, life-cost
- **Transaction atomicity**: create/update/delete обёрнуты в `prisma.$transaction()`
- **Error handling унифицирован**: все raw Error/HttpException/BadRequestException → AppException с i18n ключами
- **Redis graceful degradation**: все методы обёрнуты в try/catch
- **OpenAI error handling**: try/catch вокруг всех API вызовов
- **PremiumGuard**: использует AppException + i18n вместо hardcoded strings, reject при отсутствии userId
- **JWT strategy**: теперь включает `currency` в payload (req.user.currency)
- **CORS**: configurable через `CORS_ORIGINS` env, dev mode = allow all
- **ConfigService**: replaces all `process.env` direct access
- **Pagination**: GET /transactions теперь возвращает `{ items, total, page, limit, totalPages }`
- **getSummary**: использует Prisma `groupBy` вместо загрузки всех транзакций в память
- **Chat history pagination**: GET /chat/messages с page/limit
- **Goal deadline default**: +6 месяцев вместо `new Date()` (сразу просрочено)
- **Goal contribution validation**:拒绝 negative amounts
- **`as any` removed**: All type casts replaced with proper Prisma enums
- **console.log removed**: All replaced with NestJS Logger
- **i18n async**: `fs/promises` вместо sync file I/O
- **Duplicate icons fixed**: убран дубликат `game-controller` из AVAILABLE_ICONS
- **Subscription toggle**: endpoint оставлен для dev/test, activate требует body DTO
- **isPremium fix**: теперь `true` для PREMIUM_FAMILY тоже

## Статус
- 0 ошибок TypeScript
- 86/86 E2E тестов проходят
- 61/61 проблем из аудита исправлено
