import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Typography } from '../../theme';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { AdCard } from '../../components/AdCard/AdCard';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useCategories } from '../../hooks/useCategories';
import { fetchFeaturedAds } from '../../api/adsService';
import { useFilterStore } from '../../store/useFilterStore';
import { useAppStore } from '../../store/useAppStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNERS = [
  { id: '1', bg: '#1A3C5E', title: 'BUY YOUR\nMOBILE\nDIRECTLY', cta: 'ORDER NOW' },
  { id: '2', bg: '#2D6A4F', title: 'FIND YOUR\nDREAM\nHOME', cta: 'BROWSE NOW' },
  { id: '3', bg: '#7B2D8B', title: 'BEST DEALS\nON CARS\nTODAY', cta: 'SEE DEALS' },
];

const FEATURED_SECTIONS = [
  { labelKey: 'home.carsForSale', categoryID: '23' },
  { labelKey: 'home.mobilePhones', categoryID: '198' },
  { labelKey: 'home.internationalProperties', categoryID: '2' },
];

const getCategoryEmoji = (name: string): string => {
  const map: Record<string, string> = {
    vehicles: '🚗',
    properties: '🏠',
    electronics: '📱',
    furniture: '🛋️',
    fashion: '👗',
    jobs: '💼',
    services: '🔧',
    mobiles: '📱',
    phones: '📱',
  };
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '📦';
};

// ─── Featured Section Component ───────────────────────────────────────────────
const FeaturedSection: React.FC<{
  labelKey: string;
  categoryID: string;
  onSeeAll: () => void;
  onAdPress: () => void;
}> = ({ labelKey, categoryID, onSeeAll, onAdPress }) => {
  const { t } = useTranslation();
  const { data: ads, isLoading } = useQuery({
    queryKey: ['featuredAds', categoryID],
    queryFn: () => fetchFeaturedAds(categoryID),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t(labelKey)}</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: Spacing.lg }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ marginRight: Spacing.sm }}>
              <Skeleton width={160} height={120} borderRadius={8} />
              <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
              <Skeleton width={140} height={10} style={{ marginTop: 4 }} />
            </View>
          ))}
        </ScrollView>
      ) : ads && ads.length > 0 ? (
        <FlatList
          data={ads}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
          renderItem={({ item }) => (
            <AdCard ad={item} onPress={onAdPress} variant="grid" />
          )}
        />
      ) : (
        <Text style={styles.noAds}>No ads available</Text>
      )}
    </View>
  );
};

// ─── Home Screen ──────────────────────────────────────────────────────────────
export const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const setCategoryExternalID = useFilterStore(s => s.setCategoryExternalID);
  const resetFilters = useFilterStore(s => s.resetFilters);
  const setLanguage = useAppStore(s => s.setLanguage);

  const { data: categories, isLoading: loadingCats } = useCategories();
  const topLevelCategories =
    categories?.filter(c => !c.parentID).slice(0, 8) ?? [];

  const bannerRef = useRef<FlatList>(null);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeBanner + 1) % BANNERS.length;
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveBanner(next);
    }, 3500);
    return () => clearInterval(timer);
  }, [activeBanner]);

  const handleCategoryPress = (catID: string) => {
    setCategoryExternalID(catID);
    navigation.navigate('SearchResults');
  };

  const handleSearchPress = () => {
    resetFilters();
    navigation.navigate('SearchResults');
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    setLanguage(next);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header]}>
        <View style={styles.headerTop}>
          <TouchableOpacity>
            <Text style={styles.locationText}>🇱🇧 {t('home.location')} ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLanguage} style={styles.langBtn}>
            <Text style={styles.langText}>
              {i18n.language === 'en' ? 'AR' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>
        <SearchBar
          value=""
          onChangeText={() => {}}
          editable={false}
          onPress={handleSearchPress}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Banner Carousel */}
        <View style={styles.bannerWrapper}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            onMomentumScrollEnd={e => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x /
                  (SCREEN_WIDTH - Spacing.lg * 2),
              );
              setActiveBanner(index);
            }}
            renderItem={({ item }) => (
              <View
                style={[styles.banner, { backgroundColor: item.bg }]}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <TouchableOpacity style={styles.bannerCta}>
                  <Text style={styles.bannerCtaText}>{item.cta}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={styles.dotsRow}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeBanner && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Browse Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.browseCategories')}
            </Text>
            <TouchableOpacity onPress={handleSearchPress}>
              <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {loadingCats ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={styles.categoryItem}>
                  <Skeleton width={52} height={52} borderRadius={26} />
                  <Skeleton
                    width={48}
                    height={10}
                    style={{ marginTop: 6 }}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
              {topLevelCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat.externalID)}>
                  <View style={styles.categoryIconBg}>
                    <Text style={styles.categoryEmoji}>
                      {getCategoryEmoji(cat.name)}
                    </Text>
                  </View>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {i18n.language === 'ar' && cat.nameAr
                      ? cat.nameAr
                      : cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Featured Sections */}
        {FEATURED_SECTIONS.map(section => (
          <FeaturedSection
            key={section.categoryID}
            labelKey={section.labelKey}
            categoryID={section.categoryID}
            onSeeAll={() => handleCategoryPress(section.categoryID)}
            onAdPress={() => handleCategoryPress(section.categoryID)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  langBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  langText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  bannerWrapper: {
    marginTop: Spacing.lg,
  },
  banner: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    marginHorizontal: Spacing.lg,
    height: 150,
    borderRadius: 12,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  bannerCta: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  bannerCtaText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    width: 64,
  },
  categoryIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  noAds: {
    paddingHorizontal: Spacing.lg,
    color: Colors.textTertiary,
    fontSize: 13,
  },
});