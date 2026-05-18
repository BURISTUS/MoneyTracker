# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (бэкенд + мобайл)
- **E2E тесты: 86 тестов, все проходят** (`npm run test:e2e`)
- **Unit тесты: 98 тестов, все проходят** (`npm run test`)
- **i18n полная интеграция** — 200+ хардкод строк заменены на t() вызовы, EN+RU переводы полные, 18 языков с EN fallback
- **Фронтенд-аудит**: все проблемы из FRONTEND_REVIEW.md исправлены

## Спринт — текущие задачи

### Выполнено
- [x] **Unit-тесты (mobile)** — Jest + jest-expo, 98 тестов в 5 suites

### В очереди
- [ ] **Refresh-token механизм** — backend (модель, endpoints, ротация) + mobile (interceptor, refresh logic)
- [ ] **AddTransactionModal рефакторинг** — 952 строки → подкомпоненты
- [ ] **Biometric/pin-lock** — expo-local-authentication + PIN + lock screen

## Unit тесты — детали
- **Jest 29** + **jest-expo** preset
- **5 test suites**: formatters (18), transactionUtils (11), authStore (17), dataStore (23), subscriptionStore (29)
- **Файлы**: `jest.config.js`, `jest.setup.js`, `src/{utils,stores}/__tests__/*.test.ts`
- **Моки**: expo-secure-store, expo-file-system, expo-sharing, expo-clipboard, expo-image-picker, @react-native-async-storage, i18n
- **Скрипты**: `test`, `test:watch`, `test:coverage`

## Статус
- 0 ошибок TypeScript
- 86/86 E2E тестов проходят
- 98/98 unit тестов проходят
- ESLint + Prettier добавлены в mobile/
- Все Alert.alert/alert() заменены на Toast/ConfirmModal
