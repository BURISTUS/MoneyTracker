# Money Tracker — Полный редизайн мобильного приложения

## Статус: В процессе

---

## 1. Цель

Полная переработка фронтенда с заменой устаревшего дизайна на современный **Dark Fintech** стиль.
Вдохновение: Revolut, Curve, N26, Tinkoff.

## 2. Визуальный стиль

- **Тема:** Dark-only (тёмная, с яркими акцентами)
- **Фон:** Глубокий чёрный `#0A0A0F` с градиентными подложками
- **Карточки:** Glassmorphism (полупрозрачный фон + blur-эффект), мягкие тени
- **Акценты:** Неоновый индиго `#6366F1` (основной), бирюзовый `#2DD4BF` (доход), коралловый `#F87171` (расход)
- **Типографика:** Крупные balance-числа, лаконичные подписи, SF Pro / System шрифт
- **Анимации:** Плавные spring-анимации через react-native-reanimated
- **Иконки:** Ionicons (уже в проекте)

## 3. Архитектурные изменения

### 3.1 Навигация

**Было:** Самодельный drawer (View + translateX) + 3 таба внизу
**Станет:** Bottom Tabs (4 таба) + Stack для вложенных экранов

| Таб | Иконка | Экран |
|-----|--------|-------|
| Home | `home` | Дашборд (баланс, счета, последние транзакции) |
| Transactions | `swap-horizontal` | Список транзакций с фильтрами |
| Wishlist | `heart` | Инкубатор желаний |
| Profile | `person` | Профиль + настройки + доступ к Budget/Goals/Accounts/LifeCost |

**Stack-экраны** (поверх табов):
- `/main/transactions/create` — создание транзакции
- `/main/accounts` — управление счетами
- `/main/budget` — бюджеты
- `/main/goals` — цели
- `/main/life-cost` — калькулятор стоимости жизни

### 3.2 Дизайн-система

Новая единая система токенов в `src/theme/`:
- `colors.ts` — полная палитра цветов
- `spacing.ts` — отступы (4, 8, 12, 16, 20, 24, 32, 48)
- `typography.ts` — размеры и веса шрифтов
- `shadows.ts` — тени и свечения
- `index.ts` — реэкспорт всего + хук `useTheme()`

### 3.3 Компоненты

Все в `src/components/` с чётким разделением:

**UI (глупые компоненты):**
- `Button` — primary/secondary/ghost/danger, размеры sm/md/lg
- `Card` — glass/elevated/outlined варианты
- `Input` — текстовое поле с label и ошибкой
- `Badge` — статусы, XP, tiers
- `Avatar` — инициалы + градиент
- `ProgressBar` — с gradient fill
- `BottomSheet` — модалка снизу (для форм)
- `Chip` — фильтры, категории
- `Divider` — разделитель
- `Icon` — обёртка над Ionicons
- `Text` — типографический компонент с пресетами
- `Screen` — обёртка с SafeArea + ScrollView/FlatList
- `Loading` — спиннер + skeleton

**Layout:**
- `TabBar` — кастомный нижний таб-бар с glassmorphism
- `Header` — заголовок экрана с опциональным back-button

**Features (контейнерные компоненты):**
- `BalanceHero` — главный блок баланса
- `TransactionItem` — строка транзакции
- `AccountCard` — карточка счёта
- `CategoryChip` — чип категории
- `WishlistCard` — карточка желания с cooldown
- `BudgetCard` — карточка бюджета с прогрессом
- `GoalCard` — карточка цели
- `XPBar` — прогресс-бар опыта
- `StatCard` — мини-карточка статистики

### 3.4 Custom Hooks

Все данные через хуки (инкапсуляция Zustand store):
- `useAccounts()` — счета + CRUD
- `useTransactions(filters?)` — транзакции с фильтрами
- `useCategories()` — категории
- `useGamification()` — XP, уровень, статус
- `useLifeCost()` — калькулятор стоимости жизни
- `useBudget()` — бюджеты
- `useGoals()` — цели
- `useWishlist()` — инкубатор желаний
- `useCurrency()` — форматирование денег

### 3.5 Stores

Оставляем Zustand, но чистим:
- `authStore.ts` — без изменений
- `dataStore.ts` — без изменений (хуки будут его использовать)

### 3.6 Services

Оставляем без изменений:
- `api.ts`, `auth.ts`, `accounts.ts`, `categories.ts`, `transactions.ts`

---

## 4. Экраны (детальный план)

### 4.1 Home Dashboard (`app/main/index.tsx`)

**~200 строк** (было 1351)

Верхняя часть:
- Приветствие с именем + аватар
- **BalanceHero** — крупный баланс, под ним доход/расход за месяц (маленькие цветные цифры)

Середина (горизонтальный скролл):
- **Горизонтальные карточки счетов** — swipeable, показывают имя + баланс

Нижняя часть:
- **Последние транзакции** (5 штук) + кнопка "Все"
- **FAB** → создание транзакции

### 4.2 Transactions (`app/main/transactions/index.tsx`)

**~300 строк** (было 957)

Верх:
- **BalanceHero** (компактный) — баланс + доход/расход

Фильтры:
- **Chip-ряд**: период (неделя/месяц/год) + тип (все/доход/расход)

Список:
- **FlatList** с группировкой по дате
- **TransactionItem** — иконка категории, описание, сумма (цветная), время
- Swipe-to-delete

### 4.3 Create Transaction (`app/main/transactions/create.tsx`)

**~250 строк** (было 691)

- **Тип-переключатель** (Расход/Доход) — toggle вверху
- **Сумма** — крупный input
- **Life Cost** — компактная подсказка "X часов работы"
- **Категория** — горизонтальный скролл чипов
- **Счёт** — список radio
- **Описание** — input
- **Кнопка** сохранить

### 4.4 Wishlist (`app/main/wishlist/index.tsx`)

**~200 строк** (было 299)

- **Табы**: Желания / Достижения
- **Список желаний** с cooldown-таймером
- **Кнопка** "Добавить желание"
- **Карточки**: имя, цена (в часах!), cooldown прогресс, действия

### 4.5 Accounts (`app/main/accounts/index.tsx`)

**~150 строк** (было 340)

- Общий баланс
- **FlatList** счетов
- **FAB** добавить счёт

### 4.6 Budget (`app/main/budget/index.tsx`)

**~150 строк** (было 217)

- Карточка "свободно в этом месяце"
- **FlatList** бюджетов по категориям с прогресс-барами

### 4.7 Goals (`app/main/goals/index.tsx`)

**~150 строк** (было 160)

- Общий прогресс
- **FlatList** целей с прогресс-барами

### 4.8 Profile (`app/main/profile/index.tsx`)

**~150 строк** (было 97)

- Аватар + имя + email
- **XP Bar** — уровень и прогресс
- **Меню-секции**: Счета, Бюджеты, Цели, Калькулятор Life Cost
- **Настройки**: уведомления, тема
- **Кнопка** выхода

### 4.9 Auth (`app/auth/login.tsx` + `register.tsx`)

**~100 строк каждый** (было 150 + 180)

- Тёмный фон с градиентом
- Логотип + название
- Форма с input-компонентами
- Кнопка + ссылка на другую форму

### 4.10 Life Cost (`app/main/life-cost/index.tsx`)

**~120 строк** (было 153)

- Калькулятор: ввод суммы → показывает часы/дни
- Примеры покупок (пресеты)
- Инвестиционный калькулятор

---

## 5. Порядок выполнения

1. ✅ Анализ проекта
2. 🔄 Создать дизайн-систему (`src/theme/`)
3. 🔄 Создать UI-компоненты (`src/components/ui/`)
4. Создать layout-компоненты (`TabBar`, `Header`, `Screen`)
5. Создать feature-компоненты (`BalanceHero`, `TransactionItem`, и т.д.)
6. Создать custom hooks
7. Переделать навигацию (Bottom Tabs + Stack)
8. Переписать Auth-экраны
9. Переписать Home Dashboard
10. Переписать Transactions + Create Transaction
11. Переписать Wishlist
12. Переписать Profile
13. Переписать Accounts, Budget, Goals, LifeCost
14. Удалить старые файлы (cleanup)

---

## 6. Структура файлов (итоговая)

```
mobile/
├── app/
│   ├── _layout.tsx                          # Root: Providers
│   ├── index.tsx                            # Splash/redirect
│   ├── auth/
│   │   ├── _layout.tsx                      # Auth stack
│   │   ├── login.tsx                        # Login
│   │   └── register.tsx                     # Register
│   └── main/
│       ├── _layout.tsx                      # Bottom Tabs + Stack
│       ├── index.tsx                        # Home Dashboard
│       ├── transactions/
│       │   ├── index.tsx                    # Transaction list
│       │   └── create.tsx                   # Create transaction
│       ├── wishlist/
│       │   └── index.tsx                    # Wishlist incubator
│       ├── profile/
│       │   └── index.tsx                    # Profile + menu
│       ├── accounts/
│       │   └── index.tsx                    # Accounts
│       ├── budget/
│       │   └── index.tsx                    # Budget
│       ├── goals/
│       │   └── index.tsx                    # Goals
│       └── life-cost/
│           └── index.tsx                    # Life cost calculator
├── src/
│   ├── theme/
│   │   ├── colors.ts                        # Color palette
│   │   ├── spacing.ts                       # Spacing scale
│   │   ├── typography.ts                    # Font sizes & weights
│   │   ├── shadows.ts                       # Shadows & glows
│   │   └── index.ts                         # useTheme() hook + exports
│   ├── types/
│   │   └── index.ts                         # (без изменений)
│   ├── stores/
│   │   ├── authStore.ts                     # (без изменений)
│   │   └── dataStore.ts                     # (без изменений)
│   ├── services/
│   │   ├── api.ts                           # (без изменений)
│   │   ├── auth.ts                          # (без изменений)
│   │   ├── accounts.ts                      # (без изменений)
│   │   ├── categories.ts                    # (без изменений)
│   │   └── transactions.ts                  # (без изменений)
│   ├── hooks/
│   │   ├── useAccounts.ts
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   ├── useGamification.ts
│   │   ├── useLifeCost.ts
│   │   ├── useBudget.ts
│   │   ├── useGoals.ts
│   │   ├── useWishlist.ts
│   │   └── useCurrency.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Screen.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── TabBar.tsx
│   │   │   └── Header.tsx
│   │   └── features/
│   │       ├── BalanceHero.tsx
│   │       ├── TransactionItem.tsx
│   │       ├── AccountCard.tsx
│   │       ├── CategoryChip.tsx
│   │       ├── WishlistCard.tsx
│   │       ├── BudgetCard.tsx
│   │       ├── GoalCard.tsx
│   │       ├── XPBar.tsx
│   │       ├── StatCard.tsx
│   │       └── index.ts
│   └── utils/
│       └── formatters.ts                    # (без изменений)
```

---

## 7. Ключевые принципы

- **SRP**: Один компонент = одна ответственность. Экраны < 300 строк.
- **Memoization**: React.memo для всех list-item компонентов
- **useCallback/useMemo** для обработчиков и вычислений
- **StyleSheet.create** снаружи компонента, НЕ внутри render
- **Никаких inline-стилей** типа `style={{ margin: 10 }}`
- **Никакого any** — strict TypeScript
- **FlatList** для всех списков (не .map внутри ScrollView)
- **SafeArea** на всех экранах
