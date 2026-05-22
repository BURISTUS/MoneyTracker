# Аудит качества фронтенда MoneyTracker

**Дата аудита:** 18 мая 2026  
**Версия проекта:** 1.0.0  
**Стек:** Expo SDK 54, React 19.1, React Native 0.81, TypeScript (strict), Zustand, TanStack Query, NativeWind, i18next, Axios

---

## 1. Качество кода

**Оценка: 5/10**

### Проблемы

1. **Монолитные компоненты-гиганты (критично)**
   - `app/main/index.tsx` — **486 строк**, содержит всю логику домашнего экрана (hero, статистика, статьи, пульс, quick actions, AI-сканер чеков). Нет разбиения на подкомпоненты.
   - `app/main/transactions/index.tsx` — **682 строки**, включает в себя отдельный экран, логику фильтрации/группировки, свайп-анимации, модальный пикер счетов — всё в одном файле.
   - `src/components/ui/AddTransactionModal.tsx` — **952 строки**, включает нумпад, пикер категорий, калькулятор, бюджет-бар, голосовой ввод, сканер чеков. Это один из крупнейших файлов проекта.

2. **Дублирование кода (DRY)**
   - Хардкод русскоязычных строк в нескольких местах:
     - `app/main/transactions/index.tsx:32-35` — массивы `MONTHS_NOMINATIVE` и `MONTHS_GENITIVE` захардкожены.
     - `app/main/transactions/index.tsx:97-99` — строки `'Сегодня'`, `'Вчера'`, `'Позавчера'` не через i18n.
     - `app/main/transactions/index.tsx:103-104` — `'Эта неделя'`, `'Прошлая неделя'`.
     - `app/main/transactions/index.tsx:330-334` — `'День'`, `'Неделя'`, `'Месяц'`, `'Год'`, `'Период'` захардкожены.
     - `app/main/chat/index.tsx:241-273` — строки `'Привет! 👋'`, `'Я ваш финансовый ассистент...'`, `'Чат'`, `'AI Ассистент'`, `'Печатает...'` и т.д.
     - `src/components/ui/AddTransactionModal.tsx:571` — `'Добавить расход'` / `'Добавить доход'`.
     - `src/components/ui/AddTransactionModal.tsx:581,608,633` — `'Тип'`, `'Сумма'`, `'Детали'`.
   - Функция `formatHours()` дублируется:
     - `app/main/index.tsx:29-33`
     - `app/main/transactions/index.tsx:42-49`
   - `(t as any).account?.currency || 'RUB'` повторяется 10+ раз по проекту:
     - `app/main/index.tsx:149,191,192,209,212,335`
     - `app/main/transactions/index.tsx:166,171,542`
     - `src/stores/dataStore.ts:469,483`

3. **Использование `as any` для обхода типобезопасности**
   - `app/main/index.tsx:149,191,192,209,212,335` — `(t as any).account?.currency`
   - `app/main/transactions/index.tsx:166,171,184,542` — `(t as any).account?.currency`, `('ALL' as any)`
   - `app/main/chat/index.tsx:131` — `C: any` в `inlineBold`
   - `src/stores/dataStore.ts:87` — `achievements: any[]`
   - `src/stores/dataStore.ts:219` — `(raw.items ?? raw).map((t: any) => ...)`

4. **Console.log в production коде**
   - `src/services/api.ts:33-37` — логируется каждый API-запрос с информацией о наличии токена.
   - `src/services/api.ts:49` — логируется каждый успешный ответ.
   - `src/services/api.ts:62-66` — логируются все ошибки API.
   - `src/services/auth.ts:10-15,21-26,41-44,50-51,57` — логирование токена и данных пользователя.
   - `app/auth/login.tsx:34,39` — `console.log('📝 Logging in:', { email })` — утечка email в логи.
   - `src/stores/dataStore.ts:267` — `console.log('✅ Loaded ${categories.length} categories')`.

5. **`alert()` вместо нативных компонентов**
   - `app/auth/login.tsx:31` — `alert('Пожалуйста, заполните все поля')`.
   - `app/auth/login.tsx:43-45` — `alert('Пользователь не найден...')` / `alert('Ошибка входа: ...')`.
   - `app/main/index.tsx:384,405` — `Alert.alert('Нет доступа', ...)` / `Alert.alert('Ошибка', ...)`.

6. **Инлайн-стили вместо StyleSheet**
   - `app/main/index.tsx:37-93` — объект `S` с ~60 инлайн-стилями создаётся при каждом рендере, не через `StyleSheet.create()`.
   - `app/main/transactions/index.tsx` — смешивание `className` (NativeWind) и инлайн `style` без системы.
   - `app/main/chat/index.tsx` — практически все стили инлайн, без `StyleSheet.create()`.

7. **`StyleSheet.create()` внутри тела компонента**
   - `src/components/ui/AddTransactionModal.tsx:254-483` и `486-553` — `StyleSheet.create()` вызывается при каждом рендере (не вынесен за пределы компонента).

8. **Отсутствие ошибок валидации на форме логина**
   - `app/auth/login.tsx:96-105` — нет валидации формата email (только проверка на пустоту).
   - `app/auth/login.tsx:109-118` — нет индикатора минимальной длины пароля.

### Рекомендации

- Разбить `AddTransactionModal.tsx` на: `TransactionTypeSelector`, `AmountNumpad`, `CategoryPickerSheet`, `BudgetLimitBar`, `TransactionActions`.
- Разбить `transactions/index.tsx` на: `TransactionDashboard`, `PeriodSelector`, `AccountPickerSheet`, `TransactionList`, `CategoryFilter`.
- Вынести `(t as any).account?.currency` в утилиту `getTransactionCurrency(t: Transaction): string` в `src/utils/`.
- Заменить все хардкод-строки на i18n-ключи.
- Удалить `console.log` из production-кода или обернуть в `__DEV__` guard.
- Заменить `alert()` на Toast-компонент (уже есть `useToast`).
- Вынести стили за пределы компонентов в `StyleSheet.create()` или использовать NativeWind консистентно.

---

## 2. Безопасность

**Оценка: 7/10**

### Проблемы

1. **Утечка email в логи (средний риск)**
   - `app/auth/login.tsx:34` — `console.log('📝 Logging in:', { email })`.
   - `src/services/auth.ts:10-11` — `console.log('🔐 API login request:', data)` — логирует email и пароль в консоль.

2. **Утечка данных о токене в логах**
   - `src/services/api.ts:33-37` — `hasToken: !!token` — в production-логах видна информация о наличии авторизации.
   - `src/services/auth.ts:50,57` — `console.log('🔑 Token exists:', !!token)` / `'🔑 Retrieved token:', !!token`.

3. **Отсутствие refresh-токена**
   - `src/services/api.ts:73-80` — при 401 просто удаляется токен и происходит редирект на логин. Нет механизма refresh token, что приводит к разовым выходам из системы.
   - `src/services/auth.ts` — нет метода `refreshToken()`.

4. **Дефолтный API URL — HTTP, не HTTPS**
   - `src/services/api.ts:7` — `process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api'` — fallback по HTTP. В production-сборке без установленной переменной окружения данные передаются в открытом виде.

5. **Токен хранится корректно, но auth-storage в SecureStore может быть избыточным**
   - `src/stores/authStore.ts:142-153` — используется `SecureStore` для хранения всего Zustand-состояния (user, gamification, isAuthenticated, isDemoMode). Это безопасно, но `SecureStore` имеет лимит ~2048 байт на значение. При большом объекте user может произойти ошибка.

6. **Данные dataStore хранятся в AsyncStorage (не шифруется)**
   - `src/stores/dataStore.ts:598` — `safeAsyncStorage` (AsyncStorage) хранит транзакции, счета, категории. Это не шифруется и доступно на рутированных устройствах.

7. **Отсутствие pin/biometric авторизации**
   - Нет проверки при повторном открытии приложения (pin-код, Touch ID / Face ID).

### Рекомендации

- Удалить все `console.log`, содержащие email, пароль или информацию о токене. Обернуть логирование в `if (__DEV__)`.
- Реализовать refresh-токен механизм.
- Убедиться, что в production-сборке `EXPO_PUBLIC_API_URL` всегда HTTPS.
- Добавить проверку размера перед записью в `SecureStore`, либо хранить в SecureStore только токен, а user-данные — в AsyncStorage.
- Добавить biometric/pin-lock при повторном открытии приложения.
- Шифровать чувствительные данные в AsyncStorage или не хранить их локально.

---

## 3. Быстродействие

**Оценка: 5/10**

### Проблемы

1. **Создание объекта стилей при каждом рендере (критично)**
   - `app/main/index.tsx:37-93` — объект `S` с ~60 стилями пересоздаётся при каждом рендере `HomeScreen`.
   - `src/components/ui/AddTransactionModal.tsx:254-553` — `StyleSheet.create()` вызывается при каждом рендере (2 вызова). Это дорогая операция.

2. **Отсутствие мемоизации подкомпонентов**
   - `app/main/index.tsx` — все секции (hero, stats, pulse, articles, actions) рендерятся инлайн без `React.memo`. При изменении любого состояния (например, `showAddModal`) перерендеривается весь экран.
   - `app/main/transactions/index.tsx` — каждый элемент списка транзакций рендерится как инлайн-компонент без `memo`.

3. **Отсутствие `getItemType` / `keyExtractor` оптимизаций в FlatList**
   - `app/main/chat/index.tsx:256-277` — FlatList без `estimatedItemSize`, без `maxToRenderPerBatch`, без `windowSize`.

4. **Повторные вычисления в рендере**
   - `app/main/transactions/index.tsx:345` — `transactions.filter(...).length` внутри JSX — фильтрация при каждом рендере без `useMemo`.
   - `app/main/transactions/index.tsx:287` — `getRangeLabel()` вызывается при каждом рендере без мемоизации.
   - `app/main/transactions/index.tsx:644` — `accounts.reduce(...)` внутри JSX в пикере счетов.

5. **`getHourlyRate()` вызывается как функция Zustand без мемоизации**
   - `app/main/index.tsx:133` — `useMemo(() => getHourlyRate(), [getHourlyRate])` — мемоизирован, но `getHourlyRate` — это стабильная ссылка, так что мемоизация не работает как предполагалось (зависимость не меняется).
   - `app/main/transactions/index.tsx:200-202` — `formatLifeHours(totalAmount, getHourlyRate())` — вызов `getHourlyRate()` при каждом рендере.

6. **Отсутствие ленивой загрузки экранов**
   - `app/main/_layout.tsx:29-44` — все экраны (`transactions`, `categories`, `wishlist`, `profile`, `accounts`, `goals`, `life-cost`, `chat`, `analytics`, `articles/[id]`) объявлены в одном Stack. Expo Router загружает их лениво, но каждый экран импортируется целиком при первой навигации.

7. **`onRefresh` без отмены (abort) запросов**
   - `app/main/index.tsx:123-127` — `onRefresh` вызывает `initializeData()` без возможности отмены при демонтировании компонента.

8. **Potential memory leak в Animation**
   - `app/main/chat/index.tsx:34-43` — `Spinner` компонент запускает `Animated.loop` и останавливает в cleanup — корректно.
   - Но `app/main/transactions/index.tsx:262-276` — `Animated.timing` в `animateOffset` не отменяется при демонтировании. Может вызвать "Warning: Can't perform a React state update on an unmounted component".

9. **Отсутствие `React.memo` на BalanceHero**
   - `src/components/features/BalanceHero.tsx:15` — `React.memo` используется — хорошо. Но props не имеют `areEqual` —浅比较 может не сработать корректно для числовых значений (всё ок).

### Рекомендации

- Вынести `StyleSheet.create()` за пределы компонентов (или использовать `useMemo` с зависимостью от `C`).
- Разбить большие экраны на мемоизированные подкомпоненты (`React.memo`).
- Добавить `estimatedItemSize` и `maxToRenderPerBatch` к FlatList в чате.
- Обернуть вычисления в рендере (фильтрации, reduce) в `useMemo`.
- Добавить AbortController для запросов в `onRefresh`.
- Отменять анимации в cleanup-эффектах.

---

## 4. Актуальность

**Оценка: 7/10**

### Проблемы

1. **Пакеты-призраки в зависимостях**
   - `package.json:45` — `"i": "^0.3.7"` — это npm-пакет-напоминалка (`i`), не нужный в production. Скорее всего, ошибка при установке.
   - `package.json:48` — `"npm": "^11.12.1"` — npm не должен быть runtime-зависимостью мобильного приложения.

2. **Mixed styling approach**
   - Проект использует одновременно NativeWind (Tailwind) через `className` **и** инлайн `style`. В `app/main/transactions/index.tsx` на одной строке можно увидеть и `className="flex-1"`, и `style={{ backgroundColor: C.card }}`. Это увеличивает bundle и создаёт путаницу.

3. **`react-native-web` в dependencies (не devDependencies)**
   - `package.json:62` — `"react-native-web": "^0.21.2"` — нужен только для web-сборки, не для мобильной.

4. **`patch-package` в postinstall**
   - `package.json:10` — `"postinstall": "patch-package"` — добавляет задержку при установке. Актуально, но стоит проверить, все ли патчи ещё нужны.

5. **`react-native-css-interop` v0.2.3**
   - `package.json:54` — `"react-native-css-interop": "^0.2.3"` — ранняя версия. NativeWind v4 уже имеет встроенную поддержку CSS interop.

6. **Отсутствие тестов**
   - Нет файлов `*.test.ts`, `*.test.tsx`, `*.spec.ts` в проекте.
   - Нет jest/vitest конфигурации.
   - Нет.detox или Maestro для E2E.

7. **Отсутствие ESLint / Prettier конфигурации**
   - Не найдены `.eslintrc`, `.prettierrc` — проект, вероятно, не проходит автоматический линтинг.

8. **`compatibilityJSON: 'v4'` в i18next**
   - `src/i18n/index.ts:105` — `compatibilityJSON: 'v4'` — это для совместимости со старыми форматами. В i18next v26 (используется) рекомендуется `v5`.

9. **`babel-plugin-module-resolver` при наличии path aliases в tsconfig**
   - `package.json:28` — `"babel-plugin-module-resolver": "^5.0.3"` — Expo SDK 54 с Metro уже поддерживает `tsconfig.json` paths через `@expo/metro`. Дублирование может вызывать конфликты.

### Рекомендации

- Удалить `"i"` и `"npm"` из dependencies.
- Перенести `react-native-web` в devDependencies.
- Унифицировать подход к стилям: выбрать либо NativeWind (`className`), либо инлайн-стили (`style` + `StyleSheet`).
- Добавить ESLint + Prettier с pre-commit хуками.
- Добавить хотя бы unit-тесты для stores (Zustand легко тестируется).
- Обновить `compatibilityJSON` до `'v5'` в i18next.
- Проверить необходимость `babel-plugin-module-resolver`.

---

## Приоритеты исправления

### Критично (до следующего релиза)

1. **Удалить `console.log` с email/паролем** — `src/services/auth.ts:10,21`, `app/auth/login.tsx:34`.
2. **Удалить пакеты-призраки** `"i"` и `"npm"` из `package.json`.
3. **Обеспечить HTTPS для API URL** — убрать HTTP-fallback в `src/services/api.ts:7`.

### Важно (в ближайшие 2 недели)

4. **Разбить `AddTransactionModal.tsx` (952 строки) на подкомпоненты** — это главный источник багов и сложности поддержки.
5. **Разбить `transactions/index.tsx` (682 строки) на подкомпоненты.**
6. **Вынести `StyleSheet.create()` за пределы компонентов** — `AddTransactionModal.tsx:254,486`, `app/main/index.tsx:37`.
7. **Замениить `(t as any).account?.currency` на типобезопасную утилиту.**
8. **Замениить хардкод-строки на i18n-ключи** — особенно в `transactions/index.tsx` и `chat/index.tsx`.
9. **Добавить ESLint + Prettier конфигурацию.**
10. **Реализовать refresh-токен механизм.**

### Желательно (в ближайший месяц)

11. **Добавить unit-тесты для stores** (`authStore`, `dataStore`, `themeStore`).
12. **Мемоизировать подкомпоненты** (`React.memo`) на домашних и транзакционных экранах.
13. **Унифицировать подход к стилям** (NativeWind или StyleSheet, не оба сразу).
14. **Добавить biometric/pin-lock** при повторном открытии приложения.
15. **Обновить `compatibilityJSON` до `'v5'` в i18next.**
16. **Убрать `babel-plugin-module-resolver`**, если `@expo/metro` обрабатывает paths.

---

## Итоговая сводка

| Критерий | Оценка | Тренд |
|---|---|---|
| Качество кода | 5/10 | Требует рефакторинга |
| Безопасность | 7/10 | Приемлемо, есть улучшения |
| Быстродействие | 5/10 | Есть проблемы с перерендерами |
| Актуальность | 7/10 | Современный стек, но нужен порядок |
| **Общая оценка** | **6/10** | **Рабочий прототип, нужен технический долг** |

Проект построен на актуальном стеке (Expo 54, React 19, Zustand, TanStack Query) и имеет продуманную архитектуру (роутинг, i18n, темизация, подписки). Однако быстрый рост функционала без параллельного рефакторинга привёл к накоплению технического долга: монолитные компоненты, дублирование кода, отсутствие тестов и линтинга. Рекомендуется провести спринт технического долга с фокусом на разделение крупных компонентов и унификацию стилей.
