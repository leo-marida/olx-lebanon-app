import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onBack?: () => void;
  onFilterPress?: () => void;
  showBack?: boolean;
  editable?: boolean;
  onPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onBack,
  onFilterPress,
  showBack = false,
  editable = true,
  onPress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={onPress}
        activeOpacity={editable ? 1 : 0.7}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={t('common.search')}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⊟</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 12,
    color: Colors.textTertiary,
    padding: Spacing.xs,
  },
  filterBtn: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  filterIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
});