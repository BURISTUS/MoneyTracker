import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View, Pressable, FlatList, TextInput,
  Animated, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { chatService, type ChatMessage } from '../../../src/services/chat';
import { useAuthStore } from '../../../src/stores/authStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { useToast } from '../../../src/components/ui/Toast';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';

const PRESETS = [
  { key: 'SPENDING_REPORT', icon: 'receipt-outline', labelKey: 'chat.spendingReport', msgKey: 'chat.spendingReportMsg' },
  { key: 'BUDGET_ANALYSIS', icon: 'pie-chart-outline', labelKey: 'chat.budgetAnalysis', msgKey: 'chat.budgetAnalysisMsg' },
  { key: 'SAVINGS_TIPS', icon: 'wallet-outline', labelKey: 'chat.howToSave', msgKey: 'chat.howToSaveMsg' },
  { key: 'DYNAMICS', icon: 'trending-up-outline', labelKey: 'chat.dynamicsPreset', msgKey: 'chat.dynamicsMsg' },
];

function formatTime(dateStr: string, t: (key: string, opts?: any) => string): string {
  const d = new Date(dateStr);
  const time = format(d, 'HH:mm');
  if (isToday(d)) return time;
  if (isYesterday(d)) return t('chat.yesterdayAt', { time });
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

const Bubble = memo(({ item }: { item: ChatMessage }) => {
  const C = useTheme();
  const { t } = useTranslation();
  const isUser = item.role === 'USER';

  const renderMd = (text: string) => {
    return text.split('\n').map((line, i) => {
      const num = line.match(/^(\d+)\.\s(.+)$/);
      if (num) return (
        <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
          <Text style={{ color: C.primary, fontWeight: '700', fontSize: 14 }}>{num[1]}.</Text>
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: isUser ? '#FFFFFF' : C.textMain }}>{inlineBold(num[2], C)}</Text>
        </View>
      );
      const bul = line.match(/^[•\-*]\s(.+)$/);
      if (bul) return (
        <View key={i} style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
          <Text style={{ color: C.primary, fontSize: 14 }}>•</Text>
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: isUser ? '#FFFFFF' : C.textMain }}>{inlineBold(bul[1], C)}</Text>
        </View>
      );
      return <Text key={i} style={{ fontSize: 14, lineHeight: 20, color: isUser ? '#FFFFFF' : C.textMain, marginTop: i > 0 ? 2 : 0 }}>{inlineBold(line, C)}</Text>;
    });
  };

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
        {renderMd(item.content)}
        <Text style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.6)' : C.textSec, marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>{formatTime(item.createdAt, t)}</Text>
      </View>
    </View>
  );
});

function inlineBold(text: string, C: any): React.ReactNode[] {
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

export default function ChatScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { isDemoMode } = useAuthStore();
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const [chatBlocked, setChatBlocked] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showClear, setShowClear] = useState(false);

  useEffect(() => {
    const access = useSubscriptionStore.getState().checkAccess('AI_CHAT');
    if (!access?.allowed) {
      showPaywall('AI_CHAT');
      setChatBlocked(true);
    } else {
      setChatBlocked(false);
    }
  }, [isPremium]);

  useEffect(() => {
    if (isDemoMode) { setIsInitialized(true); return; }
    (async () => {
      try { setMessages(await chatService.getMessages()); }
      catch { toast.showError(t('chat.loadHistoryFailed')); }
      finally { setIsInitialized(true); }
    })();
  }, []);

  const send = async (content: string, presetType?: string) => {
    if (!content.trim() || isLoading) return;
    if (isDemoMode) { toast.showError(t('chat.demoNotAvailable')); return; }
    if (showPaywall('AI_CHAT')) return;
    setIsLoading(true);
    try {
      const res = await chatService.sendMessage({ content: content.trim(), presetType });
      setMessages(prev => [...prev, res.userMessage, res.assistantMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    } catch { toast.showError(t('chat.sendFailed')); }
    finally { setIsLoading(false); }
  };

  const clearHistory = useCallback(async () => {
    try { await chatService.clearMessages(); setMessages([]); toast.showSuccess(t('chat.chatCleared')); }
    catch { toast.showError(t('chat.sendFailed')); }
    setShowClear(false);
  }, [toast, t]);

  if (chatBlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#F59E0B15', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Ionicons name="lock-closed" size={32} color="#F59E0B" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.textMain, textAlign: 'center', marginBottom: 8 }}>
          {t('chat.aiAssistant')}
        </Text>
        <Text style={{ fontSize: 15, color: C.textSec, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
          {t('chat.premiumOnly')}
        </Text>
        <Pressable
          onPress={() => {
            useSubscriptionStore.getState().showPaywall('AI_CHAT');
          }}
          style={{ backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Ionicons name="diamond" size={18} color="#FFF" />
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('chat.unlockPremium')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={32} color={C.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="sparkles" size={20} color={C.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.textMain }}>{t('chat.chatTitle')}</Text>
            <Text style={{ fontSize: 13, color: C.textSec }}>{isLoading ? t('chat.typing') : t('chat.aiAssistant')}</Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={() => setShowClear(true)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.inputBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="trash-outline" size={16} color={C.textSec} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={10}
        windowSize={5}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, flexGrow: 1 }}
        onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => <Bubble item={item} />}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 60 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="sparkles" size={28} color={C.primary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.textMain, textAlign: 'center', marginTop: 20 }}>{t('chat.welcomeHeading')}</Text>
            <Text style={{ fontSize: 14, color: C.textSec, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              {t('chat.welcomeBody')}
            </Text>
          </View>
        }
      />

      <View style={{ backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: 8 }}>
        <View style={{ paddingTop: 10, paddingBottom: 4 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 }}>
            {PRESETS.slice(0, 2).map(p => (
              <TouchableOpacity
                key={p.key}
                activeOpacity={0.7}
                onPress={() => send(t(p.msgKey), p.key)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  marginHorizontal: 4,
                  borderRadius: 20,
                  backgroundColor: C.card,
                  borderWidth: 2,
                  borderColor: C.primaryBorder,
                }}
              >
                <Ionicons name={p.icon as any} size={18} color={C.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textMain, marginLeft: 6 }}>{t(p.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
            {PRESETS.slice(2, 4).map(p => (
              <TouchableOpacity
                key={p.key}
                activeOpacity={0.7}
                onPress={() => send(t(p.msgKey), p.key)}
                disabled={isLoading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  marginHorizontal: 4,
                  borderRadius: 20,
                  backgroundColor: C.card,
                  borderWidth: 2,
                  borderColor: C.primaryBorder,
                }}
              >
                <Ionicons name={p.icon as any} size={18} color={C.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textMain, marginLeft: 6 }}>{t(p.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 6 }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chat.askPlaceholder')}
            placeholderTextColor={C.textMuted}
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              backgroundColor: C.inputBg,
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingVertical: 12,
              fontSize: 15,
              color: C.textMain,
              maxHeight: 100,
              borderWidth: 1,
              borderColor: C.border,
            }}
          />
          <TouchableOpacity
            onPress={() => { send(inputText); setInputText(''); }}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: !inputText.trim() || isLoading ? C.primaryBorder : C.primary,
            }}
          >
            {isLoading ? <Spinner size={18} /> : <Ionicons name="arrow-up" size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={showClear}
        title={t('chat.clearChatTitle')}
        message={t('chat.allHistoryDeleted')}
        confirmText={t('chat.clearBtn')}
        variant="destructive"
        onConfirm={clearHistory}
        onCancel={() => setShowClear(false)}
      />
    </View>
  );
}
