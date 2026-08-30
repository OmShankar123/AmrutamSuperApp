import React, { type FC, type ReactNode } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { ms } from '@/shared/utils/scale';

import { LanguageToggle } from './LanguageToggle';
import { Typography } from './Typography';

export interface SearchHeaderProps {
  title: string;
  subtitle?: string;
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  showDevTrigger?: boolean;
  rightAction?: ReactNode;
}

export const SearchHeader: FC<SearchHeaderProps> = ({
  title,
  subtitle,
  query,
  onQueryChange,
  placeholder,
  showDevTrigger = true,
  rightAction,
}) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      {/* Top Title & Controls Row */}
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Typography variant="h2">{title}</Typography>
          {subtitle && (
            <Typography style={styles.subtitle} variant="caption">
              {subtitle}
            </Typography>
          )}
        </View>

        <View style={styles.controlsRow}>
          {rightAction}
          {showDevTrigger && (
            <TouchableOpacity
              accessibilityLabel="Developer Panel"
              onPress={() => navigate(NAVIGATION.DEV_PANEL)}
              style={styles.devBtn}
            >
              <Ionicons color={theme.colors.textSecondary} name="construct-outline" size={ms(17)} />
            </TouchableOpacity>
          )}
          <LanguageToggle />
        </View>
      </View>

      {/* Unified Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons color={theme.colors.textSecondary} name="search-outline" size={ms(18)} />
        <TextInput
          accessibilityLabel={placeholder}
          clearButtonMode="while-editing"
          onChangeText={onQueryChange}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          style={styles.input}
          value={query}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => onQueryChange('')}>
            <Ionicons color={theme.colors.textTertiary} name="close-circle" size={ms(18)} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: ms(16),
    paddingTop: ms(6),
    paddingBottom: ms(4),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(8),
  },
  titleWrap: {
    flex: 1,
    marginRight: ms(8),
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  devBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: ms(22),
    paddingHorizontal: ms(12),
    height: ms(44),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: ms(14),
    color: theme.colors.text,
    marginLeft: ms(8),
    paddingVertical: 0,
  },
}));
