import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '../../theme';
import { FilterChip } from '../../components/FilterChip/FilterChip';
import { useFilterStore } from '../../store/useFilterStore';
import { useCategories, useCategoryFields } from '../../hooks/useCategories';
import { useLocations } from '../../hooks/useLocations';
import { useAds } from '../../hooks/useAds';
import { CategoryField } from '../../types/category';
import { SafeAreaView } from 'react-native-safe-area-context';
export const FiltersScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();

  const filters = useFilterStore(s => s.filters);
  const setLocationExternalID = useFilterStore(s => s.setLocationExternalID);
  const setPriceRange = useFilterStore(s => s.setPriceRange);
  const setCondition = useFilterStore(s => s.setCondition);
  const setDynamicFilter = useFilterStore(s => s.setDynamicFilter);
  const clearDynamicFilter = useFilterStore(s => s.clearDynamicFilter);
  const resetFilters = useFilterStore(s => s.resetFilters);
  const setCategoryExternalID = useFilterStore(s => s.setCategoryExternalID);

  const [priceMin, setPriceMin] = useState(
    filters.priceMin ? String(filters.priceMin) : '',
  );
  const [priceMax, setPriceMax] = useState(
    filters.priceMax ? String(filters.priceMax) : '',
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDynamicModal, setShowDynamicModal] = useState<CategoryField | null>(null);

  const { data: categories } = useCategories();
  const { data: categoryFields } = useCategoryFields();
  const { data: locations } = useLocations();
  const { data: adsData } = useAds(filters);

  const resultCount = adsData?.pages[0]?.total || 0;

  const selectedCategory = categories?.find(
    c => c.externalID === filters.categoryExternalID,
  );

  const selectedLocation = locations?.find(
    l => l.externalID === filters.locationExternalID,
  );

  const dynamicFields: CategoryField[] = filters.categoryExternalID
    ? categoryFields?.[filters.categoryExternalID] || []
    : [];

  const applyPriceRange = useCallback(() => {
    setPriceRange(
      priceMin ? Number(priceMin) : undefined,
      priceMax ? Number(priceMax) : undefined,
    );
  }, [priceMin, priceMax]);

  const handleApply = () => {
    applyPriceRange();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('filters.title')}</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.clearAll}>{t('common.clearAll')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Category */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>{t('filters.category')}</Text>
          <TouchableOpacity
            style={styles.filterRowRight}
            onPress={() => setShowCategoryModal(true)}>
            <View>
              <Text style={styles.filterValue}>
                {selectedCategory?.name || t('common.any')}
              </Text>
              {selectedCategory?.name && (
                <Text style={styles.filterSubValue}>
                  {t('common.forSale')}
                </Text>
              )}
            </View>
            <Text style={styles.changeText}>{t('filters.change')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Location */}
        <TouchableOpacity
          style={styles.filterRow}
          onPress={() => setShowLocationModal(true)}>
          <Text style={styles.filterLabel}>{t('filters.location')}</Text>
          <View style={styles.filterRowRight}>
            <Text style={styles.filterValue}>
              {selectedLocation?.name || t('home.location')}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Highlights */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('filters.highlights')}</Text>
          <View style={styles.chipsRow}>
            <FilterChip
              label={t('common.any')}
              selected={!filters.dynamicFilters.highlighted}
              onPress={() => clearDynamicFilter('highlighted')}
            />
            <FilterChip
              label={t('common.available')}
              selected={filters.dynamicFilters.highlighted === 'available'}
              onPress={() => setDynamicFilter('highlighted', 'available')}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Condition */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('filters.condition')}</Text>
          <View style={styles.chipsRow}>
            <FilterChip
              label={t('common.any')}
              selected={!filters.condition}
              onPress={() => setCondition(undefined)}
            />
            <FilterChip
              label={t('common.new')}
              selected={filters.condition === 'new'}
              onPress={() => setCondition('new')}
            />
            <FilterChip
              label={t('common.used')}
              selected={filters.condition === 'used'}
              onPress={() => setCondition('used')}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Price */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('filters.price')}</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              placeholder={t('filters.min')}
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={priceMin}
              onChangeText={setPriceMin}
              onBlur={applyPriceRange}
            />
            <TextInput
              style={styles.priceInput}
              placeholder={t('filters.max')}
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={priceMax}
              onChangeText={setPriceMax}
              onBlur={applyPriceRange}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Dynamic fields from categoryFields API */}
        {dynamicFields.map(field => (
          <React.Fragment key={field.key}>
            <TouchableOpacity
              style={styles.filterRow}
              onPress={() => setShowDynamicModal(field)}>
              <Text style={styles.filterLabel}>
                {i18n.language === 'ar' && field.labelAr
                  ? field.labelAr
                  : field.label}
              </Text>
              <View style={styles.filterRowRight}>
                <Text style={styles.filterValue}>
                  {filters.dynamicFilters[field.key]
                    ? String(filters.dynamicFilters[field.key])
                    : t('common.any')}
                </Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
          </React.Fragment>
        ))}
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>
            {t('filters.seeResults', { count: resultCount.toLocaleString() })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('filters.location')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={locations || []}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setLocationExternalID(item.externalID);
                  setShowLocationModal(false);
                }}>
                <Text style={styles.modalOptionText}>{item.name}</Text>
                {filters.locationExternalID === item.externalID && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('filters.category')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={categories?.filter(c => !c.parentID) || []}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setCategoryExternalID(item.externalID);
                  setShowCategoryModal(false);
                }}>
                <Text style={styles.modalOptionText}>
                  {getCategoryEmoji(item.name)} {item.name}
                </Text>
                {filters.categoryExternalID === item.externalID && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Dynamic field modal */}
      <Modal visible={!!showDynamicModal} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDynamicModal(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{showDynamicModal?.label || ''}</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={showDynamicModal?.choices || []}
            keyExtractor={item => item.value}
            ListHeaderComponent={() => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  if (showDynamicModal) clearDynamicFilter(showDynamicModal.key);
                  setShowDynamicModal(null);
                }}>
                <Text style={styles.modalOptionText}>{t('common.any')}</Text>
                {!filters.dynamicFilters[showDynamicModal?.key || ''] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  if (showDynamicModal) {
                    setDynamicFilter(showDynamicModal.key, item.value);
                  }
                  setShowDynamicModal(null);
                }}>
                <Text style={styles.modalOptionText}>{item.label}</Text>
                {filters.dynamicFilters[showDynamicModal?.key || ''] ===
                  item.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const getCategoryEmoji = (name: string): string => {
  const map: Record<string, string> = {
    Vehicles: '🚗', Properties: '🏠', Electronics: '📱',
    Furniture: '🛋️', Fashion: '👗', Jobs: '💼', Services: '🔧',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '📦';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeBtn: {
    fontSize: 18,
    color: Colors.textPrimary,
    padding: Spacing.xs,
  },
  clearAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    paddingBottom: 100,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filterRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  filterValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  filterSubValue: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  changeText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 18,
    color: Colors.textTertiary,
  },
  filterSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  checkmark: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});