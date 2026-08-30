import React from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { useNetworkStore } from '@/core/api/services/syncManager';
import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { resetAndNavigate } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import { useMyBookings } from '../hooks/useDoctors';

type BookingConfirmationRouteProp = RouteProp<
  RootStackParamList,
  typeof NAVIGATION.BOOKING_CONFIRMATION
>;

export function BookingConfirmationScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const route = useRoute<BookingConfirmationRouteProp>();
  const { bookingId } = route.params;
  const { t } = useLanguage();
  const isConnected = useNetworkStore((s) => s.isConnected);

  const { data: bookings } = useMyBookings();
  const booking = bookings?.find((b) => b.id === bookingId) ?? bookings?.[0];

  const isOfflineQueued =
    !isConnected ||
    Boolean(booking?.id && (booking.id.startsWith('offline_') || booking.id.startsWith('book_offline_')));

  return (
    <ScreenWrapper withBottomInset withHorizontalPadding={false} withTopInset>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(rt.insets.bottom, ms(20)) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.iconCircle, isOfflineQueued && styles.offlineIconCircle]}>
            <Ionicons
              color={isOfflineQueued ? theme.colors.warning : theme.colors.primary}
              name={isOfflineQueued ? 'cloud-offline-outline' : 'checkmark-circle'}
              size={ms(44)}
            />
          </View>

          <Typography variant="h1">
            {isOfflineQueued
              ? t('consultation.bookingSavedOffline', 'Booking Saved Offline!')
              : t('consultation.appointmentConfirmed', 'Appointment Confirmed!')}
          </Typography>
          <Typography style={styles.subheading} variant="bodySmall">
            {isOfflineQueued
              ? t(
                  'consultation.offlineQueueSub',
                  'Your consultation request is securely queued on this device and will sync automatically once internet returns.',
                )
              : t(
                  'consultation.confirmationSub',
                  'Your consultation request has been registered in the Amrutam Ayurvedic network.',
                )}
          </Typography>

          {isOfflineQueued && (
            <View style={styles.offlineStatusPill}>
              <Badge label={t('consultation.pendingSync', 'PENDING SYNC • OFFLINE')} variant="warning" />
            </View>
          )}

          {booking && (
            <View style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Typography style={styles.receiptLabel} variant="caption">
                  {t('consultation.doctor', 'Doctor')}
                </Typography>
                <Typography variant="bodySmallSemiBold">{booking.doctorName}</Typography>
              </View>
              <View style={styles.receiptRow}>
                <Typography style={styles.receiptLabel} variant="caption">
                  {t('consultation.specialization', 'Specialization')}
                </Typography>
                <Typography variant="bodySmallSemiBold">{booking.specialization}</Typography>
              </View>
              <View style={styles.receiptRow}>
                <Typography style={styles.receiptLabel} variant="caption">
                  {t('consultation.dateTime', 'Date & Time')}
                </Typography>
                <Typography variant="bodySmallSemiBold">
                  {booking.date} at {booking.time}
                </Typography>
              </View>
              <View style={styles.receiptRow}>
                <Typography style={styles.receiptLabel} variant="caption">
                  {t('consultation.patient', 'Patient')}
                </Typography>
                <Typography variant="bodySmallSemiBold">
                  {booking.patientName} ({booking.patientAge}y)
                </Typography>
              </View>
              <View style={styles.receiptRow}>
                <Typography style={styles.receiptLabel} variant="caption">
                  {t('consultation.bookingId', 'Booking ID')}
                </Typography>
                <Typography style={styles.bookingIdText} variant="bodySmallSemiBold">
                  {booking.id}
                </Typography>
              </View>
              <View style={[styles.receiptRow, styles.totalRow]}>
                <Typography variant="h3">{t('consultation.feePaid', 'Fee Paid')}</Typography>
                <Typography variant="price">₹{booking.consultationFee}</Typography>
              </View>
            </View>
          )}

          <View style={[styles.tipsBox, isOfflineQueued && styles.offlineTipsBox]}>
            <View style={styles.tipsHeaderRow}>
              <Ionicons
                color={isOfflineQueued ? theme.colors.warning : theme.colors.primaryDark}
                name={isOfflineQueued ? 'shield-checkmark-outline' : 'information-circle-outline'}
                size={ms(16)}
              />
              <Typography
                style={[styles.tipsHeading, isOfflineQueued && styles.offlineTipsHeading]}
                variant="label"
              >
                {isOfflineQueued
                  ? t('consultation.offlineSyncActive', 'Automatic Sync Active')
                  : t('consultation.preConsultationTips', 'Pre-Consultation Instructions')}
              </Typography>
            </View>
            <Typography
              style={[styles.tipsBody, isOfflineQueued && styles.offlineTipsBody]}
              variant="caption"
            >
              {isOfflineQueued
                ? t(
                    'consultation.offlineSyncActiveSub',
                    'Zero data loss guarantee: You do not need to repeat this booking. When online, our sync manager will confirm your slot in the background.',
                  )
                : t(
                    'consultation.tipsBody',
                    'Keep your stomach light before the pulse evaluation.\nUpload your past health records in the Health Records tab.',
                  )}
            </Typography>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            leftIcon={
              <Ionicons color={theme.colors.textInverse} name="home-outline" size={ms(18)} />
            }
            onPress={() => resetAndNavigate(NAVIGATION.MAIN_TABS)}
            title={t('consultation.backToDoctors', 'Back to Doctors')}
            variant="primary"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ms(20),
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingTop: ms(16),
  },
  iconCircle: {
    width: ms(68),
    height: ms(68),
    borderRadius: ms(34),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ms(12),
  },
  offlineIconCircle: {
    backgroundColor: theme.colors.warningLight,
  },
  subheading: {
    textAlign: 'center',
    marginTop: ms(4),
    lineHeight: ms(19),
    paddingHorizontal: ms(10),
  },
  offlineStatusPill: {
    marginTop: ms(12),
  },
  receiptCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginTop: ms(16),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ms(6),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceElevated,
  },
  receiptLabel: {
    color: theme.colors.textSecondary,
  },
  bookingIdText: {
    fontFamily: 'Courier',
    color: theme.colors.primary,
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: ms(8),
    alignItems: 'center',
  },
  tipsBox: {
    width: '100%',
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.md,
    padding: ms(12),
    marginTop: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  offlineTipsBox: {
    backgroundColor: theme.colors.warningLight,
    borderColor: theme.colors.warning,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginBottom: ms(3),
  },
  tipsHeading: {
    color: theme.colors.primaryDark,
  },
  offlineTipsHeading: {
    color: theme.colors.warning,
  },
  tipsBody: {
    color: theme.colors.primary,
    lineHeight: ms(17),
  },
  offlineTipsBody: {
    color: theme.colors.textSecondary,
  },
  buttonGroup: {
    width: '100%',
    marginTop: ms(20),
    paddingBottom: ms(8),
  },
}));
