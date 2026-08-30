import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { useNetworkStore } from '@/core/api/services/syncManager';
import { useLanguage } from '@/core/localization/useLanguage';
import { usePushNotifications } from '@/core/notifications';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

import { PatientDetailsForm } from '../components/PatientDetailsForm';
import { SlotPicker } from '../components/SlotPicker';
import { useBookSlot, useDoctorDetail, useDoctorSlots } from '../hooks/useDoctors';
import type { Slot } from '../types';

type SlotBookingRouteProp = RouteProp<RootStackParamList, typeof NAVIGATION.SLOT_BOOKING>;

export function SlotBookingScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const route = useRoute<SlotBookingRouteProp>();
  const { doctorId, initialDoctor } = route.params;
  const { t } = useLanguage();
  const dateListRef = useRef<FlatList>(null);

  const { data: doctor } = useDoctorDetail(doctorId, initialDoctor);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('09:00 AM - 12:00 PM');

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const isConnected = useNetworkStore((s) => s.isConnected);
  const {
    data: slots,
    isLoading: loadingSlots,
  } = useDoctorSlots(doctorId, selectedDate);
  const bookMutation = useBookSlot();
  const { sendLocalNotification, scheduleAppointmentReminder } = usePushNotifications();
  const isBooking = bookMutation.isPending;

  const offlineQueueMode = !isConnected && (!slots || slots.length === 0);

  const offlineTimeWindows = useMemo(
    () => [
      {
        id: 'morning',
        label: t('consultation.morning', 'Morning'),
        time: '09:00 AM - 12:00 PM',
        icon: 'sunny-outline' as const,
      },
      {
        id: 'afternoon',
        label: t('consultation.afternoon', 'Afternoon'),
        time: '01:00 PM - 05:00 PM',
        icon: 'partly-sunny-outline' as const,
      },
      {
        id: 'evening',
        label: t('consultation.evening', 'Evening'),
        time: '06:00 PM - 08:00 PM',
        icon: 'moon-outline' as const,
      },
    ],
    [t],
  );

  // Next 7 days for date picker
  const availableDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName =
        i === 0 ? t('common.today', 'Today') : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dates.push({ iso, dayName, dayNum, monthName });
    }
    return dates;
  }, [t]);

  const handleSelectDate = (iso: string, index: number) => {
    setSelectedDate(iso);
    setSelectedSlot(null);
    dateListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const handleConfirmBooking = async () => {
    if (!doctor || (!selectedSlot && !offlineQueueMode)) {
      showErrorToast(
        t('consultation.selectSlotFirst', 'Please select an appointment time slot.'),
        t('consultation.slotRequired', 'Slot Required'),
      );
      return;
    }
    if (!patientName.trim()) {
      showErrorToast(
        t('consultation.enterPatientName', 'Please enter the patient name.'),
        t('consultation.nameRequired', 'Name Required'),
      );
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 8) {
      showErrorToast(
        t('consultation.enterValidPhone', 'Please enter a valid contact phone number.'),
        t('consultation.phoneRequired', 'Phone Required'),
      );
      return;
    }

    try {
      const bookingTime = selectedSlot ? selectedSlot.time : selectedTimeWindow;
      const createdBooking = await bookMutation.mutateAsync({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        slotId: selectedSlot?.id ?? `offline_slot_${Date.now()}`,
        date: selectedSlot?.date ?? selectedDate,
        time: bookingTime,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: parseInt(patientAge, 10) || 30,
        symptoms: symptoms.trim() || t('consultation.generalConsultation', 'General Consultation'),
        consultationFee: doctor.consultationFee,
      });

      showSuccessToast(
        offlineQueueMode
          ? t('consultation.bookingSavedOffline', 'Booking Saved Offline!')
          : t('consultation.bookingConfirmedToast', 'Appointment booked with {{name}}', {
              name: doctor.name,
            }),
        offlineQueueMode
          ? t('consultation.queued', 'Queued')
          : t('consultation.confirmed', 'Booking Confirmed'),
      );

      // Only send notifications when slot data is available (skip for offline queued bookings)
      if (selectedSlot) {
        await sendLocalNotification(
          t('consultation.notifConfirmedTitle', '🌿 Consultation Confirmed with {{name}}', {
            name: doctor.name,
          }),
          t(
            'consultation.notifConfirmedBody',
            'Your appointment for {{time}} on {{date}} has been confirmed. Tap to view receipt.',
            { time: selectedSlot.time, date: selectedSlot.date },
          ),
          { bookingId: createdBooking.id, type: 'consultation_booked' },
        );

        try {
          const timeParts = selectedSlot.time.split(' ');
          const timeStr = timeParts[0];
          const meridiem = timeParts[1];
          let [hours, minutes] = timeStr.split(':').map(Number);
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;

          const appointmentDate = new Date(selectedSlot.date);
          appointmentDate.setHours(hours, minutes || 0, 0, 0);
          const reminderDate = new Date(appointmentDate.getTime() - 5 * 60 * 1000);

          const targetDate =
            reminderDate.getTime() > Date.now() ? reminderDate : new Date(Date.now() + 15 * 1000);

          await scheduleAppointmentReminder(
            t('consultation.notifReminderTitle', '⏰ Upcoming Consultation in 5 Minutes'),
            t(
              'consultation.notifReminderBody',
              'Your Ayurvedic consultation with {{name}} starts at {{time}}. Please be ready.',
              { name: doctor.name, time: selectedSlot.time },
            ),
            targetDate,
            {
              bookingId: createdBooking.id,
              doctorId: doctor.id,
              type: 'consultation_5min_reminder',
            },
          );
        } catch (err) {
          console.warn('Failed to schedule 5-minute reminder:', err);
        }
      }

      navigate(NAVIGATION.BOOKING_CONFIRMATION, { bookingId: createdBooking.id });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('consultation.bookingFailed', 'Could not complete booking.');
      showErrorToast(errorMsg, t('consultation.bookingError', 'Booking Error'));
    }
  };

  const docDisplayName = doctor
    ? `${doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`} • ₹${doctor.consultationFee}`
    : undefined;

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header
        showClose
        subtitle={docDisplayName}
        title={t('consultation.bookAppointment', 'Book Appointment')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Date Selector Row with Auto-Centering FlatList */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.selectDate', 'Select Date')}
        </Typography>

        <FlatList
          contentContainerStyle={styles.dateScroll}
          data={availableDates}
          horizontal
          keyExtractor={(item) => item.iso}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              dateListRef.current?.scrollToIndex({
                index: info.index,
                viewPosition: 0.5,
                animated: true,
              });
            }, 100);
          }}
          ref={dateListRef}
          renderItem={({ item, index }) => {
            const isSelected = selectedDate === item.iso;
            return (
              <TouchableOpacity
                accessibilityLabel={`${item.dayName} ${item.monthName} ${item.dayNum}`}
                accessibilityRole="button"
                onPress={() => handleSelectDate(item.iso, index)}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                  {item.dayName}
                </Text>
                <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                  {item.dayNum}
                </Text>
                <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
                  {item.monthName}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          style={styles.dateListContainer}
        />

        {/* Slot Selection Component */}
        <Typography style={styles.sectionTitle} variant="h3">
          {offlineQueueMode
            ? t('consultation.selectPreferredTime', 'Preferred Time Window')
            : t('consultation.selectTimeSlot', 'Select Time Slot')}
        </Typography>

        {offlineQueueMode ? (
          <View style={styles.offlineSection}>
            <View style={styles.offlineSlotNotice}>
              <Ionicons color={theme.colors.warning} name="cloud-offline-outline" size={ms(20)} />
              <View style={{ flex: 1 }}>
                <Typography style={styles.offlineSlotTitle} variant="label">
                  {t('consultation.offlineQueueNoticeTitle', 'Offline Slot Queueing')}
                </Typography>
                <Typography style={styles.offlineSlotText} variant="caption">
                  {t(
                    'consultation.offlineQueueNoticeBody',
                    'Live slot availability cannot be verified offline. Select your preferred time window and your booking will be queued for automatic confirmation upon reconnection.',
                  )}
                </Typography>
              </View>
            </View>

            <View style={styles.timeWindowGrid}>
              {offlineTimeWindows.map((tw) => {
                const isSelected = selectedTimeWindow === tw.time;
                return (
                  <TouchableOpacity
                    key={tw.id}
                    onPress={() => setSelectedTimeWindow(tw.time)}
                    style={[styles.timeWindowCard, isSelected && styles.timeWindowCardSelected]}
                  >
                    <Ionicons
                      color={isSelected ? theme.colors.textInverse : theme.colors.primary}
                      name={tw.icon}
                      size={ms(18)}
                    />
                    <Typography
                      style={isSelected ? styles.timeWindowTextSelected : styles.timeWindowText}
                      variant="bodySmallSemiBold"
                    >
                      {tw.label}
                    </Typography>
                    <Typography
                      style={isSelected ? styles.timeWindowSubSelected : styles.timeWindowSub}
                      variant="caption"
                    >
                      {tw.time}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <SlotPicker
            isLoading={loadingSlots}
            onSelectSlot={setSelectedSlot}
            selectedSlot={selectedSlot}
            slots={slots}
          />
        )}

        {/* Extracted Patient Details Form Component */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.patientDetails', 'Patient Details')}
        </Typography>
        <PatientDetailsForm
          age={patientAge}
          name={patientName}
          onAgeChange={setPatientAge}
          onNameChange={setPatientName}
          onPhoneChange={setPatientPhone}
          onSymptomsChange={setSymptoms}
          phone={patientPhone}
          symptoms={symptoms}
        />

        {/* Pricing Summary Card */}
        {doctor && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Typography style={styles.summaryLabel} variant="bodySmall">
                {t('consultation.fee', 'Consultation Fee')}
              </Typography>
              <Typography variant="bodySemiBold">₹{doctor.consultationFee}</Typography>
            </View>
            <View style={styles.summaryRow}>
              <Typography style={styles.summaryLabel} variant="bodySmall">
                {t('consultation.bookingProtection', 'AYUSH Booking Protection')}
              </Typography>
              <Typography color={theme.colors.success} variant="bodySmallSemiBold">
                {t('common.free', 'FREE')}
              </Typography>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Typography variant="h3">{t('common.total', 'Total Payable')}</Typography>
              <Typography color={theme.colors.primary} variant="h2">
                ₹{doctor.consultationFee}
              </Typography>
            </View>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Confirm Button */}
      <View style={styles.footer}>
        <Button
          disabled={
            (!selectedSlot && !offlineQueueMode) ||
            !patientName.trim() ||
            !patientPhone.trim()
          }
          isLoading={isBooking}
          leftIcon={
            <Ionicons
              color={theme.colors.textInverse}
              name={offlineQueueMode ? 'cloud-offline-outline' : 'shield-checkmark-outline'}
              size={ms(18)}
            />
          }
          onPress={handleConfirmBooking}
          style={styles.confirmBtn}
          title={
            offlineQueueMode
              ? t('consultation.queueOfflineBooking', 'Queue Offline Booking')
              : selectedSlot
                ? `${t('consultation.confirmBooking', 'Confirm Booking')} (${selectedSlot.time})`
                : t('consultation.selectSlot', 'Select Slot')
          }
          variant="primary"
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(90),
  },
  sectionTitle: {
    marginBottom: ms(10),
    marginTop: ms(8),
  },
  offlineSection: {
    marginBottom: ms(8),
  },
  offlineSlotNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(10),
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.md,
    padding: ms(12),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  offlineSlotTitle: {
    color: theme.colors.warning,
    marginBottom: ms(2),
  },
  offlineSlotText: {
    color: theme.colors.textSecondary,
    lineHeight: ms(17),
  },
  timeWindowGrid: {
    gap: ms(8),
    marginBottom: ms(8),
  },
  timeWindowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: ms(10),
  },
  timeWindowCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeWindowText: {
    color: theme.colors.text,
  },
  timeWindowTextSelected: {
    color: theme.colors.textInverse,
  },
  timeWindowSub: {
    marginLeft: 'auto',
    color: theme.colors.textSecondary,
  },
  timeWindowSubSelected: {
    marginLeft: 'auto',
    color: theme.colors.textInverse,
  },
  dateListContainer: {
    marginBottom: ms(8),
  },
  dateScroll: {
    gap: ms(10),
    paddingRight: ms(16),
  },
  dateCard: {
    width: ms(65),
    height: ms(75),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  dateCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayName: {
    fontFamily: theme.fonts.regular,
    fontSize: ms(11),
    color: theme.colors.textSecondary,
    marginBottom: ms(2),
  },
  dayNameSelected: {
    color: theme.colors.textInverse,
  },
  dayNum: {
    fontFamily: theme.fonts.bold,
    fontSize: ms(18),
    color: theme.colors.text,
  },
  dayNumSelected: {
    color: theme.colors.textInverse,
  },
  monthName: {
    fontFamily: theme.fonts.regular,
    fontSize: ms(10),
    color: theme.colors.textTertiary,
  },
  monthNameSelected: {
    color: theme.colors.textInverse,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    gap: ms(8),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: ms(4),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: ms(16),
    paddingTop: ms(12),
    paddingBottom: Math.max(rt.insets.bottom, ms(16)),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    boxShadow: theme.shadows.md,
  },
  confirmBtn: {
    width: '100%',
  },
}));
