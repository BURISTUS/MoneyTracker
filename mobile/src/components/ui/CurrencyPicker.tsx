import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Pressable,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
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
    return (
      <Pressable
        onPress={onPress}
        className={`flex-row items-center px-4 py-3 ${isSelected ? 'bg-[rgba(99,102,241,0.12)]' : ''}`}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{
            backgroundColor: isSelected
              ? 'rgba(99, 102, 241, 0.2)'
              : 'rgba(255, 255, 255, 0.06)',
          }}
        >
          <Text bold className={`text-sm ${isSelected ? 'text-primary-300' : 'text-typography-400'}`}>
            {item.symbol && item.symbol !== item.code ? item.symbol : item.code.slice(0, 2)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium">{item.code}</Text>
          <Text className="text-xs text-typography-400 mt-px">{localizedName}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark" size={20} color="#818CF8" />}
      </Pressable>
    );
  },
);

CurrencyItem.displayName = 'CurrencyItem';

export const CurrencyPicker: React.FC<CurrencyPickerProps> = React.memo(
  ({ visible, onClose, onSelect, selectedCode, title = 'Выберите валюту', filterType }) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
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

    const listHeader = useMemo(
      () => (
        <View className="px-4 pt-3 pb-2">
          <View className="flex-row bg-[rgba(255,255,255,0.04)] rounded-xl px-3 items-center h-11 mb-3">
            <Ionicons name="search" size={18} color="#71717A" />
            <TextInput
              className="flex-1 text-white text-[15px] p-0 ml-2"
              placeholder={t('currencyPicker.searchPlaceholder', 'Поиск по коду или названию...')}
              placeholderTextColor="#71717A"
              value={search}
              onChangeText={handleSearch}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color="#71717A" />
              </Pressable>
            )}
          </View>
          {!filterType && (
            <View className="flex-row gap-2">
              {TAB_KEYS.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => handleTabChange(tab)}
                  className={`px-3 py-1.5 rounded-full border ${
                    activeTab === tab
                      ? 'bg-primary-500/20 border-primary-500'
                      : 'bg-[rgba(255,255,255,0.04)] border-transparent'
                  }`}
                >
                  <Text className={`text-xs ${activeTab === tab ? 'text-primary-300 font-semibold' : 'text-typography-400'}`}>
                    {t(`currencyPicker.tab_${tab}`, tab)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ),
      [search, handleSearch, activeTab, handleTabChange, filterType, t],
    );

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable
          className="flex-1 bg-[rgba(0,0,0,0.6)] justify-end"
          onPress={onClose}
        >
          <Pressable
            className="bg-[#111118] rounded-t-3xl"
            style={{ maxHeight: '85%' }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-9 h-1 rounded-full bg-[rgba(255,255,255,0.2)] self-center mt-4 mb-2" />

            <View className="flex-row items-center justify-between px-5 mb-2">
              <Text bold className="text-xl">{title}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <FlatList
              data={results}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={listHeader}
              ListFooterComponent={
                loading ? (
                  <View className="py-5 items-center">
                    <ActivityIndicator color="#6366F1" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View className="py-12 items-center">
                    <Ionicons name="search-outline" size={40} color="#52525B" />
                    <Text className="text-base text-typography-400 mt-3">
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
