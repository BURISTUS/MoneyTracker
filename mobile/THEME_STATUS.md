# Статус светлой темы

## Сборка
✅ **0 ошибок TypeScript** — `npx tsc --noEmit` чистый.

---

## ✅ Сделано: экраны с реактивной темой

Эти файлы используют `const C = useTheme()` и перерисовываются при переключении темы:

### Экраны
| Файл | Экран |
|------|-------|
| `app/_layout.tsx` | ThemeWrapper — центральный переключатель |
| `app/index.tsx` | Сплэш |
| `app/main/_layout.tsx` | Таб-бар |
| `app/main/index.tsx` | Главный дашборд |
| `app/main/profile/index.tsx` | Профиль + кнопка переключения темы 🌙/☀️ |
| `app/main/accounts/index.tsx` | Счета |
| `app/main/analytics/index.tsx` | Аналитика |
| `app/main/categories/index.tsx` | Категории (список) |
| `app/main/categories/create.tsx` | Создание категории |
| `app/main/goals/index.tsx` | Цели + модалки |
| `app/main/life-cost/index.tsx` | Стоимость жизни |
| `app/main/chat/index.tsx` | AI-чат |
| `app/main/transactions/index.tsx` | Транзакции |
| `app/main/transactions/create.tsx` | Создание транзакции |
| `app/main/transactions/CreateCategoryModal.tsx` | Модалка создания категории |
| `app/main/wishlist/index.tsx` | Вишлист (полная конверсия) |

### Компоненты
| Файл |
|------|
| `src/components/layout/TabBar.tsx` |
| `src/components/ui/DonutChart.tsx` |
| `src/components/ui/AddTransactionModal.tsx` |
| `src/components/ui/TransactionActionModal.tsx` |
| `src/components/ui/CategoryEditModal.tsx` |
| `src/components/ui/TransferModal.tsx` |
| `src/components/ui/ConfirmModal.tsx` |
| `src/components/ui/Toast.tsx` |
| `src/components/ui/LanguagePicker.tsx` |
| `src/components/ui/DatePickerModal.tsx` |
| `src/components/ui/CurrencyPicker.tsx` |
| `src/components/ui/Loading.tsx` |
| `src/components/ui/AiTransactionPreview.tsx` |
| `src/components/ui/ReceiptScanner.tsx` |
| `src/components/ui/CategoryIcon.tsx` |
| `src/components/features/WishlistCard.tsx` |
| `src/components/features/AccountCard.tsx` |
| `src/components/features/StatCard.tsx` |

### Auth (NativeWind-based, уже реактивные через GluestackUIProvider mode)
| Файл |
|------|
| `app/auth/login.tsx` |
| `app/auth/register.tsx` |

### Инфраструктура
- ✅ `src/stores/themeStore.ts` — тёмная/светлая палитра (warm beige Anthropic-style), Zustand persist + `toggle()`
- ✅ `src/utils/safeAsyncStorage.ts` — fallback на in-memory Map при отсутствии AsyncStorage
- ✅ `components/ui/gluestack-ui-provider/config.ts` — CSS-переменные для светлой темы
- ✅ `src/stores/dataStore.ts` — исправлены типы `addCategory`, `createGoal`
- ✅ `src/hooks/useGoals.ts` — исправлены методы
- ✅ `src/i18n/index.ts` — safeAsyncStorage

---

## ❌ Осталось

Ничего критического. Все 25 файлов из списка «Осталось» конвертированы.

---

## 🟡 Проблемы, требующие внимания

1. **AsyncStorage не работает в Expo Go** — нужен development build (`npx expo prebuild --clean`). Сейчас `safeAsyncStorage.ts` молча фоллбэчится на память, так что настройки темы не сохраняются между перезапусками.
2. **VoiceInputButton.tsx** — полностью закомментирован, не требует конверсии.
3. **Некоторые иконки/цвета в className** (например, в auth) используют NativeWind-токены и переключаются через GluestackUIProvider mode, что корректно.

---

## Метод для нового экрана

Паттерн, применённый ко всем сделанным файлам:

1. Добавить `import { useTheme } from '../../stores/themeStore';`
2. Удалить модульный `const C = { ... }` (если есть)
3. В компоненте: `const C = useTheme();`
4. Перенести `StyleSheet.create({...})` внутрь компонента (после `const C = useTheme()`)
5. Заменить хардкод-цвета на `C.*`:
   - `'#0A0A0F'` → `C.bg`
   - `'#141418'` → `C.card`
   - `'rgba(255,255,255,0.08)'` → `C.border`
   - `'#F5F5F5'` / `'#FFFFFF'` → `C.textMain`
   - `'#8C8C8C'` / `'#71717A'` → `C.textSec`
   - `'#52525B'` / `'#3F3F46'` → `C.textMuted`
   - `'#6366F1'` → `C.primary`
   - `'#FF3B30'` / `'#EF4444'` → `C.red`
   - `'#34C759'` / `'#34D399'` → `C.green`
   - `'#FF9500'` / `'#FB9554'` → `C.orange`
   - `'#FBBF24'` → `C.yellow`
   - `'rgba(255,255,255,0.05)'` → `C.inputBg`
   - `'#13131A'` / `'#1C1C20'` → `C.sheet`
   - `'rgba(255,255,255,0.15)'` → `C.handle`
   - `'rgba(255,255,255,0.06)'` / `'rgba(255,255,255,0.05)'` → `C.divider`
   - `'rgba(99,102,241,0.1)'` и подобные → `C.primaryBg` / `C.primaryBorder`
6. Удалить `StyleSheet` из импорта, если больше не используется.
