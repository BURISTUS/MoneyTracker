# Журнал технических решений

## 2026-04-17: Инициализация Memory Bank

### Решение: Копейки (BigInt) для хранения сумм
**Почему:** Все суммы хранятся в копейках (BigInt) для точности. На фронте делим на 100 для отображения. Исключает ошибки округления float.

### Решение: react-native-reanimated и react-native-gesture-handler запрещены в компонентах
**Почему:** Вызывают NullPointerException на Android при неправильной конфигурации. Используем стандартные RN Modal, TouchableOpacity, Pressable.

### Решение: SVG без LinearGradient и stop
**Почему:** Элемент `<stop>` внутри `<LinearGradient>` из react-native-svg крашит Android с "View config getter callback for component stop must be a function". DonutChart использует plain stroke colors.

### Решение: Системные категории (userId: null)
**Почему:** Категории по умолчанию создаются с userId: null. При запросе используем OR: [{userId}, {userId: null}] чтобы показать системные + личные.

### Решение: Демо-режим через isDemoMode флаг
**Почему:** loginMock() не создаёт JWT-токен. Без флага initializeData() вызывает API → 401 → redirect loop. Флаг isDemoMode (persisted) пропускает API-вызовы.

### Решение: expo-router file-based routing
**Почему:** Стандартный подход для Expo SDK 54+. Каждый .tsx в app/ — маршрут. Layout файлы _layout.tsx определяют навигацию.

### Решение: Zustand + React Query
**Почему:** Zustand — простой клиентский state (auth, data cache). React Query — server state (hooks). Разделение ответственности.

### Решение: DatePickerModal вместо DateTimePicker
**Почему:** Нативный DateTimePicker даёт разный UX на iOS/Android. Кастомный bottom-sheet с пресетами (Сегодня/Вчера/Позавчера) + инпуты ДД/ММ с автофокусом — единообразный UX. Год всегда текущий.

### Решение: Калькулятор с мат.операциями в numpad
**Почему:** Пользователь может ввести выражение типа "1000 + 500" прямо при добавлении транзакции. Операции +−×÷ встроены в сетку 4×4. Кнопка = вычисляет результат.

### Решение: 401 interceptor с debounce
**Почему:** При отсутствии токена 5 параллельных запросов возвращают 401 одновременно → 5 redirect на login. isRedirecting флаг предотвращает каскад.

### Решение: getHourlyRate() всегда возвращает рубли
**Почему:** В БД hourlyRate хранится в копейках. `getHourlyRate()` делает `/100` и возвращает рубли. Все расчёты life-hours должны: (сумма_в_рублях) / (rate_в_рублях). Баг был в life-cost/index.tsx — делил копейки на рубли. Конвенция: `getHourlyRate()` → рубли, `transaction.amount` → копейки, `transaction.amount / 100` → рубли.

### Решение: Калькулятор ставки на Life-Cost странице
**Почему:** Пользователь не всегда знает свою часовую ставку. На странице Life-Cost упрощённый калькулятор: toggle (час/неделя/месяц/год) + одно поле ввода зарплаты → рассчитывает ₽/час. Формулы: час=1, неделя=40ч, месяц=164ч (8ч×5д×4.33нед), год=1971ч (164×12). Кнопка «Применить эту ставку» сохраняет в dataStore (локально, через setHourlyRate → gamification.hourlyRate в копейках).

### Решение: Обязательное описание в Wishlist
**Почему:** Пользователь должен объяснить, зачем ему покупка. Это ключевой элемент механики «Инкубатор желаний» — через 7 дней он перечитает своё обоснование и примет осознанное решение. Без описания невозможно добавить желание.

### Решение: setHourlyRate в dataStore — сохранение на сервер через API
**Почему:** `PATCH /users/hourly-rate` уже существовал на бэкенде. `dataStore.setHourlyRate()` сначала обновляет локальный Zustand state (для мгновенного UI), затем вызывает `lifeCostService.updateHourlyRate(rateKopecks)` для сохранения на сервер. В демо-режиме API-вызов пропускается. Конвенция: в API часовая ставка отправляется в копейках, `lifeCostService` получает рубли и конвертирует.

### Решение: Wishlist description — поле в БД (Prisma)
**Почему:** Описание желания хранится в БД (`description String @default("")`). Это позволяет пользователю перечитать своё обоснование через 7 дней на любом устройстве. Backend `wishlist.controller.ts` и `wishlist.service.ts` принимают `description` в `POST /wishlist`. Миграция `20260417121332_add_wishlist_description`.

### Решение: Vector icons (MaterialCommunityIcons) вместо emoji для категорий
**Почему:** Emoji рендерятся по-разному на iOS/Android, выглядят непрофессионально. MaterialCommunityIcons имеет 7000+ векторных иконок, единообразный стиль. Формат сериализации: `family:name` (например `material:food`). `CategoryIcon` компонент десериализует и рендерит. Системные категории в seed обновлены на `material:xxx` формат, upsert обновляет icon у существующих записей.

### Решение: Минималистичный дашборд (стиль 1Money)
**Почему:** Предыдущая версия перегружала экран метриками (геймификация, прогнозы, % сбережений, дни работы, топ категорий) — всё сливалось, ничего нельзя было прочитать. 1Money-стиль: чистый баланс по центру, две карточки доход/расход, список последних операций. Просто и читаемо.

### Решение: SpendingChart (bar chart) вместо DonutChart на главной
**Почему:** DonutChart показывала структуру расходов по категориям — это дублировало экран транзакций. Пользователь спрашивал «нахуя она нужна». Bar chart по дням месяца показывает динамику: когда тратил больше/меньше, дни доходов vs расходов. Как в Mint/Spendee/Toshl. SVG Rect для столбцов, зелёный=доход, красный=расход. DonutChart убрана с главной и транзакций, осталась только на categories/chart.

### Решение: Summary + category chips вместо DonutChart на транзакциях
**Почему:** DonutChart занимала много места и не добавляла информации поверх списка операций. Заменена на крупную сумму за период + горизонтальные chip-теги категорий с %. Чипы кликабельны — фильтруют список.

### Решение: «Осознанный пульт управления» — концепция главного экрана
**Почему:** Пользователь wants цельный дашборд, а не набор разрозненных виджетов. Концепция: экран ведёт от общей картины к действию. 4 зоны: (1) Баланс времени — потрачено vs сохранено в часах жизни, (2) Зона решений — READY wishlist карточки требуют действия, кнопка «Не нужно» крупнее и зелёнее чем «Купить», (3) Морозильная камера — горизонтальная карусель PENDING с обратным отсчётом, (4) Быстрые действия. Ключевая метрика — ЧАСЫ ЖИЗНИ, не рубли. savedHours из rejected wishlist items.

### Решение: i18n — бэкенд как единственный источник истины
**Почему:** Валидация и ошибки на бэкенде тоже нужно переводить. Все тексты хранятся на бэкенде в JSON-файлах (`src/i18n/{lang}/common.json`). Бэкенд использует `nestjs-i18n` для собственных ответов. Мобильное приложение скачивает переводы через `GET /api/i18n/translations/:lang` при старте, локальный fallback для оффлайна. `Accept-Language` header на каждый API-запрос. 8 языков: en, ru, es, pt, fr, de, ja, zh. Пакеты: `i18next`, `react-i18next`, `expo-localization` на фронте, `nestjs-i18n` на бэкенде.

### Решение: CurrencyModule — мультивалютность с User.currency
**Почему:** Пользователь выбирает основную валюту (User.currency, по умолчанию RUB). Каждый счёт имеет свою валюту (Account.currency). Общий баланс: счета одной валюты складываем, остальные конвертируем через `CurrencyRate.rateToUsd`. USD — только технический хаб для формулы `A → USD → B`, пользователь его не видит. `formatCurrency()` на фронте берёт символ из `setCurrencyConfig()`. Life-cost считает от основной валюты. `PATCH /users/profile` принимает `currency` и `language`. `GET /accounts/total-balance` — сконвертированный баланс. 24 валюты, Redis cache 24ч.

### Решение: ExchangeRate — ежедневное обновление через cron + @fawazahmed0/exchange-api
**Почему:** Модель `ExchangeRate` с полем `rate` (1 USD = X валюты) и `date` (YYYY-MM-DD из API). Cron `0 6 * * *` ежедневно обновляет все курсы. API: jsdelivr primary + cloudflare fallback. Формула кросс-курса: `(amount / from.rate) * to.rate`. USD — технический хаб, пользователь его не видит. `refreshRates()` использует `upsert` — все ~300+ валют из API сохраняются в БД. Batch upsert по 50 записей параллельно. `GET /currency/list` с пагинацией и поиском для мобильного CurrencyPicker.

### Решение: CurrencyPicker — модальный пикер валют с поиском и табами
**Почему:** 300+ валют в БД требуют удобного поиска. CurrencyPicker — модальный BottomSheet-style компонент с поиском по коду/названию (дебаунс 300мс), табами Популярные/Все/Фиат/Крипто/Металлы, пагинацией (50 на страницу). Используется в Profile для выбора основной валюты (userCurrency → PATCH /users/profile) и при создании счёта (filterType="FIAT"). `setCurrencyConfig()` теперь принимает символ динамически из API. Названия валют через i18n: `t('currencies.${code}', item.name)` — перевод по коду, fallback на английское название из БД.

### Решение: Миграция на gluestack-ui v3 + NativeWind v4 (2026-04-19)
**Почему:** Кастомные UI-компоненты не имеют единой дизайн-системы, визуальная нестабильность. gluestack-ui v3 — copy-paste подход (как shadcn/ui), NativeWind (Tailwind для RN) даёт единый язык стилизации. Тёмная тема (#0A0A0F) через CSS variables + NativeWind `vars()`. Заменяет ВСЮ текущую тему: theme/colors.ts, spacing.ts, typography.ts, shadows.ts → tailwind.config.js tokens. CLI `npx gluestack-ui init` падает с OOM — компоненты копируются вручную.

### Решение: react@19.1.0 строго (2026-04-19)
**Почему:** react-native@0.81.5 содержит react-native-renderer@19.1.0. React и renderer должны иметь **точное совпадение** версий. `react@19.1.4` давал Incompatible React versions error при каждом рендере. Пиним react@19.1.0 + react-dom@19.1.0.

### Решение: react-native-css-interop patch (2026-04-19)
**Почему:** `react-native-css-interop@0.2.3` в babel.js требует `react-native-worklets/plugin` — это нужно для reanimated 4+. У нас reanimated 3.15, плагин не нужен. Патч через patch-package: закомментирована строка `"react-native-worklets/plugin"` в `node_modules/react-native-css-interop/babel.js`. patch-package добавлен в devDependencies + postinstall скрипт.

### Решение: GluestackUIProvider применяет CSS-переменные (2026-04-19)
**Почему:** Сгенерированный gluestack `GluestackUIProvider` принимал `mode="dark"` но **не применял** CSS-переменные из `config.ts`. Без этого NativeWind `vars()` не попадал в стиль дерева → все Tailwind-классы (bg-background-0, text-typography-white и т.д.) разрешались в undefined. Фикс: `<View style={config[resolved]} className="flex-1">{children}</View>`. `config` содержит `light`/`dark` объекты с CSS-переменными через `nativewind vars()`.

### Решение: i18n AsyncStorage — async после init (2026-04-19)
**Почему:** `AsyncStorage.getItem()` вызывался синхронно при загрузке модуля (top-level в index.ts). На Android native модули ещё не инициализированы → `AsyncStorageError: Native module is null`. Фикс: i18n.init() использует device language, затем AsyncStorage.getItem().then() переключает на сохранённый язык.

### Решение: PanResponder вместо gesture-handler для свайпов (2026-04-19)
**Почему:** react-native-gesture-handler запрещён в проекте (краш Android — NullPointerException, описано в systemArchitecture.md). PanResponder встроен в RN, работает без зависимостей. Используется на transactions screen для свайпа по периодам (влево = прошлый период, вправо = следующий). Порог: dx > 30, dx > dy * 2 (горизонтальный свайп).

### Решение: Number() для BigInt полей из API (2026-04-19)
**Почему:** Prisma BigInt сериализуется как string (BigInt.toJSON monkey-patch). На фронте тип `number`, но реальное значение — string. `reduce((sum, t) => sum + t.amount, 0)` делает `"0" + "211000"` = `"0211000"` → конкатенация вместо сложения. Фикс: `Number(t.amount)` во всех reduce/sum операциях + при `fetchTransactions` нормализация `amount: Number(t.amount)`. Затронуто: totalAmount, categoryData, getTotalBalance, getMonthlyIncome, getMonthlyExpenses.

### Решение: getHourlyRate двойное деление на 100 (2026-04-21)
**Почему:** Бэкенд `/life-cost/rate` уже конвертирует `user.hourlyRate` из копеек в рубли (`/ 100`). Фронтенд `fetchGamification` сохранял рубли в `gamification.hourlyRate`. Но `getHourlyRate()` делал ещё `/ 100` — двойное деление. Если hourlyRate = 150000 копеек (1500₽), бэкенд возвращал 1500, фронтенд выдавал 15. Фикс: убрал `/ 100` из `getHourlyRate()`.

### Решение: Каждый период использует offset от текущего момента (2026-04-21)
**Почему:** Каждый тип периода (DAY/WEEK/MONTH/YEAR/CUSTOM) использует offset от текущего момента. DAY: offset=-1 = вчера, offset=-2 = позавчера. WEEK: offset=-1 = прошлая неделя (с понедельника). MONTH: offset=-1 = прошлый месяц. CUSTOM: сдвиг на длину диапазона. offset ограничен сверху нулём (нельзя смотреть будущее). Система `getRange(period, offset, customRange)` централизует расчёт дат.

### Решение: Переход на OpenSpec для spec-driven development (2026-04-26)
**Почему:** Нужна единая система управления требованиями, которая живёт в репозитории и доступна AI-агентам. OpenSpec предоставляет стандартный формат: `openspec/specs/<capability>/spec.md` с Purpose + Requirements в GIVEN/WHEN/THEN. Контекст проекта (стек, конвенции, API) централизован в `openspec/config.yaml` и подаётся AI при генерации артефактов. Change proposals создаются в `openspec/changes/<change-id>/`. Это позволяет review-ить intent (изменения требований), а не только код. Старый `specs/project-overview.md` оставлен как источник, но актуальные спеки теперь в `openspec/`.

### Решение: Memory Bank не заменяется OpenSpec (2026-04-26)
**Почему:** OpenSpec хранит функциональные требования (what), а Memory Bank — оперативное состояние реализации (how + current state + история багфиксов). Оба инструмента комплементарны. Memory Bank обновляется AI перед каждой задачей, OpenSpec управляется PM для планирования.

### Решение: Roadmap планируется через OpenSpec change proposals (2026-04-26)
**Почему:** Все новые фичи оформляются как change proposals в `openspec/changes/<id>/` с `proposal.md` (summary, motivation, non-goals) и `tasks.md` (по фазам). Это позволяет PM review-ить intent до написания кода.

### Решение: 1 рабочий день = 8 часов для life-cost (2026-04-27)
**Почему:** Пользователь определил, что "рабочий день" в контексте life-cost — это 8 часов, не 24. Это влияет на все пересчёты: если где-то нужно показать "дни работы", делим часы на 8. В UI отображаем только часы (без дней), но внутренняя логика (backend `lifeCostService.calculateHours`, `dataStore.calculateLifeCost`) использует 8-часовой день. Исправлены `formatLifeHours` в `wishlist/index.tsx`, `transactions/index.tsx`, `main/index.tsx` — теперь всегда часы (или минуты), без деления на дни.

### Решение: Кастомный Toast + ConfirmModal вместо Alert.alert (2026-04-27)
**Почему:** Системный `Alert.alert` выглядит чужеродно в dark-theme приложении (белый фон, системный шрифт). Созданы два компонента: `Toast` (auto-dismiss уведомления success/error/info) через React Context + hook, и `ConfirmModal` (для подтверждений delete/buy/reject). ToastProvider обёрнут глобально в `_layout.tsx`. 17 вызовов Alert.alert заменены в 7 файлах. Toast использует Animated (fade+slide), Supports stacking (несколько тостов подряд), auto-dismiss 3s. ConfirmModal поддерживает два варианта: destructive (красный) и confirm (indigo).
