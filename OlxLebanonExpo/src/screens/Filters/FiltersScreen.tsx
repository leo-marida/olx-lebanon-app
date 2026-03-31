import React, { useState, useEffect, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography } from '../../theme';
import { FilterChip } from '../../components/FilterChip/FilterChip';
import { useFilterStore } from '../../store/useFilterStore';
import { useCategories, useCategoryFields } from '../../hooks/useCategories';
import { useLocations } from '../../hooks/useLocations';
import { useAds } from '../../hooks/useAds';
import { CategoryField } from '../../types/category';

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

  const resultCount = adsData?.pages[0]?.total ?? 0;

  const selectedCategory = categories?.find(
    c => c.externalID === filters.categoryExternalID,
  );
  const selectedLocation = locations?.find(
    l => l.externalID === filters.locationExternalID,
  );

  const dynamicFields: CategoryField[] =
    filters.categoryExternalID
      ? categoryFields?.[filters.categoryExternalID] ?? []
      : [];

  // Instant price apply with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceRange(
        priceMin ? Number(priceMin) : undefined,
        priceMax ? Number(priceMax) : undefined,
      );
    }, 600);
    return () => clearTimeout(timer);
  }, [priceMin, priceMax]);

  const getFieldLabel = (field: CategoryField) =>
    i18n.language === 'ar' && field.labelAr ? field.labelAr : field.label;

  const getFieldValue = (field: CategoryField) => {
    const val = filters.dynamicFilters[field.key];
    if (!val) return t('common.any');
    const choice = field.choices?.find(c => c.value === String(val));
    return choice
      ? i18n.language === 'ar' && choice.labelAr
        ? choice.labelAr
        : choice.label
      : String(val);
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('filters.title')}</Text>
        <TouchableOpacity onPress={resetFilters}>
          <Text style={styles.clearAll}>{t('common.clearAll')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* ── CATEGORY ── */}
        {renderSectionHeader(t('filters.category'))}
        <TouchableOpacity
          style={styles.filterRow}
          onPress={() => setShowCategoryModal(true)}>
          <View style={styles.filterRowLeft}>
            <Text style={styles.filterRowEmoji}>
              {getCategoryEmoji(selectedCategory?.name ?? '')}
            </Text>
            <View>
              <Text style={styles.filterValue}>
                {selectedCategory?.name ?? t('common.any')}
              </Text>
              {selectedCategory && (
                <Text style={styles.filterSubValue}>{t('common.forSale')}</Text>
              )}
            </View>
          </View>
          <Text style={styles.changeText}>{t('filters.change')}</Text>
        </TouchableOpacity>

        {/* ── LOCATION ── */}
        {renderSectionHeader(t('filters.location'))}
        <TouchableOpacity
          style={styles.filterRow}
          onPress={() => setShowLocationModal(true)}>
          <Text style={styles.filterValue}>
            {selectedLocation?.name ?? t('home.location')}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* ── HIGHLIGHTS ── */}
        {renderSectionHeader(t('filters.highlights'))}
        <View style={styles.chipsSection}>
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

        {/* ── CONDITION ── */}
        {renderSectionHeader(t('filters.condition'))}
        <View style={styles.chipsSection}>
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

        {/* ── PRICE ── */}
        {renderSectionHeader(t('filters.price'))}
        <View style={styles.priceSection}>
          <View style={styles.priceInputWrapper}>
            <Text style={styles.priceLabel}>{t('filters.min')}</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={priceMin}
              onChangeText={setPriceMin}
            />
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceInputWrapper}>
            <Text style={styles.priceLabel}>{t('filters.max')}</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Any"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="numeric"
              value={priceMax}
              onChangeText={setPriceMax}
            />
          </View>
        </View>

        {/* ── DYNAMIC FIELDS FROM API ── */}
        {dynamicFields.length > 0 && (
          <>
            {renderSectionHeader('More Filters')}
            {dynamicFields.map(field => (
              <TouchableOpacity
                key={field.key}
                style={styles.filterRow}
                onPress={() => setShowDynamicModal(field)}>
                <View>
                  <Text style={styles.filterLabel}>{getFieldLabel(field)}</Text>
                  <Text style={styles.filterSubValue}>{getFieldValue(field)}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.applyBtnText}>
            {t('filters.seeResults', {
              count: resultCount.toLocaleString(),
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('filters.location')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={[
              { id: 'all', externalID: '0-1', name: 'All Lebanon', level: 0 },
              ...(locations ?? []),
            ]}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  filters.locationExternalID === item.externalID &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setLocationExternalID(item.externalID);
                  setShowLocationModal(false);
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    filters.locationExternalID === item.externalID &&
                      styles.modalOptionTextSelected,
                  ]}>
                  {item.name}
                </Text>
                {filters.locationExternalID === item.externalID && (
                  <View style={styles.checkmarkCircle}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('filters.category')}</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={[
              { id: 'all', externalID: '', name: 'All Categories', parentID: undefined },
              ...(categories?.filter(c => !c.parentID) ?? []),
            ]}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  filters.categoryExternalID === item.externalID &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setCategoryExternalID(item.externalID);
                  setShowCategoryModal(false);
                }}>
                <View style={styles.modalOptionLeft}>
                  <Text style={styles.modalOptionEmoji}>
                    {getCategoryEmoji(item.name)}
                  </Text>
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.categoryExternalID === item.externalID &&
                        styles.modalOptionTextSelected,
                    ]}>
                    {item.name}
                  </Text>
                </View>
                {filters.categoryExternalID === item.externalID && (
                  <View style={styles.checkmarkCircle}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Dynamic field modal */}
      <Modal visible={!!showDynamicModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDynamicModal(null)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {showDynamicModal ? getFieldLabel(showDynamicModal) : ''}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={[
              { value: '', label: t('common.any'), labelAr: t('common.any') },
              ...(showDynamicModal?.choices ?? []),
            ]}
            keyExtractor={item => item.value}
            renderItem={({ item }) => {
              const isSelected =
                item.value === ''
                  ? !filters.dynamicFilters[showDynamicModal?.key ?? '']
                  : filters.dynamicFilters[showDynamicModal?.key ?? ''] ===
                    item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    isSelected && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    if (showDynamicModal) {
                      if (item.value === '') {
                        clearDynamicFilter(showDynamicModal.key);
                      } else {
                        setDynamicFilter(showDynamicModal.key, item.value);
                      }
                    }
                    setShowDynamicModal(null);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}>
                    {i18n.language === 'ar' && item.labelAr
                      ? item.labelAr
                      : item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmarkCircle}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const getCategoryEmoji = (name: string): string => {
  const map: Record<string, string> = {
    vehicles: '🚗', properties: '🏠', electronics: '📱',
    furniture: '🛋️', fashion: '👗', jobs: '💼',
    services: '🔧', mobiles: '📱', phones: '📱',
  };
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '📦';
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary },
  closeBtn: { fontSize: 18, color: Colors.textPrimary, padding: Spacing.xs },
  clearAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  content: { paddingBottom: 20 },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterRowEmoji: { fontSize: 24 },
  filterLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  filterValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  filterSubValue: { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  changeText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  chevron: { fontSize: 20, color: Colors.textTertiary },
  chipsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  priceInputWrapper: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 2,
    fontWeight: '500',
  },
  priceInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
    fontWeight: '600',
  },
  priceDivider: {
    width: 12,
    height: 1.5,
    backgroundColor: Colors.border,
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
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: Colors.surface },
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
  modalOptionSelected: { backgroundColor: `${Colors.primary}10` },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  modalOptionEmoji: { fontSize: 20 },
  modalOptionText: { ...Typography.body, color: Colors.textPrimary },
  modalOptionTextSelected: { color: Colors.primary, fontWeight: '600' },
  checkmarkCircle: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});