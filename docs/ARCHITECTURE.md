# Архитектура финансового трекера "Escape from Consumer Society"

## 1. Общая архитектура системы

```mermaid
flowchart TB
    subgraph Mobile Client - Expo + React Native + Tamagui
        UI[UI Components]
        State[Zustand Store]
        API[API Client]
        Push[Push Notifications]
        Lottie[Lottie Animations]
    end
    
    subgraph Backend - NestJS + Prisma
        Auth[JWT Auth Guard]
        Controllers[API Controllers]
        Services[Business Logic Services]
        Prisma[Prisma ORM]
    end
    
    subgraph Infrastructure
        DB[(PostgreSQL)]
        Cache[(Redis)]
        ExpoPush[Expo Push Service]
    end
    
    UI --> State
    State --> API
    API --> Auth
    Auth --> Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma --> DB
    Services --> Cache
    Push --> ExpoPush
    ExpoPush --> UI
```

## 2. Структура Monorepo (Turborepo)

```
money-tracker/
├── apps/
│   ├── backend/              # NestJS приложение
│   │   ├── src/
│   │   │   ├── auth/         # Модуль аутентификации
│   │   │   ├── users/        # Пользователи
│   │   │   ├── transactions/ # Транзакции
│   │   │   ├── categories/   # Категории
│   │   │   ├── accounts/     # Счета
│   │   │   ├── budget/       # Бюджетирование
│   │   │   ├── gamification/ # Геймификация
│   │   │   ├── wishlist/     # Инкубатор желаний
│   │   │   ├── life-cost/    # Калькулятор жизни
│   │   │   ├── challenges/   # Челленджи
│   │   │   ├── family/       # Семейный бюджет
│   │   │   └── common/       # Общие утилиты
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── test/
│   └── mobile/               # Expo + React Native
│       ├── src/
│       │   ├── app/          # Expo Router pages
│       │   ├── components/   # Tamagui компоненты
│       │   ├── features/     # Бизнес-логика по фичам
│       │   ├── store/        # Zustand stores
│       │   ├── hooks/        # Custom hooks
│       │   ├── utils/        # Утилиты
│       │   └── assets/       # Lottie анимации
│       └── tamagui.config.ts
├── packages/
│   ├── shared-types/         # TypeScript типы
│   ├── constants/            # Константы
│   └── ui-kit/               # Общие UI компоненты
├── turbo.json
├── package.json
└── docker-compose.yml
```

## 3. Схема базы данных (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === USER & AUTH ===

model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  name              String
  hourlyRate        Int?     // Стоимость часа в копейках
  monthlyHours      Int?     @default(176) // Рабочих часов в месяц
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  accounts          Account[]
  transactions      Transaction[]
  categories        Category[]
  budgets           Budget[]
  goals             Goal[]
  wishlist          WishlistItem[]
  gamification      UserGamification?
  achievements      UserAchievement[]
  familyMembers     FamilyMember[]
  challenges        UserChallenge[]
  notifications     Notification[]

  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("sessions")
}

// === ACCOUNTS & TRANSACTIONS ===

model Account {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        AccountType
  balance     BigInt   @default(0)
  currency    String   @default("RUB")
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@map("accounts")
}

enum AccountType {
  CASH
  BANK
  CREDIT
  INVESTMENT
  DEBT
}

model Category {
  id          String   @id @default(uuid())
  userId      String
  name        String
  type        CategoryType
  icon        String?
  color       String?
  isSystem    Boolean  @default(false)
  isBaseNeed  Boolean  @default(false) // Базовая потребность
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]

  @@map("categories")
}

enum CategoryType {
  INCOME
  EXPENSE
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String
  accountId   String
  categoryId  String
  amount      BigInt
  type        TransactionType
  description String?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  account     Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@map("transactions")
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

// === BUDGET & GOALS ===

model Budget {
  id          String   @id @default(uuid())
  userId      String
  categoryId  String
  amount      BigInt
  period      BudgetPeriod
  startDate   DateTime
  endDate     DateTime
  alertThreshold Int @default(80) // Процент для алерта
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@map("budgets")
}

enum BudgetPeriod {
  WEEKLY
  MONTHLY
  YEARLY
}

model Goal {
  id          String   @id @default(uuid())
  userId      String
  name        String
  targetAmount BigInt
  currentAmount BigInt  @default(0)
  deadline    DateTime
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("goals")
}

// === GAMIFICATION ===

model UserGamification {
  id              String   @id @default(uuid())
  userId          String   @unique
  xp              Int      @default(0)
  level           Int      @default(1)
  savedAmount     BigInt   @default(0) // Сумма REJECTED желаний
  status          GamificationStatus @default(CONSUMER_DRONE)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_gamification")
}

enum GamificationStatus {
  CONSUMER_DRONE    // Хомяк в колесе
  AWAKENED          // Просыпающийся
  ASCETIC           // Аскет
  STRATEGIST        // Стратег
  CAPITALIST        // Капиталист
  FINANCIAL_ARCHITECT // Свободный человек
}

model Achievement {
  id              String   @id @default(uuid())
  code            String   @unique // "MARKETING_KILLER", "COFFEE_DETOX", etc.
  name            String
  description     String
  iconUrl         String?
  xpReward        Int
  conditionType   AchievementCondition
  conditionValue  Json     // { "categoryId": "...", "days": 90 }
  tier            AchievementTier @default(BRONZE)
  createdAt       DateTime @default(now())

  users           UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id              String   @id @default(uuid())
  userId          String
  achievementId   String
  earnedAt        DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement     Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

enum AchievementCondition {
  NO_SPEND_CATEGORY_DAYS      // Не тратить в категории N дней
  WISHLIST_REJECTED           // Отклонить желание из wishlist
  BUDGET_UNDER_LIMIT          // Уложиться в бюджет
  STREAK_DAYS                 // N дней подряд
  TOTAL_SAVED_AMOUNT          // Сэкономить сумму
}

enum AchievementTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

// === WISHLIST - Инкубатор желаний ===

model WishlistItem {
  id              String   @id @default(uuid())
  userId          String
  name            String   // "Dyson Styler"
  price           BigInt
  imageUrl        String?
  category        String?
  status          WishlistStatus @default(PENDING)
  cooldownDays    Int      @default(7)
  createdAt       DateTime @default(now())
  cooldownEnds    DateTime
  decidedAt       DateTime?
  purchasedAt     DateTime?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("wishlist_items")
}

enum WishlistStatus {
  PENDING       // Ожидает решения (таймер идет)
  READY         // Таймер истек, можно решить
  REJECTED      // "Мне это не нужно" - победа!
  PURCHASED     // Купил - поражение
  EXPIRED       // Так и не решил за N дней
}

// === CHALLENGES ===

model Challenge {
  id              String   @id @default(uuid())
  code            String   @unique // "NO_SPEND_MONTH"
  name            String
  description     String
  type            ChallengeType
  config          Json     // { "categoryId": "...", "durationDays": 30 }
  xpReward        Int
  iconUrl         String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  users           UserChallenge[]

  @@map("challenges")
}

model UserChallenge {
  id              String   @id @default(uuid())
  userId          String
  challengeId     String
  status          ChallengeStatus @default(ACTIVE)
  startDate       DateTime @default(now())
  endDate         DateTime
  progress        Json     // { "spentAmount": 5000, "targetAmount": 10000 }
  completedAt     DateTime?
  isWinner        Boolean?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  challenge       Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  @@unique([userId, challengeId, startDate])
  @@map("user_challenges")
}

enum ChallengeType {
  PERSONAL       // Личный челлендж
  FAMILY         // Семейный - кто меньше потратит
  SOCIAL         // Общий с другими пользователями
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  FAILED
}

// === FAMILY ===

model Family {
  id          String   @id @default(uuid())
  name        String
  inviteCode  String   @unique
  createdAt   DateTime @default(now())

  members     FamilyMember[]
}

model FamilyMember {
  id          String   @id @default(uuid())
  familyId    String
  userId      String   @unique
  role        FamilyRole @default(MEMBER)
  joinedAt    DateTime @default(now())

  family      Family   @relation(fields: [familyId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([familyId, userId])
  @@map("family_members")
}

enum FamilyRole {
  OWNER
  ADMIN
  MEMBER
}

// === NOTIFICATIONS ===

model Notification {
  id          String   @id @default(uuid())
  userId      String
  type        NotificationType
  title       String
  body        String
  data        Json?    // { "wishlistItemId": "..." }
  isRead      Boolean  @default(false)
  sentAt      DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

enum NotificationType {
  WISHLIST_READY          // Желание готово к решению
  BUDGET_ALERT            // Превышение бюджета
  CHALLENGE_INVITE        // Приглашение в челлендж
  LEVEL_UP                // Повышение уровня
  ACHIEVEMENT_EARNED      // Получена ачивка
  STREAK_WARNING          // Угроза стрику
}
```

## 4. API Endpoints

### Authentication
```
POST   /auth/register           # Регистрация
POST   /auth/login              # Логин
POST   /auth/refresh            # Refresh токен
POST   /auth/logout             # Выход
GET    /auth/me                 # Текущий пользователь
```

### Users
```
GET    /users/profile           # Профиль пользователя
PATCH  /users/profile           # Обновить профиль
PATCH  /users/hourly-rate       # Установить стоимость часа
DELETE /users/account           # Удалить аккаунт
```

### Accounts
```
GET    /accounts                # Все счета
POST   /accounts                # Создать счет
GET    /accounts/:id            # Один счет
PATCH  /accounts/:id            # Обновить счет
DELETE /accounts/:id            # Удалить счет
```

### Transactions
```
GET    /transactions            # Список транзакций (с фильтрами)
POST   /transactions            # Создать транзакцию
GET    /transactions/:id        # Одна транзакция
PATCH  /transactions/:id        # Обновить
DELETE /transactions/:id        # Удалить
GET    /transactions/summary    # Сводка за период
```

### Categories
```
GET    /categories              # Категории пользователя
POST   /categories              # Создать категорию
PATCH  /categories/:id          # Обновить
DELETE /categories/:id          # Удалить
```

### Budgets
```
GET    /budgets                 # Бюджеты
POST   /budgets                 # Создать бюджет
GET    /budgets/:id             # Один бюджет
PATCH  /budgets/:id             # Обновить
DELETE /budgets/:id             # Удалить
GET    /budgets/:id/progress    # Прогресс бюджета
```

### Goals
```
GET    /goals                   # Цели
POST   /goals                   # Создать цель
PATCH  /goals/:id               # Обновить прогресс
DELETE /goals/:id               # Удалить
```

### Gamification
```
GET    /gamification/profile    # Профиль геймификации
GET    /gamification/levels     # Все уровни и переходы
GET    /gamification/next-level # Что нужно для след. уровня
```

### Achievements
```
GET    /achievements            # Все достижения
GET    /achievements/earned     # Заработанные
POST   /achievements/check      # Проверить новые ачивки
```

### Wishlist (Инкубатор желаний)
```
GET    /wishlist                # Все желания
POST   /wishlist                # Добавить желание
GET    /wishlist/:id            # Одно желание
PATCH  /wishlist/:id            # Обновить (название, цену)
DELETE /wishlist/:id            # Удалить
POST   /wishlist/:id/reject     # "Мне это не нужно" - победа!
POST   /wishlist/:id/purchase   # "Купил" - поражение
POST   /wishlist/:id/snooze     # Отложить на 7 дней
GET    /wishlist/:id/calculate  # Калькулятор сложного %
```

### Life Cost (Цена жизни)
```
GET    /life-cost/rate          # Real Hourly Rate
POST   /life-cost/calculate     # Конвертировать сумму в часы
POST   /life-cost/simulate      # Симуляция инвестиций
```

### Challenges
```
GET    /challenges              # Доступные челленджи
POST   /challenges/:id/join     # Присоединиться
GET    /challenges/:id/status   # Статус
GET    /challenges/my           # Мои активные
POST   /challenges/:id/report   # Отправить отчет
```

### Family
```
POST   /family                  # Создать семью
POST   /family/join             # Присоединиться по коду
GET    /family                  # Моя семья
GET    /family/members          # Участники
DELETE /family/members/:id      # Удалить участника
GET    /family/budget           # Семейный бюджет
GET    /family/compare          # Сравнение трат участников
```

## 5. Сервисы (Business Logic)

### GamificationService

```typescript
@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    private achievements: AchievementChecker,
  ) {}

  // Начисление XP за отклоненное желание
  async addXpForRejectedWish(userId: string, amount: bigint): Promise<void> {
    const xp = Number(amount) / 100; // 1 XP за каждые 100 рублей
    
    await this.prisma.userGamification.update({
      where: { userId },
      data: {
        xp: { increment: xp },
        savedAmount: { increment: amount },
      },
    });

    await this.checkLevelUp(userId);
    await this.checkAchievements(userId);
  }

  // Проверка level-up
  async checkLevelUp(userId: string): Promise<void> {
    const profile = await this.prisma.userGamification.findUnique({ where: { userId } });
    const newLevel = this.calculateLevel(profile.xp);
    
    if (newLevel > profile.level) {
      await this.prisma.userGamification.update({
        where: { userId },
        data: { level: newLevel, status: this.getStatusForLevel(newLevel) },
      });
      
      await this.notificationService.send(userId, {
        type: 'LEVEL_UP',
        title: 'Новый уровень! 🎉',
        body: `Вы достигли уровня ${newLevel}!`,
      });
    }
  }

  private calculateLevel(xp: number): number {
    // Формула: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private getStatusForLevel(level: number): GamificationStatus {
    if (level >= 20) return 'FINANCIAL_ARCHITECT';
    if (level >= 15) return 'CAPITALIST';
    if (level >= 10) return 'STRATEGIST';
    if (level >= 5) return 'ASCETIC';
    return 'CONSUMER_DRONE';
  }
}
```

### WishlistService

```typescript
@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
    private notifications: NotificationService,
  ) {}

  async createItem(userId: string, data: CreateWishlistDto): Promise<WishlistItem> {
    const cooldownDays = data.cooldownDays || 7;
    
    return this.prisma.wishlistItem.create({
      data: {
        userId,
        name: data.name,
        price: data.price,
        category: data.category,
        cooldownDays,
        cooldownEnds: new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000),
        status: 'PENDING',
      },
    });
  }

  async reject(userId: string, itemId: string): Promise<void> {
    const item = await this.prisma.wishlistItem.findUnique({ where: { id: itemId } });
    
    // Проверяем, что таймер истек
    if (item.status === 'PENDING' && item.cooldownEnds > new Date()) {
      throw new BadException('Таймер еще не истек');
    }

    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { status: 'REJECTED', decidedAt: new Date() },
    });

    // Начисляем XP и обновляем savedAmount
    await this.gamification.addXpForRejectedWish(userId, item.price);

    // Запланировать уведомление о сложных процентах
    await this.notifications.scheduleCompoundInterest(userId, item);
  }

  async purchase(userId: string, itemId: string): Promise<void> {
    await this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { status: 'PURCHASED', decidedAt: new Date(), purchasedAt: new Date() },
    });

    // Логируем "поражение" для статистики
    await this.trackFailedPurchase(userId, itemId);
  }

  async calculateCompoundInterest(item: WishlistItem, years: number = 10): Promise<bigint> {
    const annualRate = 0.12; // 12% годовых
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    
    // Формула сложных процентов
    const futureValue = Number(item.price) * Math.pow(1 + monthlyRate, months);
    
    return BigInt(Math.round(futureValue));
  }
}
```

### LifeCostService

```typescript
@Injectable()
export class LifeCostService {
  constructor(private prisma: PrismaService) {}

  async getHourlyRate(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user.hourlyRate) {
      throw new BadException('Hourly rate не установлен');
    }

    return user.hourlyRate / 100; // Конвертируем из копеек в рубли
  }

  async calculateHours(userId: string, amount: bigint): Promise<HoursCalculation> {
    const hourlyRate = await this.getHourlyRate(userId);
    const hours = Number(amount) / 100 / hourlyRate;
    
    return {
      rubles: Number(amount),
      hours: Math.round(hours * 10) / 10,
      workingDays: Math.round(hours / 8 * 10) / 10,
      message: this.generateMessage(hours),
    };
  }

  private generateMessage(hours: number): string {
    const days = Math.round(hours / 8 * 10) / 10;
    
    if (days >= 20) {
      return `Это ${Math.round(days)} рабочих дней. Ты готов провести месяц в офисе ради этого?`;
    }
    if (days >= 10) {
      return `Это ${Math.round(days)} рабочих дней. Две недели твоей жизни.`;
    }
    if (days >= 5) {
      return `Это ${Math.round(days)} рабочих дней. Целая неделя.`;
    }
    return `Это ${Math.round(hours)} часов твоей жизни.`;
  }
}
```

## 6. Frontend архитектура (Expo + Tamagui)

### Стек технологий
- **Expo Router** - файловая маршрутизация
- **Tamagui** - высокопроизводительные компоненты
- **Zustand** - стейт-менеджмент
- **TanStack Query** - серверный стейт
- **lottie-react-native** - анимации
- **expo-notifications** - пуш-уведомления

### Структура экранов

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (main)/
│   ├── _layout.tsx
│   ├── index.tsx              # Дашборд
│   ├── transactions/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Список
│   │   └── create.tsx         # Добавить
│   ├── accounts/
│   ├── budget/
│   ├── goals/
│   ├── wishlist/              # Инкубатор желаний
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Список карточек с таймерами
│   │   └── create.tsx
│   ├── gamification/
│   │   ├── index.tsx          # Прогресс и уровни
│   │   ├── achievements.tsx   # Ачивки
│   │   └── profile.tsx        # Аватар и статус
│   ├── challenges/
│   ├── family/
│   └── settings/
│       ├── profile.tsx        # Настройка hourly rate
│       └── notifications.tsx
└── +html.tsx                  # Lottie анимации
```

### Основные компоненты

```typescript
// components/WishlistCard.tsx
import { YStack, Text, Button, Progress, XStack } from 'tamagui';
import { Timer } from './Timer';
import { LockIcon } from './icons';

interface WishlistCardProps {
  item: WishlistItem;
  onReject: () => void;
  onPurchase: () => void;
  onSnooze: () => void;
}

export function WishlistCard({ item, onReject, onPurchase, onSnooze }: WishlistCardProps) {
  const isFrozen = item.status === 'PENDING' && item.cooldownEnds > new Date();
  
  return (
    <YStack 
      borderRadius="$4" 
      backgroundColor={isFrozen ? "$gray3" : "$cardBackground"}
      opacity={isFrozen ? 0.7 : 1}
    >
      {isFrozen && (
        <XStack justifyContent="center" padding="$2" background="$blue5">
          <LockIcon />
          <Text>Таймер активен</Text>
          <Timer targetDate={item.cooldownEnds} />
        </XStack>
      )}
      
      <Text fontSize="$6" fontWeight="bold">{item.name}</Text>
      <Text fontSize="$4" color="$green10">
        {formatCurrency(item.price)}
      </Text>
      
      {item.status === 'READY' && (
        <XStack space="$3" marginTop="$3">
          <Button 
            background="$red10" 
            flex={2}
            onPress={onReject}
          >
            Мне это не нужно
          </Button>
          <Button 
            background="$green10" 
            flex={1}
            onPress={onPurchase}
          >
            Купил
          </Button>
        </XStack>
      )}
    </YStack>
  );
}

// components/LifeCostBadge.tsx
interface LifeCostBadgeProps {
  amount: number;
  size?: 'small' | 'medium' | 'large';
}

export function LifeCostBadge({ amount, size = 'small' }: LifeCostBadgeProps) {
  const { hours, message } = useLifeCostConverter(amount);
  
  return (
    <YStack 
      background="$yellow2" 
      padding={size === 'small' ? '$2' : '$3'}
      borderRadius="$3"
    >
      <Text 
        fontSize={size === 'small' ? '$2' : '$4'}
        color="$yellow11"
        fontWeight="500"
      >
        {hours}ч
      </Text>
      {size !== 'small' && (
        <Text fontSize="$2" color="$yellow10">
          {message}
        </Text>
      )}
    </YStack>
  );
}
```

### Анимации (Lottie)

```typescript
// components/animations/RejectionAnimation.tsx
import LottieView from 'lottie-react-native';
import { useRef, useEffect } from 'react';
import { YStack } from 'tamagui';

export function RejectionAnimation({ onComplete }: { onComplete: () => void }) {
  const animationRef = useRef<LottieView>(null);
  
  useEffect(() => {
    animationRef.current?.play();
  }, []);

  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <LottieView
        ref={animationRef}
        source={require('../../assets/lottie/explosion.json')}
        autoPlay={false}
        loop={false}
        onAnimationFinish={onComplete}
        style={{ width: 300, height: 300 }}
      />
    </YStack>
  );
}
```

## 7. Сторы (Zustand)

```typescript
// store/wishlistStore.ts
import { create } from 'zustand';
import { trpc } from '../utils/trpc';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (data: CreateWishlistDto) => Promise<void>;
  rejectItem: (id: string) => Promise<void>;
  purchaseItem: (id: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  
  fetchItems: async () => {
    set({ isLoading: true });
    const items = await trpc.wishlist.get.query();
    set({ items, isLoading: false });
  },
  
  addItem: async (data) => {
    const newItem = await trpc.wishlist.create.mutate(data);
    set((state) => ({ items: [...state.items, newItem] }));
  },
  
  rejectItem: async (id) => {
    await trpc.wishlist.reject.mutate({ id });
    
    // Показать анимацию взрыва
    // Начислить XP (будет обновлено через триггер)
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: 'REJECTED' } : item
      ),
    }));
  },
  
  purchaseItem: async (id) => {
    await trpc.wishlist.purchase.mutate({ id });
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: 'PURCHASED' } : item
      ),
    }));
  },
}));
```

## 8. Push Notifications

```typescript
// utils/notifications.ts
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './register';

export async function setupNotifications(userId: string) {
  const token = await registerForPushNotificationsAsync();
  
  if (token) {
    await fetch('/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token, userId }),
    });
  }

  // Обработчик уведомлений
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Настройка категорий действий
export function configureNotificationCategories() {
  Notifications.setNotificationCategoryCollection('WISHLIST_READY', [
    {
      identifier: 'REJECT',
      buttonTitle: 'Мне это не нужно',
      options: { isDestructive: true },
    },
    {
      identifier: 'PURCHASE',
      buttonTitle: 'Купил',
      options: {},
    },
    {
      identifier: 'SNOOZE',
      buttonTitle: 'Отложить',
      options: {},
    },
  ]);
}
```

## 9. Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: money-tracker-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-money_tracker}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secret}
      POSTGRES_DB: ${POSTGRES_DB:-money_tracker}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U money_tracker"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: money-tracker-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    container_name: money-tracker-backend
    environment:
      DATABASE_URL: postgresql://money_tracker:secret@postgres:5432/money_tracker
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-your-secret-key}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

## 10. План реализации - Фазы

### Фаза 1: Инфраструктура (1-2 дня)
- [ ] Turborepo настройка
- [ ] NestJS + Prisma + PostgreSQL
- [ ] Expo + Tamagui
- [ ] Docker-compose
- [ ] Базовая аутентификация

### Фаза 2: Core Finance (2-3 дня)
- [ ] Accounts, Transactions, Categories CRUD
- [ ] Budgets and Goals
- [ ] Дашборд с статистикой

### Фаза 3: Gamification Core (2-3 дня)
- [ ] UserGamification модель
- [ ] Gamification Service
- [ ] XP and Level system
- [ ] Интеграция в транзакции

### Фаза 4: Wishlist (3 дня)
- [ ] Wishlist CRUD
- [ ] Таймер и cooldown логика
- [ ] Интеграция с Gamification (XP за REJECTED)
- [ ] Калькулятор сложных процентов
- [ ] Lottie анимации

### Фаза 5: Life Cost (1-2 дня)
- [ ] Hourly Rate калькулятор
- [ ] Universal компонент конвертера
- [ ] Интеграция во все экраны

### Фаза 6: Achievements (2 дня)
- [ ] Achievement модель и типы
- [ ] Achievement Checker Service
- [ ] UI для отображения ачивок

### Фаза 7: Challenges & Family (2-3 дня)
- [ ] Challenge система
- [ ] Family режим
- [ ] Сравнение прогресс-баров

### Фаза 8: Polish & Deploy (2 дня)
- [ ] Push notifications
- [ ] Lottie анимации
- [ ] Тесты
- [ ] CI/CD
- [ ] Документация

**Общее время: ~17-20 рабочих дней**
