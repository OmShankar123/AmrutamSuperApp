import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';

import { useLanguage } from '@/core/localization/useLanguage';
import type { RootStackParamList } from '@/navigation';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import { useDoctorDetail } from '../hooks/useDoctors';

type DoctorDetailRouteProp = RouteProp<RootStackParamList, typeof NAVIGATION.DOCTOR_DETAIL>;

export function DoctorDetailScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const route = useRoute<DoctorDetailRouteProp>();
  const { doctorId } = route.params;

  const { data: doctor, isLoading, isError, refetch } = useDoctorDetail(doctorId);

  if (isLoading) {
    return (
      <ScreenWrapper withTopInset={false}>
        <Header showBack title={t('consultation.doctorDetails', 'Doctor Profile')} />
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !doctor) {
    return (
      <ScreenWrapper withTopInset={false}>
        <Header showBack title={t('consultation.doctorDetails', 'Doctor Profile')} />
        <View style={styles.centered}>
          <Typography style={styles.errorText} variant="error">
            {t('common.error', 'Could not load doctor details.')}
          </Typography>
          <Button onPress={() => refetch()} title={t('common.retry', 'Retry')} variant="primary" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header showBack subtitle={doctor.specialization} title={doctor.name} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image
            cachePolicy="memory-disk"
            contentFit="cover"
            source={{ uri: doctor.avatarUrl }}
            style={styles.avatar}
            transition={200}
          />
          <View style={styles.nameSection}>
            <View style={styles.nameRow}>
              <Typography variant="h3">{doctor.name}</Typography>
              <Ionicons color={theme.colors.primary} name="checkmark-circle" size={ms(16)} />
            </View>
            <Typography style={styles.title} variant="bodySmallSemiBold">
              {doctor.title}
            </Typography>
            <View style={styles.clinicRow}>
              <Ionicons color={theme.colors.textSecondary} name="location-outline" size={ms(12)} />
              <Typography style={styles.clinicName} variant="caption">
                {doctor.clinicName}, {doctor.city}
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Typography variant="h3">
              {doctor.experienceYears}+ {t('common.years', 'Yrs')}
            </Typography>
            <Typography style={styles.statLabel} variant="caption">
              {t('common.experience', 'Experience')}
            </Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <View style={styles.ratingBoxRow}>
              <Ionicons color={theme.colors.secondary} name="star" size={ms(14)} />
              <Typography variant="h3">{doctor.rating}</Typography>
            </View>
            <Typography style={styles.statLabel} variant="caption">
              {doctor.reviewCount} {t('common.reviews', 'Reviews')}
            </Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Typography style={styles.statPrice} variant="price">
              ₹{doctor.consultationFee}
            </Typography>
            <Typography style={styles.statLabel} variant="caption">
              {t('consultation.perSession', 'Per Session')}
            </Typography>
          </View>
        </View>

        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('consultation.aboutDoctor', 'About Doctor')}
          </Typography>
          <Typography style={styles.bioText} variant="body">
            {doctor.bio}
          </Typography>
        </View>

        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('consultation.specializationEducation', 'Specialization & Qualifications')}
          </Typography>
          <View style={styles.chipsWrap}>
            <Badge label={`🌿 ${doctor.specialization}`} variant="success" />
            {doctor.qualifications.map((q: string) => (
              <Badge key={q} label={`🎓 ${q}`} variant="neutral" />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('consultation.languagesSpoken', 'Languages')}
          </Typography>
          <View style={styles.langRow}>
            <Ionicons color={theme.colors.primary} name="chatbubbles-outline" size={ms(16)} />
            <Typography variant="body">{doctor.languages.join(' • ')}</Typography>
          </View>
        </View>

        <View style={styles.section}>
          <Typography style={styles.sectionHeading} variant="h3">
            {t('consultation.clinicInfo', 'Clinic Information')}
          </Typography>
          <View style={styles.clinicCard}>
            <Typography variant="bodySemiBold">{doctor.clinicName}</Typography>
            <Typography style={styles.clinicAddress} variant="bodySmall">
              {t(
                'consultation.clinicAddress',
                'Ayurvedic Wellness Ayurvedic Wellness & Consultation Wing, {doctor.city} Consultation Wing, {{city}}',
                { city: doctor.city },
              )}
            </Typography>
            <View style={styles.timeRow}>
              <Ionicons color={theme.colors.primary} name="time-outline" size={ms(14)} />
              <Typography style={styles.clinicHours} variant="bodySmallSemiBold">
                {t('consultation.clinicHours', 'Mon - Sat: 09:00 AM - 08:00 PM')}
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Inset Protection */}
      <View style={styles.bottomBar}>
        <View style={styles.feeContainer}>
          <Typography style={styles.bottomFeeLabel} variant="caption">
            {t('consultation.consultationFee', 'Consultation Fee')}
          </Typography>
          <Typography style={styles.bottomFeeValue} variant="price">
            ₹{doctor.consultationFee}
          </Typography>
        </View>
        <Button
          onPress={() => navigate(NAVIGATION.SLOT_BOOKING, { doctorId: doctor.id })}
          style={styles.bookBtn}
          title={t('consultation.bookAppointment', 'Book Appointment')}
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(120),
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  avatar: {
    width: ms(84),
    height: ms(84),
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  nameSection: {
    flex: 1,
    marginLeft: ms(14),
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  title: {
    color: theme.colors.primary,
    marginTop: ms(2),
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    marginTop: ms(4),
  },
  clinicName: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: ms(12),
    marginTop: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    boxShadow: theme.shadows.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  ratingBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
  },
  statLabel: {
    marginTop: ms(2),
  },
  statPrice: {
    fontSize: ms(16),
  },
  statDivider: {
    width: 1,
    height: ms(22),
    backgroundColor: theme.colors.border,
  },
  section: {
    marginTop: ms(18),
  },
  sectionHeading: {
    marginBottom: ms(8),
  },
  bioText: {
    lineHeight: ms(20),
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
  clinicCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  clinicAddress: {
    marginTop: ms(2),
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginTop: ms(6),
  },
  clinicHours: {
    color: theme.colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: Math.max(rt.insets.bottom, ms(16)),
    boxShadow: theme.shadows.md,
  },
  feeContainer: {
    flex: 1,
    marginRight: ms(12),
  },
  bottomFeeLabel: {
    color: theme.colors.textSecondary,
    marginBottom: ms(2),
  },
  bottomFeeValue: {
    fontSize: ms(18),
  },
  bookBtn: {
    minWidth: ms(160),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ms(24),
  },
  errorText: {
    marginBottom: ms(12),
  },
}));
