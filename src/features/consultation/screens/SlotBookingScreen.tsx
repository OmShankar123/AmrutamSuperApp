import React, { useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

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
  const { doctorId } = route.params;
  const { t } = useLanguage();
  const dateListRef = useRef<FlatList>(null);

  const { data: doctor } = useDoctorDetail(doctorId);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const { data: slots, isLoading: loadingSlots } = useDoctorSlots(doctorId, selectedDate);
  const bookMutation = useBookSlot();
  const { sendLocalNotification, scheduleAppointmentReminder } = usePushNotifications();
  const isBooking = bookMutation.isPending;

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
    if (!doctor || !selectedSlot) {
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
      const createdBooking = await bookMutation.mutateAsync({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        slotId: selectedSlot.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientAge: parseInt(patientAge, 10) || 30,
        symptoms: symptoms.trim() || t('consultation.generalConsultation', 'General Consultation'),
        consultationFee: doctor.consultationFee,
      });

      showSuccessToast(
        t('consultation.bookingConfirmedToast', 'Appointment booked with {{name}}', {
          name: doctor.name,
        }),
        t('consultation.confirmed', 'Booking Confirmed'),
      );

      // Trigger instant consultation confirmation push notification
      await sendLocalNotification(
        `🌿 Consultation Confirmed with Dr. ${doctor.name}`,
        `Your appointment for ${selectedSlot.time} on ${selectedSlot.date} has been confirmed. Tap to view receipt.`,
        { bookingId: createdBooking.id, type: 'consultation_booked' },
      );

      // Schedule 5-minute pre-appointment reminder
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
          reminderDate.getTime() > Date.now() ? reminderDate : new Date(Date.now() + 15 * 1000); // 15-second demo fallback if booking current slot

        await scheduleAppointmentReminder(
          `⏰ Upcoming Consultation in 5 Minutes`,
          `Your Ayurvedic consultation with Dr. ${doctor.name} starts at ${selectedSlot.time}. Please be ready.`,
          targetDate,
          { bookingId: createdBooking.id, doctorId: doctor.id, type: 'consultation_5min_reminder' },
        );
      } catch (err) {
        console.warn('Failed to schedule 5-minute reminder:', err);
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

      <ScrollView
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

        {/* Extracted Slot Selection Component */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.selectTimeSlot', 'Select Time Slot')}
        </Typography>
        <SlotPicker
          isLoading={loadingSlots}
          onSelectSlot={setSelectedSlot}
          selectedSlot={selectedSlot}
          slots={slots}
        />

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

      {/* Sticky Confirm Button */}
      <View style={styles.footer}>
        <Button
          disabled={!selectedSlot || !patientName.trim() || !patientPhone.trim()}
          isLoading={isBooking}
          leftIcon={
            <Ionicons
              color={theme.colors.textInverse}
              name="shield-checkmark-outline"
              size={ms(18)}
            />
          }
          onPress={handleConfirmBooking}
          style={styles.confirmBtn}
          title={
            selectedSlot
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
