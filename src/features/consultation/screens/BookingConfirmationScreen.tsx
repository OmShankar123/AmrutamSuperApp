import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { resetAndNavigate } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
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
  const { theme } = useUnistyles();
  const route = useRoute<BookingConfirmationRouteProp>();
  const { bookingId } = route.params;
  const { t } = useLanguage();

  const { data: bookings } = useMyBookings();
  const booking = bookings?.find((b) => b.id === bookingId) ?? bookings?.[0];

  return (
    <ScreenWrapper style={styles.container} withBottomInset withTopInset>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons color={theme.colors.primary} name="checkmark-circle" size={ms(44)} />
        </View>

        <Typography variant="h1">
          {t('consultation.appointmentConfirmed', 'Appointment Confirmed!')}
        </Typography>
        <Typography style={styles.subheading} variant="bodySmall">
          {t(
            'consultation.confirmationSub',
            'Your consultation request has been registered in the Amrutam Ayurvedic network.',
          )}
        </Typography>

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

        <View style={styles.tipsBox}>
          <View style={styles.tipsHeaderRow}>
            <Ionicons
              color={theme.colors.primaryDark}
              name="information-circle-outline"
              size={ms(16)}
            />
            <Typography style={styles.tipsHeading} variant="label">
              {t('consultation.preConsultationTips', 'Pre-Consultation Instructions')}
            </Typography>
          </View>
          <Typography style={styles.tipsBody} variant="caption">
            {t(
              'consultation.tipsBody',
              'Keep your stomach light before the pulse evaluation.\nUpload your past health records in the Health Records tab.',
            )}
          </Typography>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          leftIcon={<Ionicons color={theme.colors.textInverse} name="home-outline" size={ms(18)} />}
          onPress={() => resetAndNavigate(NAVIGATION.MAIN_TABS)}
          title={t('consultation.backToDoctors', 'Back to Doctors')}
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: ms(20),
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingTop: ms(24),
  },
  iconCircle: {
    width: ms(72),
    height: ms(72),
    borderRadius: ms(36),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ms(14),
  },
  subheading: {
    textAlign: 'center',
    marginTop: ms(6),
    lineHeight: ms(19),
    paddingHorizontal: ms(10),
  },
  receiptCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginTop: ms(20),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ms(7),
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
    paddingTop: ms(10),
    alignItems: 'center',
  },
  tipsBox: {
    width: '100%',
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.md,
    padding: ms(14),
    marginTop: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginBottom: ms(4),
  },
  tipsHeading: {
    color: theme.colors.primaryDark,
  },
  tipsBody: {
    color: theme.colors.primary,
    lineHeight: ms(17),
  },
  buttonGroup: {
    width: '100%',
    paddingBottom: ms(16),
  },
}));
