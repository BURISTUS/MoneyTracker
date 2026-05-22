# Backend Code Audit Report

**Дата**: 2026-05-16
**Аудитор**: AI
**Файлов проверено**: 74 TypeScript файлов
**Проблем найдено**: 61

---

## Статистика

| Severity   | Count |
|------------|-------|
| CRITICAL   | 7     |
| HIGH       | 14    |
| MEDIUM     | 26    |
| LOW        | 14    |

| Категория          | Count |
|--------------------|-------|
| race-condition     | 9     |
| security           | 12    |
| error-handling     | 12    |
| logic-bug          | 4     |
| unfinished         | 2     |
| architecture       | 2     |
| performance        | 8     |
| data-integrity     | 4     |
| code-quality       | 12    |

---

## CRITICAL

### C-01. Non-atomic transaction creation with balance update
- **Файл**: `transactions/transactions.service.ts:65-87`
- **Категория**: race-condition
- `create()` сначала вставляет транзакцию (line 65), потом отдельным запросом обновляет баланс (line 84). Две независимые DB операции.
- **Impact**: Если сервер упадёт между ними — транзакция существует, но баланс неправильный. Финансовые данные неконсистентны.
- **Fix**: Обернуть в `prisma.$transaction()`. Метод `transfer()` уже показывает правильный паттерн.

### C-02. Non-atomic transaction update with balance adjustment
- **Файл**: `transactions/transactions.service.ts:92-131`
- **Категория**: race-condition
- `update()` делает 3 отдельные DB операции: (1) revert old balance, (2) apply new balance, (3) update transaction record. Ни одна не в `$transaction()`.
- **Impact**: Краш между шагами — double-counted или пропущенные изменения баланса. Конкурентные обновления дают неверный баланс.
- **Fix**: Обернуть в `prisma.$transaction()`.

### C-03. Non-atomic transaction deletion with balance revert
- **Файл**: `transactions/transactions.service.ts:134-145`
- **Категория**: race-condition
- `delete()` возвращает баланс, потом удаляет транзакцию. Если revert успешен но deletion падает — баланс изменён за транзакцию которая ещё существует.
- **Impact**: Неконсистентный баланс.
- **Fix**: Обернуть в `prisma.$transaction()`.

### C-04. Account update принимает raw Prisma.AccountUpdateInput
- **Файл**: `accounts/accounts.controller.ts:60`
- **Категория**: security
- `update()` принимает `@Body() body: Prisma.AccountUpdateInput` без DTO валидации. Prisma тип включает `balance`, `userId` и т.д. `ValidationPipe` с `whitelist: true` работает ТОЛЬКО с class-validator DTO классами — plain TypeScript interface даёт нулевую runtime защиту.
- **Impact**: Юзер может отправить `{"balance": 99999999}` или `{"userId": "чужой-id"}`.
- **Fix**: Создать DTO класс с `class-validator` декораторами.

### C-05. Subscription activate — нет проверки оплаты
- **Файл**: `subscription/subscription.controller.ts:28-41`
- **Категория**: security
- `POST /subscription/activate` позволяет любому авторизованному юзеру активировать premium. `transactionId` принимается но не валидируется.
- **Impact**: Любой юзер может дать себе premium бесплатно.
- **Fix**: Добавить валидацию payment или admin guard.

### C-06. Subscription toggle — нет авторизации
- **Файл**: `subscription/subscription.controller.ts:43-48`
- **Категория**: security
- `POST /subscription/toggle` позволяет любому юзеру переключать Free -> Premium -> Premium Family -> Free.
- **Impact**: Полный bypass платёжной системы.
- **Fix**: Admin guard или убрать endpoint.

### C-07. Article CRUD — нет admin guard
- **Файл**: `articles/articles.controller.ts:29-52`
- **Категория**: security
- POST, PATCH, DELETE защищены только `JwtAuthGuard`. Любой юзер может создавать, изменять и удалять статьи.
- **Impact**: Инъекция контента, удаление всех статей.
- **Fix**: Добавить admin role guard.

---

## HIGH

### H-01. Race condition в регистрации (email uniqueness)
- **Файл**: `auth/auth.service.ts:21-31`
- **Категория**: race-condition
- `findByEmail()` check и `create()` — отдельные операции. Два параллельных запроса с одним email могут оба пройти проверку.
- **Fix**: Ловить Prisma P2002 (unique constraint violation).

### H-02. Non-atomic user creation with defaults
- **Файл**: `auth/auth.service.ts:27-35`
- **Категория**: race-condition
- Создание юзера, дефолтных счетов и категорий — 3 отдельных DB операции.
- **Impact**: Новый юзер может остаться без счетов или категорий.

### H-03. Нет валидации на update profile
- **Файл**: `users/users.controller.ts:44-53`
- **Категория**: security
- Body type — plain TypeScript interface, не class-validator DTO. `ValidationPipe` не может его валидировать.
- **Impact**: Можно модифицировать `email`, `password`, `id`.

### H-04. Нет валидации на hourly rate update
- **Файл**: `users/users.controller.ts:60`
- **Категория**: security
- `{ hourlyRate: number }` без DTO. Нет проверки что число неотрицательное.

### H-05. Нет валидации на account creation
- **Файл**: `accounts/accounts.controller.ts:52`
- **Категория**: security
- Inline type без DTO. `type` кастится `as any`. Невалидные типы счетов в БД.

### H-06. Нет валидации на transaction endpoints
- **Файл**: `transactions/transactions.controller.ts:72-101`
- **Категория**: security
- Create, update, transfer — inline body types без DTO. `BigInt(body.amount)` может дать NaN.

### H-07. Goals DTOs существуют но не используются
- **Файл**: `goals/goals.controller.ts:30-64`
- **Категория**: security
- DTOs лежат в `src/goals/dto/` но контроллер использует inline типы. `BigInt(undefined)` -> crash.

### H-08. Нет валидации на wishlist create
- **Файл**: `wishlist/wishlist.controller.ts:24`
- **Категория**: security
- `BigInt(body.price)` может дать NaN.

### H-09. Нет PremiumGuard на chat endpoints
- **Файл**: `chat/chat.controller.ts:14-36`
- **Категория**: security
- `getMessages` и `clearMessages` не имеют premium проверки.

### H-10. Нет PremiumGuard на AI endpoints
- **Файл**: `ai/ai.controller.ts:12-57`
- **Категория**: security
- Нет `@RequirePremium('AI_VOICE')` / `@RequirePremium('AI_RECEIPT')`.

### H-11. Нет FAMILY feature check
- **Файл**: `family/family.controller.ts:13-41`
- **Категория**: security
- Любой free юзер может создать/присоединиться к семье. Bypass `FAMILY` feature gate.

### H-12. Нет error handling для Redis
- **Файл**: `redis/redis.service.ts:30-73`
- **Категория**: error-handling
- Ни один метод не имеет try/catch. Redis недоступен -> unhandled exception -> 500.
- **Fix**: try/catch + graceful degradation.

### H-13. Нет try/catch вокруг OpenAI API calls
- **Файл**: `ai/ai.service.ts:129-142, 162-182`
- **Категория**: error-handling
- Сетевые ошибки, таймауты -> raw OpenAI SDK error messages leak.

### H-14. Нет пагинации на transactions list
- **Файл**: `transactions/transactions.service.ts:25`
- **Категория**: performance
- `findAll()` возвращает ВСЕ транзакции с `include: { account: true, category: true }`. Нет skip/take.

---

## MEDIUM

### M-01. CORS позволяет все origins
- **Файл**: `main.ts:23`
- `origin: true` без проверки окружения.

### M-02. PremiumGuard пропускает если userId missing
- **Файл**: `common/premium.guard.ts:20`
- `if (!userId) return true` — если `request.user` undefined, guard разрешает доступ.

### M-03. Хардкод русский в PremiumGuard
- **Файл**: `common/premium.guard.ts:30`
- Хардкод строка вместо i18n.

### M-04. PremiumGuard использует HttpException вместо AppException
- **Файл**: `common/premium.guard.ts:27-37`
- Сообщение не пройдёт через i18n фильтр.

### M-05. process.env напрямую вместо ConfigService
- **Файлы**: `main.ts:58`, `redis/redis.service.ts:10-13`, `chat/chat.service.ts:48`, `ai/ai.service.ts:74`
- Нарушает конвенцию проекта.

### M-06. req.user.currency может быть undefined
- **Файл**: `accounts/accounts.controller.ts:36`
- JWT strategy attachит только `{ id, email, name }` — `currency` отсутствует.

### M-07. Лишний запрос в getTotalBalance
- **Файл**: `accounts/accounts.controller.ts:33-37`
- `const user = await this.accountsService.findAll(req.user.id)` — результат не используется.

### M-08. Race condition в account creation (count check)
- **Файл**: `accounts/accounts.service.ts:42-56`
- Count check и create — отдельные операции. Параллельные запросы могут превысить лимит.

### M-09. Goal deadline defaults to current date
- **Файл**: `goals/goals.service.ts:55`
- `new Date()` как deadline = цель сразу «просрочена».

### M-10. addContribution позволяет отрицательные amounts
- **Файл**: `goals/goals.service.ts:88`
- Нет валидации что `data.amount > 0`.

### M-11. Несогласованные типы ошибок в wishlist
- **Файл**: `wishlist/wishlist.service.ts:56-61`
- `AppException` для not found, `BadRequestException` для already decided.

### M-12. BadRequestException вместо AppException в life-cost
- **Файл**: `life-cost/life-cost.service.ts:12`
- Хардкод английской строки вместо i18n.

### M-13. Синхронный file I/O в i18n controller
- **Файл**: `i18n-controller/i18n.controller.ts:15,20,24`
- `fs.existsSync()`, `fs.readdirSync()`, `fs.readFileSync()` блокируют event loop.

### M-14. Currency refresh молча глотает ошибки
- **Файл**: `currency/currency.service.ts:157`
- `.catch(() => {})` — ошибочные upsert не логируются.

### M-15. Currency convert бросает raw Error
- **Файл**: `currency/currency.service.ts:277`

### M-16. Chat/AI используют raw Error
- **Файлы**: `chat/chat.service.ts:155,232`; `ai/ai.service.ts:121,153,207`

### M-17. Chat/AI controllers возвращают error objects вместо throw
- **Файлы**: `chat/chat.controller.ts:28`; `ai/ai.controller.ts:21,42`
- `return { error: 'message' }` возвращает HTTP 200 с error body.

### M-18. Family operations не проверяют ownership
- **Файл**: `family/family.service.ts:9-123`

### M-19. Race condition в family join
- **Файл**: `family/family.service.ts:29-53`

### M-20. RateLimitGuard использует хардкод русский
- **Файл**: `rate-limit/rate-limit.guard.ts:39-48, 63-73`

### M-21. NotFoundException в users controller
- **Файл**: `users/users.controller.ts:22`

### M-22. getSummary грузит все транзакции в память
- **Файл**: `transactions/transactions.service.ts:147-169`
- Нужно Prisma aggregation (`_sum`, `_count`).

### M-23. isPremium=true только для PREMIUM, не PREMIUM_FAMILY
- **Файл**: `users/users.controller.ts:35`
- `subscription.plan === 'PREMIUM'` — PREMIUM_FAMILY юзеры получают `isPremium: false`.

### M-24. /currency/fetch доступен любому юзеру
- **Файл**: `currency/currency.controller.ts:78-84`
- Можно abuse для исчерпания external API rate limits.

### M-25. Global BigInt prototype mutation
- **Файл**: `main.ts:9-16`
- Может конфликтовать с third-party библиотеками.

### M-26. Chat history: take 20 then slice(-16)
- **Файл**: `chat/chat.service.ts:163, 199`
- 4 записи запрашиваются но не используются.

---

## LOW

### L-01. console.log в продакшн коде
- **Файлы**: `main.ts:60-61`, `articles/articles.service.ts:69,80`, `prisma/prisma.service.ts:28`

### L-02. Дубликат game-controller в AVAILABLE_ICONS
- **Файл**: `categories/categories.service.ts:9,17`

### L-03. Magic numbers
- **Файлы**: `wishlist/wishlist.service.ts:68,117` (10 лет, 0.12 rate); `life-cost/life-cost.service.ts:33` (0.12 rate)

### L-04. Logout — заглушка TODO
- **Файл**: `auth/auth.service.ts:84-87`
- JWT токены остаются валидными 7 дней после logout.

### L-05. Goal DTOs — мёртвый код
- **Файлы**: `goals/dto/*.ts`
- DTO классы существуют но не подключены к контроллеру.

### L-06. Нет лимита на размер семьи
- **Файл**: `family/family.service.ts:46`

### L-07. getBudget возвращает только EXPENSE
- **Файл**: `family/family.service.ts:101`
- Income не включён в бюджет семьи.

### L-08. BigInt precision loss в compound interest
- **Файл**: `wishlist/wishlist.service.ts:121`
- `Number(principal)` теряет precision для больших сумм.

### L-09. Notifications service не имеет контроллера
- **Файл**: `notifications/` (нет controller)
- Пользователи не могут просматривать/управлять уведомлениями через API.

### L-10. Race condition в rate limiter (incr/expire)
- **Файл**: `rate-limit/rate-limit.service.ts:55-59`
- Если краш после incr но до expire — ключ живёт вечно без TTL.

### L-11. Amount unit ambiguity в life-cost
- **Файл**: `life-cost/life-cost.service.ts:20`
- `amount / 100` предполагает копейки, но контроллер не документирует это.

### L-12. `as any` повсюду
- **Файлы**: `transactions.service.ts:10,71`, `accounts.service.ts:52`, `wishlist.controller.ts:29`, `categories.controller.ts:48,63`

### L-13. Chat history — нет пагинации
- **Файл**: `chat/chat.service.ts:237`

### L-14. Export — нет пагинации на транзакции
- **Файл**: `export/export.service.ts:30`
- Все транзакции грузятся в память. OOM для больших объемов.

---

## Незавершённые фичи (не подключены к app.module)

1. **NotificationsModule** — сервис есть, контроллера нет. Пользователи не видят уведомления.
2. **DepositModule / LoanModule** — Prisma модели есть, модулей нет.
3. **SavingsGoal / ForecastScenario** — модели в схеме, реализации нет.
4. **Transfer Category auto-creation** — первый трансфер создаёт системную категорию "Transfer" с `userId: null`, но без поля `userId` в `create()`. Если несколько трансферов параллельно — может создать дубликат.
5. **Wishlist status READY** — статус никогда не выставляется. `isReady` computed field показывается на чтении, но `status` остаётся PENDING даже после истечения cooldown.

## Приоритетные рекомендации

1. **Обернуть ВСЕ операции с балансом в `prisma.$transaction()`** — `transfer()` показывает правильный паттерн. Применить к `create()`, `update()`, `delete()` в TransactionsService.
2. **Заменить все inline body types на class-validator DTO** — это фикс с наибольшим impact. Без этого `ValidationPipe` даёт нулевую защиту.
3. **Добавить авторизацию** — subscription toggle/activate + article CRUD нужны admin guards. Family нужен `@RequirePremium('FAMILY')`.
4. **Унифицировать error handling** — заменить все `HttpException`, `BadRequestException`, raw `Error` на `AppException` с i18n ключами.
5. **Заменить `process.env` на `ConfigService`** во всех файлах.
6. **Добавить пагинацию** — transactions, chat history, export.
