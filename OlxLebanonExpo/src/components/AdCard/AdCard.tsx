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

export const AdCard: React.FC<AdCardProps> = ({ ad, onPress, variant = 'grid' }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const saveAd = useAppStore(s => s.saveAd);
  const unsaveAd = useAppStore(s => s.unsaveAd);
  const isAdSaved = useAppStore(s => s.isAdSaved);
  const saved = isAdSaved(ad.id);

  const handleCall = () => {
    const phone = ad.extraFields?.phone as string;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Contact', 'Phone number not available for this ad.');
    }
  };

  const handleChat = () => {
    navigation.navigate('Home', { screen: 'ChatsTab' });
  };

  const handleSave = () => {
    if (saved) {
      unsaveAd(ad.id);
    } else {
      saveAd(ad);
    }
  };

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
        <View style={styles.listImageContainer}>
          {ad.images?.[0]?.url ? (
            <Image
              source={{ uri: ad.images[0].url }}
              style={styles.listImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.listImage, styles.noImage]}>
              <Text style={styles.noImageText}>📷</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={handleSave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
              {saved ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listContent}>
          <Text style={styles.price}>{formatPrice(ad.price, ad.currency)}</Text>
          <Text style={styles.title} numberOfLines={2}>{ad.title}</Text>
          <Text style={styles.location} numberOfLines={1}>📍 {ad.location.name}</Text>
          <Text style={styles.time}>{formatTime(ad.timestamp)}</Text>
          <View style={styles.listActions}>
            <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
              <Text style={styles.chatBtnText}>💬 {t('common.chat')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Text style={styles.callBtnText}>📞 {t('common.call')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.gridCard, { width: GRID_CARD_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.85}>
      {ad.images?.[0]?.url ? (
        <Image
          source={{ uri: ad.images[0].url }}
          style={styles.gridImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.gridImage, styles.noImage]}>
          <Text style={styles.noImageText}>📷</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.heartBtnGrid}
        onPress={handleSave}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.heartIcon, saved && styles.heartSaved]}>
          {saved ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
      <View style={styles.gridContent}>
        <Text style={styles.price}>{formatPrice(ad.price, ad.currency)}</Text>
        <Text style={styles.title} numberOfLines={2}>{ad.title}</Text>
        <Text style={styles.location} numberOfLines={1}>📍 {ad.location.name}</Text>
        <Text style={styles.time}>{formatTime(ad.timestamp)}</Text>
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
    elevation: 2,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gridImage: { width: '100%', height: 130 },
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
  gridContent: { padding: Spacing.sm },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  eliteCard: { borderWidth: 1.5, borderColor: Colors.elite },
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
  eliteBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  listImageContainer: { position: 'relative' },
  listImage: { width: 120, height: 130 },
  heartBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { flex: 1, padding: Spacing.sm, paddingTop: Spacing.md },
  listActions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  chatBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  chatBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  callBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  callBtnText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  noImage: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: { color: Colors.textTertiary, fontSize: 24 },
  heartIcon: { fontSize: 16, color: Colors.textTertiary },
  heartSaved: { color: '#E03C31' },
  price: { fontSize: 15, fontWeight: '700', color: Colors.primary, marginBottom: 2 },
  title: { ...Typography.body, color: Colors.textPrimary, marginBottom: 2 },
  location: { fontSize: 11, color: Colors.textTertiary, marginBottom: 2 },
  time: { fontSize: 10, color: Colors.textTertiary },
});