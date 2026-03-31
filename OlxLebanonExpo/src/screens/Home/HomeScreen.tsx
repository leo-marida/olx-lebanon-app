import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
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

const BANNER_HEIGHT = 140;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Featured sections: [label key, categoryExternalID]
const FEATURED_SECTIONS = [
  { labelKey: 'home.carsForSale', categoryID: '23' },
  { labelKey: 'home.mobilePhones', categoryID: '198' },
  { labelKey: 'home.internationalProperties', categoryID: '2' },
];

export const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const setQuery = useFilterStore(s => s.setQuery);
  const setCategoryExternalID = useFilterStore(s => s.setCategoryExternalID);

  const { data: categories, isLoading: loadingCats } = useCategories();

  const topLevelCategories = categories?.filter(c => !c.parentID).slice(0, 8) || [];

  const handleSearchPress = () => {
    navigation.navigate('SearchResults');
  };

  const handleCategoryPress = (catID: string) => {
    setCategoryExternalID(catID);
    navigation.navigate('SearchResults');
  };

  const handleSeeAll = (catID: string) => {
    setCategoryExternalID(catID);
    navigation.navigate('SearchResults');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationRow}>
          <Text style={styles.locationText}>
            🇱🇧 {t('home.location')} ∨
          </Text>
        </TouchableOpacity>
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
        
        {/* Promo Banner */}
        <View style={styles.bannerContainer}>
          <View style={[styles.banner, { backgroundColor: '#1A3C5E' }]}>
            <Text style={styles.bannerTitle}>BUY YOUR{'\n'}MOBILE{'\n'}DIRECTLY</Text>
            <TouchableOpacity style={styles.bannerCta}>
              <Text style={styles.bannerCtaText}>ORDER NOW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Browse Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.browseCategories')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SearchResults')}>
              <Text style={styles.seeAll}>{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {loadingCats ? (
            <View style={styles.categoriesRow}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <View key={i} style={styles.categoryItem}>
                  <Skeleton width={52} height={52} borderRadius={26} />
                  <Skeleton width={48} height={10} style={{ marginTop: 4 }} />
                </View>
              ))}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    {i18n.language === 'ar' && cat.nameAr ? cat.nameAr : cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Featured sections */}
        {FEATURED_SECTIONS.map(section => (
          <FeaturedSection
            key={section.categoryID}
            labelKey={section.labelKey}
            categoryID={section.categoryID}
            onSeeAll={() => handleSeeAll(section.categoryID)}
            onAdPress={() => navigation.navigate('SearchResults')}
          />
        ))}
      </ScrollView>

      {/* Bottom Tab Bar (placeholder — React Navigation handles this) */}
    </View>
  );
};

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: Spacing.lg }}>
          {[1, 2].map(i => (
            <View key={i} style={{ marginRight: Spacing.sm }}>
              <Skeleton width={160} height={120} borderRadius={8} />
              <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
              <Skeleton width={140} height={10} style={{ marginTop: 4 }} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={ads || []}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
          ItemSeparatorComponent={() => <View style={{ width: Spacing.sm }} />}
          renderItem={({ item }) => (
            <AdCard ad={item} onPress={onAdPress} variant="grid" />
          )}
        />
      )}
    </View>
  );
};

const getCategoryEmoji = (name: string): string => {
  const map: Record<string, string> = {
    Vehicles: '🚗',
    Properties: '🏠',
    Electronics: '📱',
    Furniture: '🛋️',
    Fashion: '👗',
    Jobs: '💼',
    Services: '🔧',
    'Home Appliances': '🏠',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '📦';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  bannerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  banner: {
    height: BANNER_HEIGHT,
    borderRadius: 10,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
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
  categoriesRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    flexWrap: 'wrap',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    marginBottom: Spacing.sm,
    width: 64,
  },
  categoryIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
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
});