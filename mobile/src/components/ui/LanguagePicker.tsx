import React, { useCallback } from 'react';
import { Modal, View, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useTheme } from '../../stores/themeStore';
import { changeLanguage as applyLanguage } from '../../i18n';

interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

export function getNativeName(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.nativeName || code;
}

interface LanguagePickerProps {
  visible: boolean;
  onClose: () => void;
  currentLang: string;
}

const LanguageItemRow = React.memo(
  ({
    item,
    isSelected,
    onPress,
  }: {
    item: LanguageItem;
    isSelected: boolean;
    onPress: () => void;
  }) => {
    const C = useTheme();
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: isSelected ? C.primaryBg : 'transparent',
          borderRadius: 14,
          marginHorizontal: 12,
          marginVertical: 3,
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
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: isSelected ? C.tabActive : C.textSec,
            }}
          >
            {item.code.toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.textMain }}>
            {item.nativeName}
          </Text>
          {item.nativeName !== item.name && (
            <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>
              {item.name}
            </Text>
          )}
        </View>
        {isSelected && <Ionicons name="checkmark" size={20} color={C.tabActive} />}
      </Pressable>
    );
  },
);

LanguageItemRow.displayName = 'LanguageItemRow';

export const LanguagePicker: React.FC<LanguagePickerProps> = React.memo(
  ({ visible, onClose, currentLang }) => {
    const C = useTheme();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const handleSelect = useCallback(
      async (code: string) => {
        await applyLanguage(code);
        onClose();
      },
      [onClose],
    );

    const renderItem = useCallback(
      ({ item }: { item: LanguageItem }) => (
        <LanguageItemRow
          item={item}
          isSelected={item.code === currentLang}
          onPress={() => handleSelect(item.code)}
        />
      ),
      [currentLang, handleSelect],
    );

    const keyExtractor = useCallback((item: LanguageItem) => item.code, []);

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
                marginTop: 12,
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
              <Text style={{ fontSize: 19, fontWeight: '700', color: C.textMain }}>
                {t('profile.selectLanguage', 'Select language')}
              </Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={22} color={C.textSec} />
              </Pressable>
            </View>

            <FlatList
              data={LANGUAGES}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: Math.max(20, insets.bottom + 16),
                paddingTop: 4,
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

LanguagePicker.displayName = 'LanguagePicker';
