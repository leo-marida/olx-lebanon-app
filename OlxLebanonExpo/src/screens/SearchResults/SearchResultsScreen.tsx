import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '../../theme';
import { AdCard } from '../../components/AdCard/AdCard';
import { FilterChip } from '../../components/FilterChip/FilterChip';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useAds } from '../../hooks/useAds';
import { useFilterStore } from '../../store/useFilterStore';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useCategories } from '../../hooks/useCategories';
import { Ad } from '../../types/ad';
import { useAppStore } from '../../store/useAppStore';

export const SearchResultsScreen: React.FC = () => {
  const { t } = useTranslation();
  const savedAds = useAppStore(s => s.savedAds);
  const navigation = useNavigation<any>();
  const [localQuery, setLocalQuery] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const filters = useFilterStore(s => s.filters);
  const setQuery = useFilterStore(s => s.setQuery);
  const setSortBy = useFilterStore(s => s.setSortBy);

  const debouncedQuery = useDebouncedSearch(localQuery, 300);

  React.useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useAds(filters);

  const { data: categories } = useCategories();

  const allAds: Ad[] = data?.pages.flatMap(p => p.hits) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;
  const eliteAds = allAds.filter(a => a.isElite);
  const regularAds = allAds.filter(a => !a.isElite);

  const categoryName =
    categories?.find(c => c.externalID === filters.categoryExternalID)
      ?.name ?? 'All Categories';

  const getSortLabel = () => {
    if (filters.sortBy === 'price_asc') return t('search.sortPriceAsc');
    if (filters.sortBy === 'price_desc') return t('search.sortPriceDesc');
    return t('search.sortNewest');
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    setQuery('');
    inputRef.current?.focus();
  };

  const renderSortModal = () => (
    <Modal visible={showSortModal} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setShowSortModal(false)}
        activeOpacity={1}>
        <View style={styles.sortSheet}>
          <View style={styles.sortSheetHandle} />
          <Text style={styles.sortTitle}>{t('common.sortBy')}</Text>
          {[
            { key: 'timestamp', label: t('search.sortNewest'), icon: '🕐' },
            { key: 'price_asc', label: t('search.sortPriceAsc'), icon: '↑' },
            { key: 'price_desc', label: t('search.sortPriceDesc'), icon: '↓' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.sortOption,
                filters.sortBy === opt.key && styles.sortOptionSelected,
              ]}
              onPress={() => {
                setSortBy(opt.key as any);
                setShowSortModal(false);
              }}>
              <View style={styles.sortOptionLeft}>
                <Text style={styles.sortOptionIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.sortOptionText,
                    filters.sortBy === opt.key && styles.sortOptionActive,
                  ]}>
                  {opt.label}
                </Text>
              </View>
              {filters.sortBy === opt.key && (
                <View style={styles.sortCheckmark}>
                  <Text style={styles.sortCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderHeader = () => (
    <>
      {/* Filter chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => navigation.navigate('Filters')}>
            <Text style={styles.filterBtnIcon}>⊟</Text>
            <Text style={styles.filterBtnText}>{t('common.filters')}</Text>
          </TouchableOpacity>

          {filters.locationExternalID && filters.locationExternalID !== '0-1' && (
            <FilterChip
              label="📍 Location"
              selected
              onPress={() => navigation.navigate('Filters')}
            />
          )}
          {filters.categoryExternalID && (
            <FilterChip
              label={categoryName}
              selected
              onPress={() => navigation.navigate('Filters')}
            />
          )}
          {filters.condition && (
            <FilterChip
              label={filters.condition === 'new' ? '✨ New' : '🔄 Used'}
              selected
              onPress={() => navigation.navigate('Filters')}
            />
          )}
          {(filters.priceMin || filters.priceMax) && (
            <FilterChip
              label={`💰 ${filters.priceMin ?? 0} - ${filters.priceMax ?? '∞'}`}
              selected
              onPress={() => navigation.navigate('Filters')}
            />
          )}
        </ScrollView>
      </View>

      {/* Results count + sort */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          <Text style={styles.resultsNumber}>
            {totalCount.toLocaleString()}
          </Text>
          {' results'}
          {localQuery ? ` for "${localQuery}"` : ''}
        </Text>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortModal(true)}>
          <Text style={styles.sortBtnText}>{getSortLabel()}</Text>
          <Text style={styles.sortBtnIcon}> ⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Elite ads */}
      {eliteAds.length > 0 && (
        <View style={styles.eliteSection}>
          <View style={styles.eliteSectionHeader}>
            <Text style={styles.eliteSectionTitle}>★ {t('search.eliteAds')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewMore}>{t('search.viewMore')} ›</Text>
            </TouchableOpacity>
          </View>
          {eliteAds.slice(0, 2).map(ad => (
            <AdCard key={`elite-${ad.id}`} ad={ad} variant="list" />
          ))}
          <View style={styles.eliteDivider} />
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.searchInputWrapper,
            searchFocused && styles.searchInputFocused,
          ]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={Colors.textTertiary}
            value={localQuery}
            onChangeText={setLocalQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {localQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => navigation.navigate('Filters')}>
          <Text style={styles.filterIconText}>⊟</Text>
          {(filters.categoryExternalID ||
            filters.condition ||
            filters.priceMin ||
            filters.priceMax) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton width={120} height={110} borderRadius={8} />
              <View style={styles.skeletonContent}>
                <Skeleton width="60%" height={16} />
                <Skeleton width="90%" height={12} style={{ marginTop: 8 }} />
                <Skeleton width="50%" height={10} style={{ marginTop: 6 }} />
                <Skeleton width="70%" height={10} style={{ marginTop: 6 }} />
                <View style={styles.skeletonBtns}>
                  <Skeleton width="45%" height={30} borderRadius={6} />
                  <Skeleton width="45%" height={30} borderRadius={6} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={regularAds}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          extraData={savedAds}
          renderItem={({ item }) => <AdCard ad={item} variant="list" onPress={() => {}} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>{t('common.noResults')}</Text>
              <Text style={styles.emptySubtitle}>
                {localQuery
                  ? `No results found for "${localQuery}"`
                  : 'Try adjusting your filters'}
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Filters')}>
                <Text style={styles.emptyBtnText}>Adjust Filters</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}

      {renderSortModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchInputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearBtn: {
    backgroundColor: Colors.textTertiary,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '700',
  },
  filterIconBtn: {
    position: 'relative',
    padding: Spacing.xs,
  },
  filterIconText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  chipsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    gap: 4,
    marginRight: Spacing.sm,
  },
  filterBtnIcon: {
    fontSize: 14,
  },
  filterBtnText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resultsNumber: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  sortBtnIcon: {
    fontSize: 12,
    color: Colors.primary,
  },
  eliteSection: {
    backgroundColor: Colors.surface,
  },
  eliteSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.eliteBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.elite,
  },
  eliteSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8860B',
  },
  viewMore: {
    fontSize: 13,
    color: Colors.primary,
  },
  eliteDivider: {
    height: 8,
    backgroundColor: Colors.background,
  },
  skeletonContainer: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  skeletonContent: {
    flex: 1,
    gap: 4,
  },
  skeletonBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingMoreText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  sortSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sortTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  sortOptionSelected: {
    backgroundColor: `${Colors.primary}15`,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sortOptionIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  sortOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  sortOptionActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  sortCheckmark: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortCheckmarkText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});