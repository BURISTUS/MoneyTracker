import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';
import currencyService, { type ExchangeRate } from '../../services/currency';

interface CurrencyPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: ExchangeRate) => void;
  selectedCode?: string;
  title?: string;
  filterType?: 'FIAT' | 'CRYPTO' | 'METAL';
}

type CurrencyTab = 'POPULAR' | 'ALL' | 'FIAT' | 'CRYPTO' | 'METAL';

const TAB_KEYS: CurrencyTab[] = ['POPULAR', 'ALL', 'FIAT', 'CRYPTO', 'METAL'];

const CurrencyItem = React.memo(
  ({
    item,
    isSelected,
    onPress,
    localizedName,
  }: {
    item: ExchangeRate;
    isSelected: boolean;
    onPress: () => void;
    localizedName: string;
  }) => {
    const C = useTheme();
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isSelected ? C.primaryBg : 'transparent',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: isSelected ? C.primaryBorder : C.divider,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? C.tabActive : C.textSec }}>
            {item.symbol && item.symbol !== item.code ? item.symbol : item.code.slice(0, 2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: C.textMain }}>{item.code}</Text>
          <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{localizedName}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark" size={20} color={C.tabActive} />}
      </Pressable>
    );
  },
);

CurrencyItem.displayName = 'CurrencyItem';

export const CurrencyPicker: React.FC<CurrencyPickerProps> = React.memo(
  ({ visible, onClose, onSelect, selectedCode, title, filterType }) => {
    const C = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const defaultTitle = t('currencyPicker.selectTitle');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<CurrencyTab>(
      filterType || 'POPULAR',
    );
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ExchangeRate[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadedInitial = useRef(false);
    const currentTab = useRef<CurrencyTab>(filterType || 'POPULAR');

    const loadCurrencies = useCallback(
      async (searchQuery: string, tabPage: number, reset: boolean, tab?: CurrencyTab) => {
        const effectiveTab = tab ?? currentTab.current;
        setLoading(true);
        try {
          const params: Parameters<typeof currencyService.fetchCurrencyList>[0] = {
            search: searchQuery || undefined,
            page: tabPage,
            limit: 50,
          };
          if (effectiveTab === 'POPULAR') {
            params.popular = true;
          } else if (effectiveTab !== 'ALL') {
            params.type = effectiveTab;
          }
          const res = await currencyService.fetchCurrencyList(params);
          setResults((prev) => (reset ? res.items : [...prev, ...res.items]));
          setHasMore(tabPage < res.totalPages);
        } catch (error) {
          console.error('Failed to load currencies:', error);
        } finally {
          setLoading(false);
        }
      },
      [],
    );

    React.useEffect(() => {
      if (visible) {
        const tab = filterType || 'POPULAR';
        setSearch('');
        setActiveTab(tab);
        currentTab.current = tab;
        setResults([]);
        setPage(1);
        setHasMore(true);
        loadedInitial.current = false;
        loadCurrencies('', 1, true, tab);
      }
    }, [visible, filterType, loadCurrencies]);

    const handleSearch = useCallback(
      (text: string) => {
        setSearch(text);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
          setPage(1);
          loadCurrencies(text, 1, true);
        }, 300);
      },
      [loadCurrencies],
    );

    const handleTabChange = useCallback(
      (tab: CurrencyTab) => {
        setActiveTab(tab);
        currentTab.current = tab;
        setPage(1);
        setSearch('');
        loadCurrencies('', 1, true, tab);
      },
      [loadCurrencies],
    );

    const handleSelect = useCallback(
      (item: ExchangeRate) => {
        onSelect(item);
        onClose();
      },
      [onSelect, onClose],
    );

    const handleEndReached = useCallback(() => {
      if (!loading && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadCurrencies(search, nextPage, false);
      }
    }, [loading, hasMore, page, search, loadCurrencies]);

    const renderItem = useCallback(
      ({ item }: { item: ExchangeRate }) => (
        <CurrencyItem
          item={item}
          isSelected={item.code === selectedCode}
          onPress={() => handleSelect(item)}
          localizedName={t(`currencies.${item.code}`, item.name)}
        />
      ),
      [selectedCode, handleSelect, t],
    );

    const keyExtractor = useCallback((item: ExchangeRate) => item.id, []);

    const S = StyleSheet.create({
      searchRow: {
        flexDirection: 'row',
        backgroundColor: C.inputBg,
        borderRadius: 12,
        paddingHorizontal: 12,
        alignItems: 'center',
        height: 44,
        marginBottom: 12,
      },
      searchInput: {
        flex: 1,
        color: C.textMain,
        fontSize: 15,
        padding: 0,
        marginLeft: 8,
      },
      tabRow: { flexDirection: 'row', gap: 8 },
      tab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
      },
      tabText: { fontSize: 12 },
    });

    const listHeader = useMemo(
      () => (
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <View style={S.searchRow}>
            <Ionicons name="search" size={18} color={C.textSec} />
            <TextInput
              style={S.searchInput}
              placeholder={t('currencyPicker.searchPlaceholder', 'Поиск по коду или названию...')}
              placeholderTextColor={C.textSec}
              value={search}
              onChangeText={handleSearch}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color={C.textSec} />
              </Pressable>
            )}
          </View>
          {!filterType && (
            <View style={S.tabRow}>
              {TAB_KEYS.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => handleTabChange(tab)}
                  style={[
                    S.tab,
                    {
                      backgroundColor: activeTab === tab ? C.primaryBg : C.inputBg,
                      borderColor: activeTab === tab ? C.primary : 'transparent',
                    },
                  ]}
                >
                  <Text style={[S.tabText, { color: activeTab === tab ? C.primary : C.textSec, fontWeight: activeTab === tab ? '600' : '400' }]}>
                    {t(`currencyPicker.tab_${tab}`, tab)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ),
      [search, handleSearch, activeTab, handleTabChange, filterType, t, C],
    );

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable
          style={{ flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' }}
          onPress={onClose}
        >
          <Pressable
            style={{ backgroundColor: C.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: C.handle,
                alignSelf: 'center',
                marginTop: 16,
                marginBottom: 8,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700', color: C.textMain }}>{title || defaultTitle}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={C.textSec} />
              </Pressable>
            </View>

            <FlatList
              data={results}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={listHeader}
              ListFooterComponent={
                loading ? (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <ActivityIndicator color={C.primary} />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                    <Ionicons name="search-outline" size={40} color={C.textMuted} />
                    <Text style={{ fontSize: 16, color: C.textSec, marginTop: 12 }}>
                      {t('currencyPicker.notFound', 'Валюта не найдена')}
                    </Text>
                  </View>
                ) : null
              }
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: Math.max(20, insets.bottom + 16),
              }}
              keyboardShouldPersistTaps="handled"
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

CurrencyPicker.displayName = 'CurrencyPicker';
