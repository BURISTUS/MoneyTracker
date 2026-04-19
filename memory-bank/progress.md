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

## Бэклог
- [ ] Transfer между счетами (TransactionType.TRANSFER)
- [ ] Budget страница с реальными данными
- [ ] Goals страница с реальными данными
- [ ] Редактирование категорий
- [ ] Редактирование счетов
- [ ] Семейный бюджет (Family module)
- [ ] Депозиты/кредиты (Deposit/Loan modules)
- [ ] Прогнозирование (ForecastScenario)
- [ ] Достижения и челленджи
- [ ] Уведомления
