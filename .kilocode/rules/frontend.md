III. Frontend Deep Dive: React Native Patterns & Workflow
Используемые паттерны (React Patterns)

    Container / Presentational (Smart / Dumb):

        Разделяй компоненты.

        Container: Подключен к Store/API, содержит useEffect, useState. Возвращает Presentational компонент.

        Presentational: Принимает только props. Рендерит UI. Никакой логики, кроме форматирования данных для вывода.

    Custom Hooks (Logic Extraction):

        Вся бизнес-логика UI должна жить в хуках.

        Пример: useAuthForm, useBiometrics, useTheme.

    Compound Components:

        Для сложных UI элементов (например, карточки с хедером, телом и футером) используй составные компоненты (Card.Header, Card.Body), передавая состояние неявно через Context.

    HOC (Higher Order Components):

        Используй только для сквозного функционала: ErrorBoundary, Logging, PermissionsWrapper. В остальных случаях — хуки.

Работа с React Native (Performance & Specifics)

    Lists:

        FlatList ONLY. Никогда не используй .map внутри ScrollView для списков.

        Обязательно: keyExtractor, getItemLayout (если высота фиксирована) для производительности 60 FPS.

    Styles:

        Выноси стили из компонента. Используй StyleSheet.create.

        Избегай передачи анонимных объектов style={{ margin: 10 }} (вызывает ре-рендер).

    Memoization:

        Оборачивай обработчики событий в useCallback.

        Оборачивай тяжелые вычисления или трансформированные данные в useMemo.

        Используй React.memo для "глупых" компонентов списка, чтобы избежать лишних рендеров при обновлении родителя.

Пример архитектуры компонента
TypeScript

// 1. Types
interface UserCardProps {
  user: UserDto;
  onPress: (id: string) => void;
}

// 2. Component (Memoized)
export const UserCard = React.memo(({ user, onPress }: UserCardProps) => {
  // 3. Styles optimization
  const dynamicStyle = useMemo(() => getStyles(user.status), [user.status]);

  return (
    <Pressable onPress={() => onPress(user.id)} style={styles.container}>
       <Text style={dynamicStyle}>{user.name}</Text>
    </Pressable>
  );
});