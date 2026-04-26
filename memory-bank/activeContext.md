# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (бэкенд + мобайл)
- Все экраны и компоненты используют NativeWind/Tailwind + gluestack-ui
- Старая тема полностью удалена
- **Визуал работает** (GluestackUIProvider применяет CSS-переменные)

## Ключевые фиксы этой сессии
- **Бюджеты (Budget) — полная реализация**:
  - Backend: `POST /budgets` упрощённое создание (categoryId + amount + alertThreshold), period=MONTHLY, даты авто
  - Backend: `GET /budgets` возвращает прогресс за текущий месяц inline (spent, remaining, percentUsed, isOverBudget, isNearLimit)
  - Backend: `PATCH /budgets/:id` — редактирование суммы/порога
  - Backend: DTO с class-validator (`CreateBudgetDto`, `UpdateBudgetDto`)
  - Mobile: `BudgetService` + dataStore методы (fetch/create/update/delete)
  - Mobile: `initializeData` вызывает `fetchBudgets`
  - Mobile: `BudgetScreen` — список с прогрессом, FAB добавить, AddBudgetModal (выбор категории + сумма + порог 50/70/80/90%), редактирование/удаление
  - Mobile: `TransactionsScreen` — dot-индикатор лимита рядом с категорией (🟢🟡🔴)
  - Mobile: `AddTransactionModal` — прогресс-бар остатка лимита при выборе категории
- **Редактирование счетов (клиент + сервер)** — аккаунты кликабельны, модалка редактирования (название + баланс). При изменении баланса предлагается добавить транзакцию. Бэкенд расширен.

## Важные зависимости версий
- react@19.1.0, react-dom@19.1.0 (строго! должно совпадать с react-native renderer)
- react-native@0.81.5
- expo@54, expo-router@6
- react-native-reanimated@~3.15.0
- react-native-css-interop@0.2.3 (с патчем)
- nativewind@4.1.0, tailwindcss@3.4.0

## Статус
- Старая тема ПОЛНОСТЬЮ удалена
- Все компоненты используют gluestack Text + Ionicons + Tailwind className
- 0 ошибок TypeScript
- **Primary цвет** — Indigo (#6366F1 = 99 102 241). Был серый (166-254), заменён на индиго палитру в config.ts (light + dark)
