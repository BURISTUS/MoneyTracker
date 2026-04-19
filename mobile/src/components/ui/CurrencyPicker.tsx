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
import { useTheme } from '../../theme';
import { Text } from './Text';
import { Icon } from './Icon';
import { Chip } from './Chip';
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
    const { spacing, borderRadius: br } = useTheme();

    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: isSelected
            ? 'rgba(99, 102, 241, 0.12)'
            : 'transparent',
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: br.md,
            backgroundColor: isSelected
              ? 'rgba(99, 102, 241, 0.2)'
              : 'rgba(255, 255, 255, 0.06)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <Text
            size="sm"
            weight="bold"
            style={{
              color: isSelected ? '#818CF8' : '#A1A1AA',
            }}
          >
            {item.symbol && item.symbol !== item.code ? item.symbol : item.code.slice(0, 2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text size="md" weight="medium">
            {item.code}
          </Text>
          <Text size="xs" style={{ color: '#71717A', marginTop: 1 }}>
            {localizedName}
          </Text>
        </View>
        {isSelected && <Icon name="checkmark" size={20} color="#818CF8" />}
      </Pressable>
    );
  },
);

CurrencyItem.displayName = 'CurrencyItem';

export const CurrencyPicker: React.FC<CurrencyPickerProps> = React.memo(
  ({ visible, onClose, onSelect, selectedCode, title = 'Выберите валюту', filterType }) => {
    const { spacing, borderRadius: br } = useTheme();
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
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: br.md,
              paddingHorizontal: spacing.md,
              alignItems: 'center',
              height: 44,
              marginBottom: spacing.md,
            }}
          >
            <Icon name="search" size={18} color="#71717A" />
            <TextInput
              style={{
                flex: 1,
                color: '#FFFFFF',
                fontSize: 15,
                fontFamily: 'System',
                padding: 0,
                marginLeft: spacing.sm,
              }}
              placeholder={t('currencyPicker.searchPlaceholder', 'Поиск по коду или названию...')}
              placeholderTextColor="#71717A"
              value={search}
              onChangeText={handleSearch}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => handleSearch('')}>
                <Icon name="close-circle" size={18} color="#71717A" />
              </Pressable>
            )}
          </View>
          {!filterType && (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {TAB_KEYS.map((tab) => (
                <Chip
                  key={tab}
                  label={t(`currencyPicker.tab_${tab}`, tab)}
                  selected={activeTab === tab}
                  onPress={() => handleTabChange(tab)}
                  size="sm"
                />
              ))}
            </View>
          )}
        </View>
      ),
      [spacing, br, search, handleSearch, activeTab, handleTabChange, filterType],
    );

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
          onPress={onClose}
        >
          <Pressable
            style={{
              backgroundColor: '#111118',
              borderTopLeftRadius: br.xl,
              borderTopRightRadius: br.xl,
              maxHeight: '85%',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignSelf: 'center',
                marginTop: spacing.lg,
                marginBottom: spacing.sm,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.xl,
                marginBottom: spacing.sm,
              }}
            >
              <Text size="xl" weight="bold">
                {title}
              </Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Icon name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <FlatList
              data={results}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ListHeaderComponent={listHeader}
              ListFooterComponent={
                loading ? (
                  <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                    <ActivityIndicator color="#6366F1" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !loading ? (
                  <View style={{ paddingVertical: spacing.huge, alignItems: 'center' }}>
                    <Icon name="search-outline" size={40} color="#52525B" />
                    <Text size="md" style={{ color: '#71717A', marginTop: spacing.md }}>
                      {t('currencyPicker.notFound', 'Валюта не найдена')}
                    </Text>
                  </View>
                ) : null
              }
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.lg),
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
