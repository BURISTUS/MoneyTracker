# План разработки мобильного приложения

## Введение

На основе завершенного backend с модульной архитектурой, разрабатываем мобильное приложение на стеке **Expo + React Native + Tamagui**.

---

## 1. Технический стек

### Frontend (Mobile)
- **Expo** - платформа для React Native
- **React Native** - фреймворк для кроссплатформенной разработки
- **Tamagui** - UI библиотека (аналог Chakra UI / styled-components)
- **Expo Router** - файловая маршрутизация
- **TanStack Query (React Query)** - управление состоянием данных
- **Zustand** - локальное состояние
- **Lottie** - анимации
- **Expo Notifications** - push-уведомления

### Backend API (уже реализован)
- **NestJS** - API сервер
- **Prisma** - ORM
- **PostgreSQL** - БД
- **Redis** - кэш

---

## 2. Структура проекта mobile

```
mobile/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── (auth)/             # Группа экранов авторизации
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (main)/             # Основные экраны
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Дашборд
│   │   │   ├── transactions/
│   │   │   ├── budget/
│   │   │   ├── goals/
│   │   │   ├── wishlist/
│   │   │   ├── life-cost/
│   │   │   ├── achievements/
│   │   │   ├── forecast/
│   │   │   └── profile/
│   │   └── _layout.tsx
│   ├── components/             # Компоненты
│   │   ├── ui/                 # Базовые UI компоненты
│   │   ├── charts/             # Графики
│   │   ├── cards/              # Карточки
│   │   └── forms/              # Формы
│   ├── features/               # Feature-based модули
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── budget/
│   │   ├── wishlist/
│   │   ├── gamification/
│   │   └── forecast/
│   ├── hooks/                  # Custom hooks
│   ├── services/               # API сервисы
│   │   ├── api.ts              # Базовый API клиент
│   │   ├── auth.ts
│   │   ├── transactions.ts
│   │   └── ...
│   ├── stores/                 # Zustand stores
│   ├── theme/                  # Tamagui тема
│   ├── utils/                  # Утилиты
│   └── types/                  # TypeScript типы
├── package.json
├── app.config.ts
└── tamagui.config.ts
```

---

## 3. Этапы разработки

### Фаза 1: Настройка проекта (1-2 дня)

#### 1.1 Инициализация Expo проекта
```bash
cd mobile
npx create-expo-app@latest . --template blank-typescript
```

#### 1.2 Установка зависимостей
```bash
# UI
npm install tamagui @tamagui/core @tamagui/font-inter

# Навигация
npm install expo-router

# Состояние данных
npm install @tanstack/react-query

# Анимации
npm install lottie-react-native

# Уведомления
npm install expo-notifications

# Утилиты
npm install date-fns clsx
```

#### 1.3 Настройка Tamagui темы
```typescript
// src/theme/index.ts
import { createTamagui } from '@tamagui/core'

export const tamaguiConfig = createTamagui({
  themes: {
    light: {
      background: '#FFFFFF',
      text: '#000000',
      primary: '#007AFF',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
    },
    dark: {
      background: '#000000',
      text: '#FFFFFF',
      primary: '#0A84FF',
      success: '#30D158',
      warning: '#FF9F0A',
      error: '#FF453A',
    },
  },
})

export type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}
```

#### 1.4 Настройка API клиента
```typescript
// src/services/api.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api',
})

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

---

### Фаза 2: Аутентификация (1-2 дня)

#### 2.1 Экран входа
```typescript
// src/app/(auth)/login.tsx
import { useState } from 'react'
import { YStack, Input, Button, Text } from 'tamagui'
import { useRouter } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data),
    onSuccess: async (response) => {
      await SecureStore.setItemAsync('authToken', response.data.token)
      router.replace('/(main)/')
    },
  })

  return (
    <YStack flex={1} justifyContent="center" padding="$4" space="$4">
      <Text fontSize="$8" fontWeight="bold" textAlign="center">
        Money Tracker
      </Text>
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <Input
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        onPress={() => loginMutation.mutate({ email, password })}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Вход...' : 'Войти'}
      </Button>
      
      <Button variant="ghost" onPress={() => router.push('/(auth)/register')}>
        Нет аккаунта? Регистрация
      </Button>
    </YStack>
  )
}
```

#### 2.2 Экран регистрации
Аналогичная структура с полями: name, email, password, hourlyRate.

---

### Фаза 3: Дашборд (2-3 дня)

#### 3.1 Основной макет
```typescript
// src/app/(main)/_layout.tsx
import { Tabs } from 'expo-router'
import { Home, CreditCard, Target, User } from '@tamagui/lucide-icons'

export default function MainLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color }) => <Home color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Транзакции',
          tabBarIcon: ({ color }) => <CreditCard color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Цели',
          tabBarIcon: ({ color }) => <Target color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <User color={color} />,
        }}
      />
    </Tabs>
  )
}
```

#### 3.2 FinancialSummaryCard
```typescript
// src/components/cards/FinancialSummaryCard.tsx
import { YStack, XStack, Text, Progress } from 'tamagui'

interface FinancialSummaryCardProps {
  totalSavings: number
  totalDebt: number
  netWorth: number
  monthlySavingsGrowth: number
  monthlyDebtReduction: number
}

export function FinancialSummaryCard({
  totalSavings,
  totalDebt,
  netWorth,
  monthlySavingsGrowth,
  monthlyDebtReduction,
}: FinancialSummaryCardProps) {
  const formatCurrency = (amount: number) => 
    `₽${(amount / 100).toLocaleString('ru-RU')}`

  return (
    <YStack padding="$4" background="$cardBackground" borderRadius="$4" space="$3">
      <Text fontSize="$5" fontWeight="bold">Финансовый прогноз</Text>
      
      <XStack justifyContent="space-between">
        <YStack>
          <Text color="$green10" fontSize="$3">Сбережения</Text>
          <Text fontSize="$6" fontWeight="bold">{formatCurrency(totalSavings)}</Text>
        </YStack>
        <YStack>
          <Text color="$red10" fontSize="$3">Долги</Text>
          <Text fontSize="$6" fontWeight="bold">{formatCurrency(totalDebt)}</Text>
        </YStack>
        <YStack>
          <Text color="$blue10" fontSize="$3">Чистая стоимость</Text>
          <Text 
            fontSize="$6" 
            fontWeight="bold"
            color={netWorth >= 0 ? '$green10' : '$red10'}
          >
            {formatCurrency(netWorth)}
          </Text>
        </YStack>
      </XStack>

      <YStack space="$2">
        <XStack justifyContent="space-between">
          <Text fontSize="$2" color="$gray10">
            Рост сбережений за месяц
          </Text>
          <Text color="$green10" fontSize="$2">
            +{formatCurrency(monthlySavingsGrowth)}
          </Text>
        </XStack>
        <XStack justifyContent="space-between">
          <Text fontSize="$2" color="$gray10">
            Погашение долгов за месяц
          </Text>
          <Text color="$green10" fontSize="$2">
            -{formatCurrency(monthlyDebtReduction)}
          </Text>
        </XStack>
      </YStack>
    </YStack>
  )
}
```

#### 3.3 Gamification Progress Card
```typescript
// src/components/cards/GamificationCard.tsx
interface GamificationCardProps {
  level: number
  xp: number
  xpToNextLevel: number
  status: string
  progress: number
}

export function GamificationCard({
  level,
  xp,
  xpToNextLevel,
  status,
  progress,
}: GamificationCardProps) {
  return (
    <YStack padding="$4" background="$cardBackground" borderRadius="$4" space="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <Text fontSize="$4" fontWeight="bold">Уровень {level}</Text>
          <Text color="$gray10" fontSize="$2">{status}</Text>
        </YStack>
        <YStack alignItems="flex-end">
          <Text fontSize="$6" fontWeight="bold" color="$primary">
            {xp} XP
          </Text>
          <Text fontSize="$2" color="$gray10">
            до следующего уровня: {xpToNextLevel}
          </Text>
        </YStack>
      </XStack>
      
      <Progress value={progress} size="$2">
        <Progress.Track>
          <Progress.Indicator background="$primary" />
        </Progress.Track>
      </Progress>
    </YStack>
  )
}
```

---

### Фаза 4: Транзакции (2 дня)

#### 4.1 Список транзакций
```typescript
// src/app/(main)/transactions/index.tsx
import { FlatList, YStack, XStack, Text, Avatar } from 'tamagui'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: string
  category: { name: string; icon: string }
}

export default function TransactionsScreen() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get('/transactions').then(r => r.data),
  })

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === 'INCOME'
    const amount = `₽${(Math.abs(item.amount) / 100).toLocaleString('ru-RU')}`

    return (
      <XStack 
        padding="$3" 
        borderBottomWidth={1} 
        borderBottomColor="$gray4"
        justifyContent="space-between"
        alignItems="center"
      >
        <XStack space="$3" alignItems="center">
          <Avatar circular size="$3" background={isIncome ? '$green4' : '$red4'}>
            <Avatar.Text color={isIncome ? '$green10' : '$red10'}>
              {item.category.icon}
            </Avatar.Text>
          </Avatar>
          <YStack>
            <Text fontWeight="500">{item.description || item.category.name}</Text>
            <Text fontSize="$2" color="$gray10">
              {format(new Date(item.date), 'd MMMM yyyy', { locale: ru })}
            </Text>
          </YStack>
        </XStack>
        <Text 
          fontWeight="600" 
          color={isIncome ? '$green10' : '$red10'}
        >
          {isIncome ? '+' : '-'}{amount}
        </Text>
      </XStack>
    )
  }

  if (isLoading) return <Text>Загрузка...</Text>

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
    />
  )
}
```

---

### Фаза 5: Инкубатор желаний (2 дня)

#### 5.1 Экран с таймерами
```typescript
// src/app/(main)/wishlist/index.tsx
import { YStack, Text, Button, XStack, Circle, Progress } from 'tamagui'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { format, differenceInDays } from 'date-fns'

interface WishlistItem {
  id: string
  name: string
  price: number
  status: 'PENDING' | 'READY' | 'REJECTED' | 'PURCHASED'
  cooldownEnds: string
  createdAt: string
}

export default function WishlistScreen() {
  const queryClient = useQueryClient()
  
  const { data: items } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then(r => r.data),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/wishlist/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })

  const purchaseMutation = useMutation({
    mutationFn: (id: string) => api.post(`/wishlist/${id}/purchase`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })

  return (
    <YStack flex={1} padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="bold">Инкубатор желаний</Text>
      <Text color="$gray10">
        Подождите 7 дней перед покупкой, чтобы избежать импульсивных трат
      </Text>

      {items?.map((item: WishlistItem) => {
        const daysLeft = differenceInDays(new Date(item.cooldownEnds), new Date())
        const progress = Math.max(0, (7 - daysLeft) / 7 * 100)

        return (
          <YStack 
            key={item.id}
            padding="$4" 
            background="$cardBackground" 
            borderRadius="$4"
            space="$3"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" fontWeight="600">{item.name}</Text>
              <Text fontSize="$5" fontWeight="bold" color="$primary">
                ₽{(item.price / 100).toLocaleString('ru-RU')}
              </Text>
            </XStack>

            {item.status === 'PENDING' && (
              <YStack space="$2">
                <XStack justifyContent="space-between">
                  <Text fontSize="$2" color="$gray10">
                    Ожидание: {daysLeft} дн.
                  </Text>
                  <Text fontSize="$2" color="$gray10">
                    {format(new Date(item.cooldownEnds), 'd MMMM', { locale: ru })}
                  </Text>
                </XStack>
                <Progress value={progress} size="$2">
                  <Progress.Track>
                    <Progress.Indicator background="$primary" />
                  </Progress.Track>
                </Progress>
              </YStack>
            )}

            {item.status === 'READY' && (
              <XStack space="$3">
                <Button 
                  flex={1} 
                  variant="outlined" 
                  color="$red"
                  onPress={() => rejectMutation.mutate(item.id)}
                >
                  Отклонить
                </Button>
                <Button 
                  flex={1} 
                  background="$green"
                  onPress={() => purchaseMutation.mutate(item.id)}
                >
                  Купить
                </Button>
              </XStack>
            )}
          </YStack>
        )
      })}
    </YStack>
  )
}
```

---

### Фаза 6: Financial Forecast (2-3 дня)

#### 6.1 Экран прогнозов
```typescript
// src/app/(main)/forecast/index.tsx
import { YStack, Text, XStack, Tabs } from 'tamagui'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { LineChart } from '@/components/charts/LineChart'

export default function ForecastScreen() {
  const { data: quickSummary } = useQuery({
    queryKey: ['forecast', 'quick-summary'],
    queryFn: () => api.get('/forecasts/quick-summary').then(r => r.data),
  })

  const { data: forecast } = useQuery({
    queryKey: ['forecast', 'calculate'],
    queryFn: () => api.post('/forecasts/calculate').then(r => r.data),
  })

  return (
    <YStack flex={1} padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="bold">Финансовый прогноз</Text>

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Tab value="overview">Обзор</Tabs.Tab>
          <Tabs.Tab value="deposits">Вклады</Tabs.Tab>
          <Tabs.Tab value="loans">Кредиты</Tabs.Tab>
          <Tabs.Tab value="goals">Цели</Tabs.Tab>
        </Tabs.List>

        <Tabs.Content value="overview">
          <YStack space="$4">
            {/* Текущее состояние */}
            <XStack space="$4" justifyContent="space-around">
              <YStack alignItems="center">
                <Text color="$green10" fontSize="$3">Сбережения</Text>
                <Text fontSize="$7" fontWeight="bold">
                  ₽{(quickSummary?.current.totalSavings / 100).toLocaleString('ru-RU')}
                </Text>
              </YStack>
              <YStack alignItems="center">
                <Text color="$red10" fontSize="$3">Долги</Text>
                <Text fontSize="$7" fontWeight="bold">
                  ₽{(quickSummary?.current.totalDebt / 100).toLocaleString('ru-RU')}
                </Text>
              </YStack>
              <YStack alignItems="center">
                <Text color="$blue10" fontSize="$3">Чистая стоимость</Text>
                <Text 
                  fontSize="$7" 
                  fontWeight="bold"
                  color={quickSummary?.current.netWorth >= 0 ? '$green10' : '$red10'}
                >
                  ₽{(quickSummary?.current.netWorth / 100).toLocaleString('ru-RU')}
                </Text>
              </YStack>
            </XStack>

            {/* График роста */}
            {forecast?.yearlyData && (
              <LineChart
                data={forecast.yearlyData.map((y: any) => y.netWorth)}
                labels={forecast.yearlyData.map((y: any) => `Год ${y.year}`)}
              />
            )}

            {/* Ближайшие цели */}
            <YStack space="$2">
              <Text fontSize="$4" fontWeight="600">Милиestones</Text>
              {quickSummary?.milestones.map((milestone: any) => (
                <YStack key={milestone.name} space="$1">
                  <XStack justifyContent="space-between">
                    <Text>{milestone.name}</Text>
                    <Text color={milestone.achieved ? '$green10' : '$gray10'}>
                      {milestone.achieved ? '✓' : `${Math.round(milestone.progress || 0)}%`}
                    </Text>
                  </XStack>
                </YStack>
              ))}
            </YStack>
          </YStack>
        </Tabs.Content>

        <Tabs.Content value="deposits">
          {/* Список вкладов с проекциями */}
        </Tabs.Content>

        <Tabs.Content value="loans">
          {/* График погашения кредитов */}
        </Tabs.Content>

        <Tabs.Content value="goals">
          {/* Прогресс по целям накоплений */}
        </Tabs.Content>
      </Tabs>
    </YStack>
  )
}
```

---

### Фаза 7: Life Cost конвертер (1 день)

#### 7.1 Калькулятор времени
```typescript
// src/app/(main)/life-cost/index.tsx
import { YStack, Input, Text, Button, XStack } from 'tamagui'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/services/api'

export default function LifeCostScreen() {
  const [amount, setAmount] = useState('')
  const [hours, setHours] = useState('')

  const calculateMutation = useMutation({
    mutationFn: (data: { amount: number; hourlyRate: number }) =>
      api.post('/life-cost/calculate', data),
    onSuccess: (response) => {
      setHours((response.data.hoursWorked / 60).toFixed(1))
    },
  })

  return (
    <YStack flex={1} padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="bold">Цена жизни</Text>
      <Text color="$gray10">
        Узнайте, сколько времени вам нужно работать, чтобы купить что-то
      </Text>

      <YStack space="$3">
        <Text fontWeight="500">Стоимость покупки</Text>
        <Input
          placeholder="5000"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </YStack>

      <Button
        onPress={() => calculateMutation.mutate({ 
          amount: Number(amount), 
          hourlyRate: 1500 // или из профиля пользователя
        })}
        disabled={!amount || calculateMutation.isPending}
      >
        {calculateMutation.isPending ? 'Расчет...' : 'Рассчитать'}
      </Button>

      {hours && (
        <YStack padding="$4" background="$yellow1" borderRadius="$4">
          <Text fontSize="$4" fontWeight="bold">Результат</Text>
          <Text fontSize="$8" color="$yellow10" fontWeight="bold">
            {hours} часов
          </Text>
          <Text color="$gray10">
            при почасовой ставке ₽1,500
          </Text>
        </YStack>
      )}
    </YStack>
  )
}
```

---

### Фаза 8: Достижения и геймификация (1-2 дня)

#### 8.1 Экран достижений
```typescript
// src/app/(main)/achievements/index.tsx
import { FlatList, YStack, XStack, Text, Avatar, Progress } from 'tamagui'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'

export default function AchievementsScreen() {
  const { data: earned } = useQuery({
    queryKey: ['achievements', 'earned'],
    queryFn: () => api.get('/achievements/earned').then(r => r.data),
  })

  const { data: available } = useQuery({
    queryKey: ['achievements', 'available'],
    queryFn: () => api.get('/achievements/available').then(r => r.data),
  })

  const renderAchievement = (item: any, earned: boolean) => (
    <XStack 
      padding="$3" 
      background="$cardBackground" 
      borderRadius="$4"
      space="$3"
      opacity={earned ? 1 : 0.6}
    >
      <Avatar circular size="$4" background={earned ? '$gold' : '$gray4'}>
        <Avatar.Text color={earned ? '$black' : '$gray10'}>
          {item.icon || '🏆'}
        </Avatar.Text>
      </Avatar>
      <YStack flex={1}>
        <Text fontWeight="600">{item.name}</Text>
        <Text fontSize="$2" color="$gray10">{item.description}</Text>
        {!earned && item.progress !== undefined && (
          <Progress value={item.progress} size="$1" marginTop="$2">
            <Progress.Track>
              <Progress.Indicator background="$primary" />
            </Progress.Track>
          </Progress>
        )}
      </YStack>
      {earned && (
        <Text color="$green10" fontWeight="600">✓</Text>
      )}
    </XStack>
  )

  return (
    <YStack flex={1} padding="$4" space="$4">
      <Text fontSize="$6" fontWeight="bold">Достижения</Text>

      <Text fontSize="$4" fontWeight="600">Полученные</Text>
      <FlatList
        data={earned}
        renderItem={({ item }) => renderAchievement(item, true)}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 12 }}
      />

      <Text fontSize="$4" fontWeight="600">Доступные</Text>
      <FlatList
        data={available}
        renderItem={({ item }) => renderAchievement(item, false)}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 12 }}
      />
    </YStack>
  )
}
```

---

### Фаза 9: Push-уведомления (1 день)

#### 9.1 Настройка
```typescript
// src/utils/notifications.ts
import * as Notifications from 'expo-notifications'
import { useEffect, useRef } from 'react'

export function useNotifications() {
  const notificationListener = useRef<any>()
  const responseListener = useRef<any>()

  useEffect(() => {
    // Запрос разрешений
    Notifications.requestPermissionsAsync()

    // Обработка полученных уведомлений
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Получено уведомление:', notification)
      }
    )

    // Обработка нажатия на уведомление
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Нажатие на уведомление:', response)
      }
    )

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])
}
```

---

## 4. Интеграция Lottie анимаций

```typescript
// src/components/animations/LevelUpAnimation.tsx
import LottieView from 'lottie-react-native'
import { useRef, useEffect } from 'react'
import { YStack } from 'tamagui'

export function LevelUpAnimation({ onComplete }: { onComplete: () => void }) {
  const animationRef = useRef<LottieView>(null)

  useEffect(() => {
    animationRef.current?.play()
  }, [])

  return (
    <YStack flex={1} justifyContent="center" alignItems="center">
      <LottieView
        ref={animationRef}
        source={require('@/assets/animations/level-up.json')}
        style={{ width: 200, height: 200 }}
        loop={false}
        onAnimationFinish={onComplete}
      />
    </YStack>
  )
}
```

---

## 5. Сводная таблица этапов

| Фаза | Название | Сроки | Зависимости |
|------|----------|-------|-------------|
| 1 | Настройка проекта | 1-2 дня | - |
| 2 | Аутентификация | 1-2 дня | Фаза 1 |
| 3 | Дашборд | 2-3 дня | Фаза 2 |
| 4 | Транзакции | 2 дня | Фаза 2 |
| 5 | Инкубатор желаний | 2 дня | Фаза 2 |
| 6 | Financial Forecast | 2-3 дня | Фаза 2, 3 |
| 7 | Life Cost конвертер | 1 день | Фаза 2 |
| 8 | Достижения | 1-2 дня | Фаза 2 |
| 9 | Push-уведомления | 1 день | Фаза 2 |

**Общее время: ~13-17 рабочих дней**

---

## 6. Следующие шаги

1. Инициализировать Expo проект
2. Настроить Tamagui с цветовой схемой "Escape from Consumer Society"
3. Реализовать базовую навигацию
4. Подключить API к backend
5. Разработать экраны по этапам
6. Добавить анимации
7. Протестировать на iOS и Android
