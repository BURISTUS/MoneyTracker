# Активный контекст

## Текущий статус
- Backend: NestJS + Prisma + PostgreSQL + Redis (docker-compose)
- Mobile: React Native (Expo 54) + TypeScript + Zustand + React Query
- TypeScript: 0 ошибок (бэкенд + мобайл)
- **Геймификация полностью удалена** — приложение серьёзное, без игровых механик

## Ключевые изменения
- **Геймификация выпилена полностью**: XP, уровни, ачивки, стрики, статусы — всё удалено
- **Осталось**: life-hours (цена в часах работы), инкубатор (7-дневный cooldown), сумма сэкономленного через отказы
- Backend: GamificationModule удалён, контроллеры откатаны к чистым версиям
- Frontend: Home (чистый дашборд без RPG), Profile (имя + email), achievements экран удалён
- Prisma модели (UserGamification, Achievement и др.) оставлены в схеме — не мешают

## Статус
- 0 ошибок TypeScript
