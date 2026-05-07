import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View, Text, Pressable, FlatList, TextInput,
  Animated, TouchableOpacity,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { chatService, type ChatMessage } from '../../../src/services/chat';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/stores/authStore';
import { useTheme } from '../../../src/stores/themeStore';
import { useToast } from '../../../src/components/ui/Toast';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';

// TabBar is absolute-positioned in parent layout: ~52px content + safe area
const TAB_BAR_CONTENT_HEIGHT = 52;

const PRESETS = [
  { key: 'SPENDING_REPORT', label: 'Отчёт по тратам', icon: 'receipt-outline', msg: 'Сделай отчёт по тратам за период' },
  { key: 'BUDGET_ANALYSIS', label: 'Анализ бюджета', icon: 'pie-chart-outline', msg: 'Проанализируй мой бюджет' },
  { key: 'SAVINGS_TIPS', label: 'Как сохранить', icon: 'wallet-outline', msg: 'Дай совет, как сохранить больше' },
  { key: 'DYNAMICS', label: 'Динамика', icon: 'trending-up-outline', msg: 'Отследи динамику моих расходов' },
];

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const time = format(d, 'HH:mm');
  if (isToday(d)) return time;
  if (isYesterday(d)) return `Вчера, ${time}`;
  return format(d, 'd MMM, HH:mm', { locale: ru });
}

function Spinner({ size = 20, color = '#FFF' }: { size?: number; color?: string }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 800, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color, borderTopColor: 'transparent' }} />
    </Animated.View>
  );
}

function TypingIndicator() {
  const C = useTheme();
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = (v: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]));
    const a1 = anim(d1, 0), a2 = anim(d2, 150), a3 = anim(d3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 8 }}>
      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="sparkles" size={14} color={C.primary} />
      </View>
      <View style={{ backgroundColor: C.card, borderRadius: 20, borderBottomLeftRadius: 4, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border }}>
        {[d1, d2, d3].map((d, i) => (
          <Animated.View key={i} style={{
            width: 7, height: 7, borderRadius: 4, backgroundColor: C.primary,
            opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
            transform: [{ translateY: d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
          }} />
        ))}
      </View>
    </View>
  );
}

function renderMd(text: string, isUser: boolean, C: ReturnType<typeof useTheme>) {
  return text.split('\n').map((line, i) => {
    const num = line.match(/^(\d+)\.\s(.+)$/);
    if (num) return (
      <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
        <Text style={{ color: C.primary, fontWeight: '700', fontSize: 14 }}>{num[1]}.</Text>
        <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: C.textSec }}>{inlineBold(num[2], C)}</Text>
      </View>
    );
    const bul = line.match(/^[•\-\*]\s(.+)$/);
    if (bul) return (
      <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
        <Text style={{ color: C.primary, fontSize: 14 }}>•</Text>
        <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: C.textSec }}>{inlineBold(bul[1], C)}</Text>
      </View>
    );
    return <Text key={i} style={{ fontSize: 14, lineHeight: 20, color: isUser ? C.textMain : C.textSec, marginTop: i > 0 ? 2 : 0 }}>{inlineBold(line, C)}</Text>;
  });
}

function inlineBold(text: string, C: ReturnType<typeof useTheme>): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<Text key={`b${m.index}`} style={{ fontWeight: '700', color: C.textMain }}>{m[1]}</Text>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : [text];
}

const Bubble = memo(({ item }: { item: ChatMessage }) => {
  const C = useTheme();
  const isUser = item.role === 'USER';
  return (
    <View style={{ flexDirection: 'row', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
      {!isUser && (
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="sparkles" size={14} color={C.primary} />
        </View>
      )}
      <View style={{
        maxWidth: '82%',
        backgroundColor: isUser ? C.primary : C.card,
        borderRadius: 20,
        borderBottomLeftRadius: isUser ? 20 : 4,
        borderBottomRightRadius: isUser ? 4 : 20,
        paddingHorizontal: 16, paddingVertical: 10,
        borderWidth: 1, borderColor: isUser ? 'transparent' : C.border,
      }}>
        {renderMd(item.content, isUser, C)}
        <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>{formatTime(item.createdAt)}</Text>
      </View>
    </View>
  );
});

export default function ChatScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { isDemoMode } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showClear, setShowClear] = useState(false);

  // Space needed at the bottom so content isn't hidden behind TabBar + input area
  const bottomSpacing = TAB_BAR_CONTENT_HEIGHT + insets.bottom;

  useEffect(() => {
    if (isDemoMode) { setIsInitialized(true); return; }
    (async () => {
      try { setMessages(await chatService.getMessages()); }
      catch { toast.showError('Не удалось загрузить историю'); }
      finally { setIsInitialized(true); }
    })();
  }, []);

  const send = async (content: string, presetType?: string) => {
    if (!content.trim() || isLoading) return;
    if (isDemoMode) { toast.showError('В демо-режиме чат недоступен'); return; }
    setIsLoading(true);
    try {
      const res = await chatService.sendMessage({ content: content.trim(), presetType });
      setMessages(prev => [...prev, res.userMessage, res.assistantMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    } catch { toast.showError('Не удалось отправить'); }
    finally { setIsLoading(false); }
  };

  const clearHistory = useCallback(async () => {
    try { await chatService.clearMessages(); setMessages([]); toast.showSuccess('Чат очищен'); }
    catch { toast.showError('Ошибка'); }
    setShowClear(false);
  }, [toast]);

  if (!isInitialized) {
    return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Spinner size={32} color={C.primary} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, paddingTop: insets.top + 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="sparkles" size={20} color={C.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.textMain }}>{t("chat.title")}</Text>
            <Text style={{ fontSize: 13, color: C.textSec }}>{isLoading ? 'Печатает...' : 'AI Ассистент'}</Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={() => setShowClear(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="trash-outline" size={16} color={C.textSec} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          gap: 10,
        }}
        onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => <Bubble item={item} />}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 60 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="sparkles" size={28} color={C.primary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.textMain, textAlign: 'center', marginTop: 20 }}>{t("chat.greeting")}</Text>
            <Text style={{ fontSize: 14, color: C.textSec, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              {t('chat.assistantIntro')}
            </Text>
          </View>
        }
      />

      {/* Bottom: Presets + Input — sticks to keyboard */}
      <KeyboardStickyView
        offset={{ closed: 0, opened: 0 }}
        style={{ backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border }}
      >
        {/* Presets 2x2 */}
        <View style={{ paddingTop: 10, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 }}>
            {PRESETS.slice(0, 2).map(p => (
              <TouchableOpacity
                key={p.key}
                activeOpacity={0.7}
                onPress={() => send(p.msg, p.key)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                  marginHorizontal: 4,
                  borderRadius: 20,
                  backgroundColor: C.card,
                  borderWidth: 2,
                  borderColor: C.primary,
                }}
              >
                <Ionicons name={p.icon as any} size={20} color={C.primary} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textMain, marginLeft: 8 }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
            {PRESETS.slice(2, 4).map(p => (
              <TouchableOpacity
                key={p.key}
                activeOpacity={0.7}
                onPress={() => send(p.msg, p.key)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 14,
                  marginHorizontal: 4,
                  borderRadius: 20,
                  backgroundColor: C.card,
                  borderWidth: 2,
                  borderColor: C.primary,
                }}
              >
                <Ionicons name={p.icon as any} size={20} color={C.primary} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.textMain, marginLeft: 8 }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 8 }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Спросите о финансах..."
            placeholderTextColor={C.textMuted}
            multiline
            maxLength={1000}
            style={{ flex: 1, backgroundColor: C.card, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: C.textMain, maxHeight: 100, borderWidth: 1, borderColor: C.border }}
          />
          <TouchableOpacity
            onPress={() => { send(inputText); setInputText(''); }}
            disabled={!inputText.trim() || isLoading}
            style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: !inputText.trim() || isLoading ? 'rgba(99,102,248,0.25)' : C.primary }}
          >
            {isLoading ? <Spinner size={18} /> : <Ionicons name="arrow-up" size={20} color="white" />}
          </TouchableOpacity>
        </View>

        {/* Spacer for the absolute TabBar */}
        <View style={{ height: bottomSpacing }} />
      </KeyboardStickyView>

      <ConfirmModal
        visible={showClear}
        title="Очистить чат"
        message="Вся история будет удалена."
        confirmText="Очистить"
        variant="destructive"
        onConfirm={clearHistory}
        onCancel={() => setShowClear(false)}
      />
    </View>
  );
}
