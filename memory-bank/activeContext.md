# Активный контекст

## Текущая задача
Нет активной задачи. Все задачи выполнены.

## Последние изменения (сессия 2026-04-19 ночь)
- **CurrencyModule — ALL currencies from API:**
  - `refreshRates()` теперь делает `upsert` вместо `updateMany` — все ~300+ валют из API сохраняются в БД
  - Классификация валют: `classifyCurrency()` по множествам FIAT_CODES, CRYPTO_CODES, METAL_CODES
  - Batch upsert по 50 записей параллельно для производительности
  - `POPULAR_CODES` — 16 популярных валют с флагом `popular: true`
  - `KNOWN_SYMBOLS` — маппинг символов для ~70 основных валют
  - Seed при старте: только популярные валюты (с `popular: true`), остальные создаются при первом refreshRates
  - Новый endpoint `GET /currency/list?search=&type=&popular=&page=&limit=` — пагинированный список с поиском
- **Mobile — CurrencyPicker компонент:**
  - `src/components/ui/CurrencyPicker.tsx` — модальный пикер с поиском, табами (Все/Фиат/Крипто/Металлы), пагинацией
  - Дебаунс поиска 300мс, подгрузка при скролле (onEndReached)
  - Параметр `filterType` для ограничения типа валют (например только FIAT для счетов)
- **Mobile — Выбор основной валюты (Profile):**
  - В профиле новая карточка «Основная валюта» → открывает CurrencyPicker
  - `setUserCurrency()` теперь вызывает `PATCH /users/profile` для сохранения на сервер
- **Mobile — Валюта при создании счёта:**
  - В BottomSheet создания счёта добавлена кнопка выбора валюты
  - По умолчанию = userCurrency, picker фильтрует только FIAT
  - `createAccount()` теперь передаёт `currency` в API
- **Mobile — i18n для названий валют:**
  - `CurrencyPicker` использует `useTranslation()` → `t('currencies.${code}', item.name)` — перевод названия по коду валюты
  - `en.json` и `ru.json` содержат секцию `currencies` со ~150+ переводами названий (фиат, крипто, металлы)
  - `currencyPicker` секция с `searchPlaceholder` и `notFound`
  - `accounts.currency` ключ для кнопки выбора валюты при создании счёта
  - Fallback: если перевода нет — показывается английское название из БД

## Статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (backend + mobile)
- Все экраны используют CategoryIcon с vector иконками вместо emoji
