import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { AdCard } from '../../components/AdCard/AdCard';
import { Colors, Spacing, Typography } from '../../theme';

export const AccountScreen: React.FC = () => {
  const savedAds = useAppStore(s => s.savedAds);
  const unsaveAd = useAppStore(s => s.unsaveAd);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <View style={styles.savedSection}>
        <View style={styles.savedHeader}>
          <Text style={styles.savedTitle}>❤️ Saved Ads</Text>
          <Text style={styles.savedCount}>{savedAds.length} items</Text>
        </View>

        {savedAds.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔖</Text>
            <Text style={styles.emptyTitle}>No saved ads yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the ♡ heart on any ad to save it here
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedAds}
            keyExtractor={(item, index) => `saved-${item.id}-${index}`}
            renderItem={({ item }) => (
              <AdCard ad={item} variant="list" />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: Spacing.sm }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { ...Typography.h2, color: Colors.textPrimary },
  savedSection: { flex: 1 },
  savedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  savedTitle: { ...Typography.h3, color: Colors.textPrimary },
  savedCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});