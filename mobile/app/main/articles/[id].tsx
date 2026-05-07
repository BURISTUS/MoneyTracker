import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import { articlesService } from '../../../src/services/articles';
import type { Article } from '../../../src/types';
import { Loading } from '../../../src/components/ui/Loading';

export default function ArticleScreen() {
  const C = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    articlesService
      .getOne(id)
      .then((data) => setArticle(data))
      .catch((e) => {
        console.error('Failed to load article:', e);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;

  if (error || !article) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.textMain} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 15, color: C.textSec, textAlign: 'center' }}>
            {t('common.error')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={C.textMain} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="eye-outline" size={14} color={C.textSec} />
            <Text style={{ fontSize: 12, color: C.textSec }}>
              {t('home.views', { count: article.viewCount })}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tag badge */}
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: C.primaryBg,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary }}>
            {article.tag}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: '800',
            color: C.textMain,
            lineHeight: 30,
            marginBottom: 12,
          }}
        >
          {article.title}
        </Text>

        {/* Meta */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={14} color={C.textSec} />
            <Text style={{ fontSize: 12, color: C.textSec }}>{article.readTime}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="eye-outline" size={14} color={C.textSec} />
            <Text style={{ fontSize: 12, color: C.textSec }}>
              {t('home.views', { count: article.viewCount })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="globe-outline" size={14} color={C.textSec} />
            <Text style={{ fontSize: 12, color: C.textSec }}>{article.language.toUpperCase()}</Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: C.border,
            marginBottom: 24,
          }}
        />

        {/* Content */}
        <Text
          style={{
            fontSize: 16,
            color: C.textMain,
            lineHeight: 26,
          }}
        >
          {article.content}
        </Text>
      </ScrollView>
    </View>
  );
}
