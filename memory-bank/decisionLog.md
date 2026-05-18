# Журнал решений

## 2026-05-16: Бэкенд-рефакторинг (61 проблема из аудита)

### D-01: DTOs с class-validator для ВСЕХ endpoints
- **Решение**: Создать class-validator DTO классы для каждого POST/PATCH endpoint
- **Причина**: ValidationPipe с `whitelist: true` работает ТОЛЬКО с class-validator DTO. TypeScript интерфейсы дают нулевую runtime защиту. Все inline body types заменены на DTO.
- **Альтернатива**: Zod схемы (отклонено — project convention: class-validator + NestJS)

### D-02: Transaction atomicity через `prisma.$transaction()`
- **Решение**: Обернуть create/update/delete в interactive transactions
- **Причина**: Без $transaction — краш между операциями (insert transaction + update balance) оставляет неконсистентные данные. Финансовые данные требуют атомарности.

### D-03: Error handling — единый AppException
- **Решение**: Заменить все raw Error, HttpException, BadRequestException на AppException с i18n ключами
- **Причина**: Единый формат ошибок `{ success: false, statusCode, error, message }` с i18n. HttpExceptionFilter обрабатывает AppException и переводит ключи.

### D-04: Redis graceful degradation
- **Решение**: Все методы RedisService обёрнуты в try/catch, возвращают null/0/{} при ошибке
- **Причина**: Redis — вспомогательный сервис (cache, rate limiting). Его недоступность не должна крашить основной функционал.

### D-05: ConfigService вместо process.env
- **Решение**: Inject ConfigService во все модули, использовать get<T>()
- **Причина**: Конвенция NestJS — ConfigService для env vars. Прямой доступ к process.env не позволяет тестировать и нарушает DI.

### D-06: JWT payload расширен
- **Решение**: Добавить `currency` в validate() JwtStrategy
- **Причина**: `req.user.currency` использовался в accounts controller, но всегда был undefined — JWT payload содержал только `{ id, email, name }`.

### D-07: CORS через env
- **Решение**: `CORS_ORIGINS` env variable для production, `true` для development
- **Причина**: `origin: true` безусловно — security risk в production.

### D-08: Goals DTOs подключены к контроллеру
- **Решение**: Использовать CreateGoalDto, UpdateGoalDto, UpdateGoalProgressDto в GoalsController
- **Причина**: DTOs существовали в `goals/dto/` но не были подключены — контроллер использовал inline типы. `BigInt(undefined)` крашил.

### D-09: Pagination для GET /transactions
- **Решение**: Добавить page/limit параметры, возвращать `{ items, total, page, limit, totalPages }`
- **Причина**: Без пагинации — OOM при больших объёмах. Frontend должен адаптироваться.

### D-10: Goal deadline default = +6 месяцев
- **Решение**: Вместо `new Date()` (сразу просрочено) — `new Date() + 6 месяцев`
- **Причина**: `new Date()` как deadline = цель сразу «просрочена» — плохой UX.

### D-12: Устранение хардкодов — English как lingua franca бэкенда
- **Решение**: Все hardcoded Russian строки в бэкенде заменены на English. AI prompts переведены на English. Preset prompts — bilingual map (en/ru). Пользовательские данные (имена счетов, категорий) — English.
- **Причина**: Бэкенд — multi-language API (20 языков). Russian хардкоды ломают UX для non-Russian пользователей. English — universal, AI модели понимают English лучше. System prompt на English + "respond in user's language" — работает корректно для любого языка.
- **Альтернатива**: Backend i18n service (отклонено — over-engineering для текущего масштаба, translations уже на фронте)

### D-13: KNOWN_SYMBOLS export из currency.service
- **Решение**: Экспортировать `KNOWN_SYMBOLS` из currency.service.ts и импортировать в chat.service.ts
- **Причина**: Карта символов валют дублировалась (5 валют в chat vs 60+ в currency). DRY принцип.
- **Решение**: Оставить `POST /subscription/toggle` для dev/test/demo
- **Причина**: Endpoint нужен для E2E тестов и демо-режима. В production нужно добавить payment validation guard.
