# MoneyTracker — «Побег из общества потребления»

## Концепция

Финансовый трекер с геймификацией, который не просто учитывает расходы, а **меняет отношение пользователя к деньгам**. Приложение конвертирует цены в **часы жизни** и помогает бороться с импульсивными покупками через «Инкубатор желаний».

**Месседж:** Приложение не говорит «Не трать». Оно говорит: **«Не меняй свою жизнь на мусор»**.

**Целевая аудитория:** Люди 20-40 лет, которые хотят осознанно управлять финансами, избавиться от импульсивных покупок и начать накапливать.

---

## Киллер-фичи

### 1. «Цена твоей жизни» (Time-is-Money Converter)
- При регистрации пользователь вводит зарплату и рабочие часы → рассчитывается **Real Hourly Rate**
- Каждая трата показывается не только в рублях, но и в **часах/минутах работы**
- Пример: «Новый iPhone 120 000 ₽ ⏱ / 160 ч работы. Ты готов просидеть в офисе месяц ради этого?»
- Сквозная фича — life-hours отображаются везде: в транзакциях, инкубаторе, категориях, на дашборде

### 2. «Инкубатор желаний» (Wishlist / Anti-Spend Impulse)
- Желание добавляется с таймером остывания (7 дней по умолчанию)
- Кнопка «Купить» заблокирована до окончания таймера
- Через 7 дней — вопрос: «Ты всё ещё хочешь это?»
- Отказ = дофаминовая награда: XP, визуализация сэкономленного, прогноз инвестиционного роста
- Покупка тоже доступна, но UI подталкивает к отказу (зелёная кнопка «Мне это не нужно» крупнее красной «Купить»)
- Обязательное поле «Зачем вам это?» — через 7 дней пользователь перечитывает своё обоснование

### 3. RPG-прогрессия (Уровни осознанности)
| Уровень | Статус | Описание |
|---------|--------|----------|
| 1 | Потребитель (Consumer Drone) | Есть долги, нет накоплений |
| 2 | Пробудившийся (Awakened) | Начал отслеживать траты |
| 3 | Аскет (Ascetic) | Закрыл долги, отказался от 5+ импульсивных покупок |
| 4 | Стратег (Strategist) | Есть подушка безопасности |
| 5 | Капиталист (Capitalist) | Пассивный доход покрывает 10% трат |
| 6 | Архитектор (Financial Architect) | Финансовая независимость |

### 4. Ачивки (примеры)
- «Убийца маркетинга» — не покупал одежду 3 месяца (кроме базы)
- «Кофеин-детокс» — 30 дней без кофе на вынос
- «Шорт трендов» — отказ от вещи после инкубатора

### 5. Челленджи (социальная механика — в бэклоге)
- Режим «No Spend Month»: кто из супругов потратит меньше на «Личные хотелки»
- Визуализация: два прогресс-бара, победитель выбирает награду

---

## Монетизация (план)
- **Free:** Учёт расходов, базовые категории, инкубатор (лимит 3 желания), life-hours
- **Premium:** Безлимитный инкубатор с аналитикой, продвинутые ачивки, кастомные скины аватара, семейный бюджет, прогнозы

---

## Дизайн

### Референс
Стиль **1Money** — тёмная тема, donut-диаграмма расходов, bottom-sheet модалки, calculator numpad при вводе суммы.

### Текущая тема
- **Dark mode:** фон `#0A0A0F`, карточки `#1C1C1E`
- **Primary цвет:** Indigo `#6366F1` (кнопки, акценты, FAB)
- **Error/Expense:** красный `#EF4444`
- **Success/Income:** зелёный `#489768`
- **Warning:** оранжевый `#FB9554`
- **Info:** голубой `#32B4F4`
- **Типографика:** белый `#F5F5F5` (основной), серый `#8C8C8C` (второстепенный)

### Паттерны UI
- Bottom-sheet модалки (DatePickerModal, AddTransactionModal, CurrencyPicker)
- Calculator numpad с мат.операциями (+−×÷=) при вводе суммы
- FAB (Floating Action Button) для быстрого добавления
- CategoryIcon — vector icons (MaterialCommunityIcons) вместо emoji
- TabBar — только цветная иконка + точка снизу (без прямоугольников)
- Filter chips — компактные, кликабельные
- Life-hours формат: `25 000 ₽ ⏱ / 18.6 ч работы`

---

## Текущий статус разработки

### Что работает (MVP готово)

**Backend (NestJS + Prisma + PostgreSQL + Redis)**
- Auth (JWT, регистрация, логин, демо-режим)
- CRUD: аккаунты, транзакции, категории, бюджет, цели, wishlist, gamification
- Life-cost: почасовая ставка, конвертация в часы жизни
- Currency: ~300+ валют, кросс-курсы через USD, Redis cache 24ч, cron обновление
- i18n: 8 языков (en, ru, es, pt, fr, de, ja, zh), переводы с бэкенда
- Swagger документация на /docs
- Docker Compose: PostgreSQL 15 + Redis 7 + Backend

**Mobile (React Native / Expo 54)**
- 12 экранов: Home, Transactions, Categories, Wishlist, Accounts, Budget, Goals, Life-Cost, Profile, Login, Register, Create Category
- «Осознанный пульт управления» на главном: баланс времени, зона решений (READY wishlist), морозилка (PENDING wishlist), быстрые действия (+Доход, −Трата, Заморозить желание)
- Transactions dashboard: навигация по периодам (день/неделя/месяц/год/период), свайп, DateRangePickerModal, фильтр-чипы по категориям
- AddTransactionModal: numpad с калькулятором, life-hours, выбор категории/счёта/заметки
- Wishlist/Incubator: cooldown 7 дней, купить/отказаться, life-hours, описание
- Categories: список, создание (палитра 18 цветов, 64 иконки), chart с прогресс-барами
- Life-Cost: калькулятор ставки (час/неделя/месяц/год), конвертация в часы, прогноз инвестиций
- CurrencyPicker: поиск, табы (популярные/фиат/крипто/металлы), пагинация
- Мультивалютность: основная валюта пользователя, разные валюты счетов
- Демо-режим (без бэкенда)

### Что в бэклоге (не реализовано)
- Transfer между счетами
- Budget с реальными данными и прогрессомf
- Goals с реальными данными и прогрессом
- Редактирование категорий и счетов
- RPG-прогрессия: XP, уровни, ачивки (модели в БД есть, логика нет)
- Семейный бюджет (Family module)
- Депозиты/кредиты (Deposit/Loan modules)
- Прогнозирование (ForecastScenario)
- Уведомления (push)
- Аналитика и статистика (расширенная)
- Lottie-анимации (разрушение предмета, рост дерева инвестиций)

---

## Технический стек

### Backend
- NestJS 10, TypeScript strict, Prisma 5, PostgreSQL 15, Redis 7
- Auth: Passport JWT + bcrypt
- Пакетный менеджер: yarn 1.22
- Порт: 3001, префикс `/api/`

### Mobile
- React Native (Expo SDK 54), expo-router (file-based routing)
- UI: gluestack-ui v3 (copy-paste) + NativeWind v4 (Tailwind CSS)
- State: Zustand (persist + expo-secure-store) + React Query
- HTTP: Axios
- i18n: i18next + expo-localization
- SVG: react-native-svg (без LinearGradient — краш Android)
- Запрещены: react-native-reanimated и react-native-gesture-handler в компонентах (краш Android)

### База данных (21 модель Prisma)
- User, Session, Account, Category, Transaction, Budget, Goal
- UserGamification, WishlistItem, Achievement
- Deposit, Loan, SavingsGoal, ForecastScenario
- ExchangeRate, Translation
- Family, FamilyMember, Notification, Challenge, UserChallenge (не подключены)
- Все суммы — BigInt (копейки). Все ID — UUID.

### API эндпоинты
- Auth: POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/logout
- Accounts: GET /accounts, POST /accounts
- Categories: GET /categories, GET /categories/system, POST /categories, GET /categories/icons, GET /categories/account-types
- Transactions: GET /transactions, GET /transactions/summary, GET /transactions/:id, POST /transactions, PATCH /transactions/:id, DELETE /transactions/:id
- Users: GET /users/profile, PATCH /users/profile, PATCH /users/hourly-rate
- Life-Cost: GET /life-cost/rate, POST /life-cost/calculate
- Currency: GET /currency/list, GET /currency/rates, GET /currency/convert, GET /currency/fetch
- i18n: GET /i18n/translations/:lang, GET /i18n/languages

---

## Ключевые архитектурные решения

1. **Копейки (BigInt)** для всех сумм — точность, нет float-ошибок
2. **Системные категории (userId: null)** — OR-запрос для системных + личных
3. **Демо-режим** — isDemoMode флаг пропускает API-вызовы, моковые данные в Zustand
4. **USD как технический хаб** для кросс-курсов (RUB → USD → EUR)
5. **i18n с бэкенда** — единственный источник правды, 8 языков
6. **PanResponder** вместо gesture-handler (краш Android)
7. **Vector icons** вместо emoji (MaterialCommunityIcons)
8. **GluestackUIProvider** с CSS-переменными через nativewind vars()
9. **react@19.1.0 строго** — совпадение с react-native-renderer
10. **getHourlyRate()** возвращает рубли, amount в копейках — life-hours: (amount/100) / hourlyRate
