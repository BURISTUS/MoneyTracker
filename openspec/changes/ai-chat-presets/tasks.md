# Tasks: AI Chat with Presets

## Фаза 1: Backend

### Task 1.1: Prisma Schema
- [ ] Добавить модель `ChatMessage`: id, userId, role(USER/ASSISTANT), content, presetType(nullable), createdAt
- [ ] Миграция `npx prisma migrate dev --name add_chat_messages`

### Task 1.2: ChatModule
- [ ] `ChatModule` + `ChatController` + `ChatService`
- [ ] `GET /chat/messages` — история сообщений юзера
- [ ] `POST /chat/message` — отправить сообщение (пока заглушка, returns mock response)
- [ ] `DELETE /chat/messages` — очистить историю

### Task 1.3: Preset System
- [ ] Определить enum `PresetType`: SPENDING_REPORT, BUDGET_ANALYSIS, SAVINGS_TIPS
- [ ] Пресеты — это prompt templates для каждого типа

## Фаза 2: Mobile

### Task 2.1: Chat Screen
- [ ] Создать `/app/main/chat/index.tsx`
- [ ] FlatList с историей сообщений
- [ ] Input внизу + отправка

### Task 2.2: Presets UI
- [ ] Горизонтальный ScrollView с кнопками-пресетами вверху
- [ ] При нажатии — отправляется preset message

### Task 2.3: TabBar
- [ ] Добавить Chat tab (иконка message)
- [ ] Обновить TabBar.tsx

## Фаза 3: Integration
- [ ] Подключить TabBar layout к Chat screen
- [ ] 0 ошибок TypeScript
