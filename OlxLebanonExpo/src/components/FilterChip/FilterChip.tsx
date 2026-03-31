import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../theme';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  hasDropdown?: boolean;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onPress,
  hasDropdown = false,
}) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.chipSelected]}
    onPress={onPress}
    activeOpacity={0.7}>
    <Text style={[styles.label, selected && styles.labelSelected]}>
      {label}
      {hasDropdown ? ' ∨' : ''}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  labelSelected: {
    color: Colors.white,
  },
});