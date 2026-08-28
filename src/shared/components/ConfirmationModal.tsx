import React, { type FC } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { ms } from '@/shared/utils/scale';

import { Button } from './Button';
import { Typography } from './Typography';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmTitle?: string;
  cancelTitle?: string;
  confirmVariant?: 'primary' | 'danger';
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: FC<ConfirmationModalProps> = ({
  visible,
  title,
  description,
  confirmTitle,
  cancelTitle,
  confirmVariant = 'primary',
  iconName = 'help-circle-outline',
  iconColor,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  const isDanger = confirmVariant === 'danger';
  const defaultIconColor = iconColor || (isDanger ? theme.colors.error : theme.colors.primary);

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Top Close Button */}
          <TouchableOpacity
            accessibilityLabel={t('common.cancel', 'Cancel')}
            onPress={onCancel}
            style={styles.closeBtn}
          >
            <Ionicons color={theme.colors.textSecondary} name="close" size={ms(20)} />
          </TouchableOpacity>

          {/* Icon Badge */}
          <View style={[styles.iconCircle, isDanger && styles.dangerIconCircle]}>
            <Ionicons color={defaultIconColor} name={iconName} size={ms(32)} />
          </View>

          {/* Content */}
          <Typography style={styles.title} variant="h2">
            {title}
          </Typography>
          <Typography style={styles.description} variant="bodySmall">
            {description}
          </Typography>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Button
              disabled={isLoading}
              onPress={onCancel}
              style={styles.actionBtn}
              title={cancelTitle || t('common.cancel', 'Cancel')}
              variant="secondary"
            />
            <Button
              isLoading={isLoading}
              onPress={onConfirm}
              style={styles.actionBtn}
              title={confirmTitle || t('common.confirm', 'Confirm')}
              variant={confirmVariant}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(24),
  },
  dialog: {
    width: '100%',
    maxWidth: ms(360),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: ms(24),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.lg,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: ms(16),
    right: ms(16),
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: ms(64),
    height: ms(64),
    borderRadius: ms(32),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ms(16),
    marginTop: ms(8),
  },
  dangerIconCircle: {
    backgroundColor: theme.colors.errorLight,
  },
  title: {
    textAlign: 'center',
    marginBottom: ms(8),
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    lineHeight: ms(18),
    marginBottom: ms(24),
    paddingHorizontal: ms(8),
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
}));
