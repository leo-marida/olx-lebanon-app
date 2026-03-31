import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ad } from '../../types/ad';
import { Colors, Spacing, Typography } from '../../theme';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';

interface AdCardProps {
  ad: Ad;
  onPress?: () => void;
  variant?: 'grid' | 'list';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;
const LIST_IMAGE_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

const formatPrice = (price?: number, currency?: string) => {
  if (!price) return 'Contact for price';
  return `${currency ?? 'USD'} ${price.toLocaleString()}`;
};

const formatTime = (timestamp: number) => {
  if (!timestamp) return '';
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
};

export const AdCard: React.FC<AdCardProps> = ({
  ad,
  onPress,
  variant = 'grid',
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const saveAd = useAppStore(s => s.saveAd);
  const unsaveAd = useAppStore(s => s.unsaveAd);
  const isAdSaved = useAppStore(s => s.isAdSaved);
  const saved = isAdSaved(ad.id);

  const imageUrl = ad.images?.[0]?.url ?? '';
  const ef = ad.extraFields ?? {};

  // Extra info row — year, fuel, km, rooms, etc.
  const infoItems: { icon: string; value: string }[] = [];
  if (ef.year) infoItems.push({ icon: '📅', value: String(ef.year) });
  if (ef.fuel) infoItems.push({ icon: '⛽', value: String(ef.fuel) });
  if (ef.kilometers)
    infoItems.push({
      icon: '🛣️',
      value: `${Number(ef.kilometers).toLocaleString()} km`,
    });
  if (ef.rooms) infoItems.push({ icon: '🛏️', value: `${ef.rooms} bd` });
  if (ef.bathrooms)
    infoItems.push({ icon: '🚿', value: `${ef.bathrooms} ba` });
  if (ef.size) infoItems.push({ icon: '📐', value: `${ef.size} m²` });
  if (ef.brand) infoItems.push({ icon: '🏷️', value: String(ef.brand) });
  if (ef.condition)
    infoItems.push({ icon: '✨', value: String(ef.condition) });

  const handleCall = () => {
    const phone = ef.phone as string;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Contact', 'Phone number not available.');
    }
  };

  const handleChat = () => {
    navigation.navigate('Home', { screen: 'ChatsTab' });
  };

  const handleSave = () => {
    saved ? unsaveAd(ad.id) : saveAd(ad);
  };

  const HeartBtn = ({ style }: { style: object }) => (
    <TouchableOpacity
      style={style}
      onPress={handleSave}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
        {saved ? '♥' : '♡'}
      </Text>
    </TouchableOpacity>
  );

// ── GRID VARIANT ──────────────────────────────────────────────────────────
  if (variant === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridCard, { width: GRID_CARD_WIDTH }]}
        onPress={onPress}
        activeOpacity={0.88}>

        {/* Image */}
        <View style={styles.gridImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.gridImage, styles.noImageBox]}>
              <Text style={styles.noImageIcon}>🖼️</Text>
            </View>
          )}
          <HeartBtn style={styles.heartGrid} />
          {ad.isElite && (
            <View style={styles.gridEliteBadge}>
              <Text style={styles.gridEliteBadgeText}>⭐</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.gridContent}>
          {/* Price */}
          <Text style={styles.price} numberOfLines={1}>
            {formatPrice(ad.price, ad.currency)}
          </Text>

          {/* Title */}
          <Text style={styles.titleGrid} numberOfLines={2}>
            {ad.title}
          </Text>

          {/* Info pills — year, km, rooms etc */}
          {infoItems.length > 0 && (
            <View style={styles.gridInfoRow}>
              {infoItems.slice(0, 2).map((item, i) => (
                <View key={i} style={styles.gridInfoPill}>
                  <Text style={styles.gridInfoPillText}>
                    {item.icon} {item.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Location */}
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {ad.location.name}
          </Text>

          {/* Time */}
          <Text style={styles.timeText}>
            {formatTime(ad.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── LIST VARIANT — matches OLX reference design ───────────────────────────
  return (
    <TouchableOpacity
      style={[styles.listCard, ad.isElite && styles.eliteCard]}
      onPress={onPress}
      activeOpacity={0.88}>

      {/* Elite badge */}
      {ad.isElite && (
        <View style={styles.eliteHeader}>
          <Text style={styles.eliteHeaderText}>⭐ Elite</Text>
        </View>
      )}

      {/* Full width image on top */}
      <View style={styles.listImageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.listImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.listImage, styles.noImageBox]}>
            <Text style={styles.noImageIcon}>🖼️</Text>
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
        <HeartBtn style={styles.heartList} />
        {ad.images && ad.images.length > 1 && (
          <View style={styles.imgCountBadge}>
            <Text style={styles.imgCountText}>🖼 {ad.images.length}</Text>
          </View>
        )}
      </View>

      {/* Card content below image */}
      <View style={styles.listContent}>
        {/* Price */}
        <Text style={styles.price}>
          {formatPrice(ad.price, ad.currency)}
        </Text>

        {/* Title */}
        <Text style={styles.titleList} numberOfLines={2}>
          {ad.title}
        </Text>

        {/* Info row — year, fuel, km etc */}
        {infoItems.length > 0 && (
          <View style={styles.infoRow}>
            {infoItems.slice(0, 4).map((item, i) => (
              <View key={i} style={styles.infoPill}>
                <Text style={styles.infoPillText}>
                  {item.icon} {item.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Location + time */}
        <View style={styles.metaRow}>
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {ad.location.name}
          </Text>
          <Text style={styles.timeText}>{formatTime(ad.timestamp)}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={handleChat}
            activeOpacity={0.75}>
            <Text style={styles.chatBtnText}>💬 {t('common.chat')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.75}>
            <Text style={styles.callBtnText}>📞 {t('common.call')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ── Grid ───────────────────────────────────────────────────────────────────
  gridCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridEliteBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.elite,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  gridEliteBadgeText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '700',
  },
  heartGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  gridContent: {
    padding: Spacing.sm,
    gap: 3,
  },
  titleGrid: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
    marginBottom: 3,
  },
gridInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginVertical: 2,
  },
  gridInfoPill: {
    backgroundColor: Colors.background,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridInfoPillText: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoInline: {
    fontSize: 10,
    color: Colors.textSecondary,
  },

  // ── List ───────────────────────────────────────────────────────────────────
  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  eliteCard: {
    borderWidth: 1.5,
    borderColor: Colors.elite,
  },
  eliteHeader: {
    backgroundColor: Colors.eliteBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.elite,
  },
  eliteHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B8860B',
  },
  listImageContainer: {
    position: 'relative',
    width: '100%',
  },
  listImage: {
    width: '100%',
    height: 200,
  },
  heartList: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 3,
  },
  imgCountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imgCountText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  titleList: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  infoPill: {
    backgroundColor: Colors.background,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  chatBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chatBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  callBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  callBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Shared ─────────────────────────────────────────────────────────────────
  noImageBox: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  noImageText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  heartIcon: {
    fontSize: 18,
    color: Colors.textTertiary,
  },
  heartSaved: {
    color: '#E03C31',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 11,
    color: Colors.textTertiary,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});