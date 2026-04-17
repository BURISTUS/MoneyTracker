# Журнал технических решений

## 2026-04-17: Инициализация Memory Bank

### Решение: Копейки (BigInt) для хранения сумм
**Почему:** Все суммы хранятся в копейках (BigInt) для точности. На фронте делим на 100 для отображения. Исключает ошибки округления float.

### Решение: react-native-reanimated и react-native-gesture-handler запрещены в компонентах
**Почему:** Вызывают NullPointerException на Android при неправильной конфигурации. Используем стандартные RN Modal, TouchableOpacity, Pressable.

### Решение: SVG без LinearGradient и stop
**Почему:** Элемент `<stop>` внутри `<LinearGradient>` из react-native-svg крашит Android с "View config getter callback for component stop must be a function". DonutChart использует plain stroke colors.

### Решение: Системные категории (userId: null)
**Почему:** Категории по умолчанию создаются с userId: null. При запросе используем OR: [{userId}, {userId: null}] чтобы показать системные + личные.

### Решение: Демо-режим через isDemoMode флаг
**Почему:** loginMock() не создаёт JWT-токен. Без флага initializeData() вызывает API → 401 → redirect loop. Флаг isDemoMode (persisted) пропускает API-вызовы.

### Решение: expo-router file-based routing
**Почему:** Стандартный подход для Expo SDK 54+. Каждый .tsx в app/ — маршрут. Layout файлы _layout.tsx определяют навигацию.

### Решение: Zustand + React Query
**Почему:** Zustand — простой клиентский state (auth, data cache). React Query — server state (hooks). Разделение ответственности.

### Решение: DatePickerModal вместо DateTimePicker
**Почему:** Нативный DateTimePicker даёт разный UX на iOS/Android. Кастомный bottom-sheet с пресетами (Сегодня/Вчера/Позавчера) + инпуты ДД/ММ с автофокусом — единообразный UX. Год всегда текущий.

### Решение: Калькулятор с мат.операциями в numpad
**Почему:** Пользователь может ввести выражение типа "1000 + 500" прямо при добавлении транзакции. Операции +−×÷ встроены в сетку 4×4. Кнопка = вычисляет результат.

### Решение: 401 interceptor с debounce
**Почему:** При отсутствии токена 5 параллельных запросов возвращают 401 одновременно → 5 redirect на login. isRedirecting флаг предотвращает каскад.
