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
- [x] Home dashboard — баланс, траты/доходы за месяц, последние операции
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

## Бэклог
- [ ] Transfer между счетами (TransactionType.TRANSFER)
- [ ] Budget страница с реальными данными
- [ ] Goals страница с реальными данными
- [ ] Life-Cost страница с реальной интеграцией
- [ ] Редактирование категорий
- [ ] Редактирование счетов
- [ ] Семейный бюджет (Family module)
- [ ] Депозиты/кредиты (Deposit/Loan modules)
- [ ] Прогнозирование (ForecastScenario)
- [ ] Достижения и челленджи
- [ ] Уведомления
