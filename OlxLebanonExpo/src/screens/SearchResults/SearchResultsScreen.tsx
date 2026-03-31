import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '../../theme';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { AdCard } from '../../components/AdCard/AdCard';
import { FilterChip } from '../../components/FilterChip/FilterChip';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useAds } from '../../hooks/useAds';
import { useFilterStore } from '../../store/useFilterStore';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useCategories } from '../../hooks/useCategories';
import { Ad } from '../../types/ad';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SearchResultsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [localQuery, setLocalQuery] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);

  const filters = useFilterStore(s => s.filters);
  const setQuery = useFilterStore(s => s.setQuery);
  const setSortBy = useFilterStore(s => s.setSortBy);

  const debouncedQuery = useDebouncedSearch(localQuery, 400);

  React.useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery]);

  // ← FIX 6: added refetch and isRefetching here
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
    categories?.find(c => c.externalID === filters.categoryExternalID)?.name ??
    t('common.forSale');

  const renderSortModal = () => (
    <Modal visible={showSortModal} transparent animationType="slide">
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setShowSortModal(false)}>
        <View style={styles.sortSheet}>
          <Text style={styles.sortTitle}>{t('common.sortBy')}</Text>
          {[
            { key: 'timestamp', label: t('search.sortNewest') },
            { key: 'price_asc', label: t('search.sortPriceAsc') },
            { key: 'price_desc', label: t('search.sortPriceDesc') },
          ].map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortOption}
              onPress={() => {
                setSortBy(opt.key as any);
                setShowSortModal(false);
              }}>
              <Text
                style={[
                  styles.sortOptionText,
                  filters.sortBy === opt.key && styles.sortOptionActive,
                ]}>
                {opt.label}
              </Text>
              {filters.sortBy === opt.key && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderHeader = () => (
    <>
      <View style={styles.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip
            label={`⊟ ${t('common.filters')}`}
            onPress={() => navigation.navigate('Filters')}
          />
          <FilterChip
            label={t('home.location')}
            onPress={() => {}}
            hasDropdown
          />
          <FilterChip
            label={categoryName}
            selected={!!filters.categoryExternalID}
            onPress={() => {}}
          />
        </ScrollView>
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>
          {t('search.showing', {
            count: totalCount.toLocaleString(),
            category: categoryName,
          })}
        </Text>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortModal(true)}>
          <Text style={styles.sortBtnText}>{t('common.sortBy')} ⇅</Text>
        </TouchableOpacity>
      </View>

      {eliteAds.length > 0 && (
        <View style={styles.eliteSection}>
          <View style={styles.eliteSectionHeader}>
            <Text style={styles.eliteSectionTitle}>
              ★ {t('search.eliteAds')}
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewMore}>{t('search.viewMore')} ›</Text>
            </TouchableOpacity>
          </View>
          {eliteAds.slice(0, 2).map(ad => (
            <AdCard key={ad.id} ad={ad} variant="list" />
          ))}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <SearchBar
        value={localQuery}
        onChangeText={setLocalQuery}
        onBack={() => navigation.goBack()}
        onFilterPress={() => navigation.navigate('Filters')}
        showBack
      />

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton width={120} height={100} />
              <View style={{ flex: 1, paddingLeft: Spacing.sm }}>
                <Skeleton width="80%" height={14} />
                <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
                <Skeleton width="60%" height={10} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={regularAds}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <AdCard ad={item} variant="list" />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('common.noResults')}</Text>
            </View>
          )}
          // ← FIX 6: these two lines are the pull-to-refresh
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator
                color={Colors.primary}
                style={{ padding: Spacing.lg }}
              />
            ) : null
          }
        />
      )}

      {renderSortModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chipsRow: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultsCount: { ...Typography.caption, color: Colors.textSecondary },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  eliteSection: { marginBottom: Spacing.sm },
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
  eliteSectionTitle: { fontSize: 13, fontWeight: '700', color: '#B8860B' },
  viewMore: { fontSize: 13, color: Colors.primary },
  skeletonContainer: { padding: Spacing.lg },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl * 2 },
  emptyText: { ...Typography.body, color: Colors.textTertiary },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.xl,
  },
  sortTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.lg },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOptionText: { ...Typography.body, color: Colors.textPrimary },
  sortOptionActive: { color: Colors.primary, fontWeight: '600' },
  checkmark: { color: Colors.primary, fontWeight: '700' },
});