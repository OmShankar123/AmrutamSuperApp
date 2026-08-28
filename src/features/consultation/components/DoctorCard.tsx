import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { useLanguage } from '@/core/localization/useLanguage';
import { Badge } from '@/shared/components/Badge';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import type { Doctor } from '../types';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: (doctor: Doctor) => void;
}

export const DOCTOR_CARD_HEIGHT = ms(140);

export const DoctorCard = memo(function DoctorCard({
  doctor,
  onPress,
}: DoctorCardProps): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();

  return (
    <Pressable
      accessibilityHint="Navigates to doctor details and slot booking"
      accessibilityLabel={`${doctor.name}, ${doctor.specialization}, ${doctor.experienceYears} years experience`}
      accessibilityRole="button"
      onPress={() => onPress(doctor)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        source={{ uri: doctor.avatarUrl }}
        style={styles.avatar}
        transition={200}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Typography numberOfLines={1} style={styles.name} variant="h3">
            {doctor.name}
          </Typography>
          {doctor.isAvailableToday && (
            <Badge label={t('common.today', 'Today')} variant="success" />
          )}
        </View>

        <Typography numberOfLines={1} style={styles.specialization} variant="bodySmallSemiBold">
          {doctor.specialization} • {doctor.experienceYears} {t('common.yrsExp', 'yrs exp')}
        </Typography>

        <View style={styles.clinicRow}>
          <Ionicons color={theme.colors.textSecondary} name="location-outline" size={ms(12)} />
          <Typography numberOfLines={1} style={styles.clinic} variant="caption">
            {doctor.clinicName}, {doctor.city}
          </Typography>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.ratingRow}>
            <Ionicons color={theme.colors.secondary} name="star" size={ms(13)} />
            <Typography style={styles.ratingText} variant="bodySmallSemiBold">
              {doctor.rating}
            </Typography>
            <Typography style={styles.reviewsText} variant="caption">
              ({doctor.reviewCount})
            </Typography>
          </View>
          <Typography variant="price">₹{doctor.consultationFee}</Typography>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create((theme) => ({
  card: {
    height: DOCTOR_CARD_HEIGHT,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(12),
    marginVertical: ms(6),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  avatar: {
    width: ms(84),
    height: '100%',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  content: {
    flex: 1,
    marginLeft: ms(12),
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    marginRight: ms(6),
  },
  specialization: {
    color: theme.colors.primary,
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
  },
  clinic: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: ms(3),
    marginRight: ms(4),
  },
  reviewsText: {
    color: theme.colors.textTertiary,
  },
}));
