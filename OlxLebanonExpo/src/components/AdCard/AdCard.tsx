import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ad } from '../../types/ad';
import { Colors, Spacing, Typography } from '../../theme';
import { useTranslation } from 'react-i18next';

interface AdCardProps {
  ad: Ad;
  onPress?: () => void;
  onSave?: () => void;
  variant?: 'grid' | 'list';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  onPress,
  onSave,
  variant = 'grid',
}) => {
  const { t } = useTranslation();

  if (variant === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listCard, ad.isElite && styles.eliteCard]}
        onPress={onPress}
        activeOpacity={0.85}>
        {ad.isElite && (
          <View style={styles.eliteBadge}>
            <Text style={styles.eliteBadgeText}>★ Elite</Text>
          </View>
        )}
        <Image
          source={{ uri: ad.images?.[0]?.url }}
          style={styles.listImage}
          resizeMode="cover"
        />
        <View style={styles.listContent}>
          <Text style={styles.price}>
            {ad.price ? `${ad.currency} ${ad.price.toLocaleString()}` : t('common.forSale')}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {ad.title}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {ad.location.name}
          </Text>
          <View style={styles.listActions}>
            <TouchableOpacity style={styles.chatBtn}>
              <Text style={styles.chatBtnText}>{t('common.chat')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>{t('common.call')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.heartBtn} onPress={onSave}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: GRID_CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.85}>
      <Image
        source={{ uri: ad.images?.[0]?.url }}
        style={styles.gridImage}
        resizeMode="cover"
      />
      <TouchableOpacity style={styles.heartBtnGrid} onPress={onSave}>
        <Text style={styles.heartIcon}>♡</Text>
      </TouchableOpacity>
      <View style={styles.gridContent}>
        <Text style={styles.price}>
          {ad.price ? `${ad.currency} ${ad.price.toLocaleString()}` : t('common.forSale')}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {ad.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {ad.location.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  gridImage: {
    width: '100%',
    height: 140,
  },
  heartBtnGrid: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  gridContent: {
    padding: Spacing.sm,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  eliteCard: {
    borderWidth: 1,
    borderColor: Colors.elite,
  },
  eliteBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: Colors.elite,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    zIndex: 1,
    borderBottomRightRadius: 6,
  },
  eliteBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  listImage: {
    width: 120,
    height: 120,
  },
  listContent: {
    flex: 1,
    padding: Spacing.sm,
    paddingTop: Spacing.md,
  },
  listActions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  chatBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  chatBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  callBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  callBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  heartBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  heartIcon: {
    fontSize: 20,
    color: Colors.textTertiary,
  },
  price: {
    ...Typography.price,
    color: Colors.primary,
    marginBottom: 2,
  },
  title: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  location: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});