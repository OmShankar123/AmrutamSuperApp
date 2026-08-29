import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

import { useBookSlot, useDoctorDetail, useDoctorSlots } from '../hooks/useDoctors';
import type { Slot } from '../types';

type SlotBookingRouteProp = RouteProp<RootStackParamList, typeof NAVIGATION.SLOT_BOOKING>;

export function SlotBookingScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const route = useRoute<SlotBookingRouteProp>();
  const { doctorId } = route.params;
  const { t } = useLanguage();

  const { data: doctor } = useDoctorDetail(doctorId);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const { data: slots, isLoading: loadingSlots } = useDoctorSlots(doctorId, selectedDate);
  const bookMutation = useBookSlot();
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

  // Group slots by timeOfDay
  const morningSlots = useMemo(
    () => slots?.filter((s) => s.timeOfDay === 'Morning') ?? [],
    [slots],
  );
  const afternoonSlots = useMemo(
    () => slots?.filter((s) => s.timeOfDay === 'Afternoon') ?? [],
    [slots],
  );
  const eveningSlots = useMemo(
    () => slots?.filter((s) => s.timeOfDay === 'Evening') ?? [],
    [slots],
  );

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

      navigate(NAVIGATION.BOOKING_CONFIRMATION, { bookingId: createdBooking.id });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        t('consultation.bookingFailed', 'Could not complete booking.');
      showErrorToast(errorMsg, t('consultation.bookingError', 'Booking Error'));
    }
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header
        showClose
        subtitle={doctor ? `Dr. ${doctor.name} • ₹${doctor.consultationFee}` : undefined}
        title={t('consultation.bookAppointment', 'Book Appointment')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector Row */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.selectDate', 'Select Date')}
        </Typography>
        <ScrollView
          contentContainerStyle={styles.dateScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {availableDates.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <TouchableOpacity
                accessibilityLabel={`${item.dayName} ${item.monthName} ${item.dayNum}`}
                accessibilityRole="button"
                key={item.iso}
                onPress={() => {
                  setSelectedDate(item.iso);
                  setSelectedSlot(null);
                }}
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
          })}
        </ScrollView>

        {/* Time Slot Selection */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.selectTimeSlot', 'Select Time Slot')}
        </Typography>

        {loadingSlots ? (
          <View style={styles.slotsLoader}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Typography color={theme.colors.textSecondary} variant="caption">
              {t('consultation.checkingSlots', 'Checking available slots...')}
            </Typography>
          </View>
        ) : (
          <View style={styles.slotsContainer}>
            {morningSlots.length > 0 && (
              <View style={styles.timeSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons color={theme.colors.primary} name="sunny-outline" size={ms(16)} />
                  <Typography style={styles.timeSectionLabel} variant="label">
                    {t('consultation.morning', 'Morning')}
                  </Typography>
                </View>
                <View style={styles.slotsGrid}>
                  {morningSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isUnavailable = slot.isBooked || slot.isExpired;
                    return (
                      <TouchableOpacity
                        accessibilityLabel={`${slot.time}, ${slot.isExpired ? 'Expired' : slot.isBooked ? 'Booked' : 'Available'}`}
                        accessibilityRole="button"
                        disabled={isUnavailable}
                        key={slot.id}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          isUnavailable && styles.slotBooked,
                          isSelected && styles.slotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            isUnavailable && styles.slotTextBooked,
                            isSelected && styles.slotTextSelected,
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {afternoonSlots.length > 0 && (
              <View style={styles.timeSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons
                    color={theme.colors.primary}
                    name="partly-sunny-outline"
                    size={ms(16)}
                  />
                  <Typography style={styles.timeSectionLabel} variant="label">
                    {t('consultation.afternoon', 'Afternoon')}
                  </Typography>
                </View>
                <View style={styles.slotsGrid}>
                  {afternoonSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isUnavailable = slot.isBooked || slot.isExpired;
                    return (
                      <TouchableOpacity
                        accessibilityLabel={`${slot.time}, ${slot.isExpired ? 'Expired' : slot.isBooked ? 'Booked' : 'Available'}`}
                        accessibilityRole="button"
                        disabled={isUnavailable}
                        key={slot.id}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          isUnavailable && styles.slotBooked,
                          isSelected && styles.slotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            isUnavailable && styles.slotTextBooked,
                            isSelected && styles.slotTextSelected,
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {eveningSlots.length > 0 && (
              <View style={styles.timeSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons color={theme.colors.primary} name="moon-outline" size={ms(16)} />
                  <Typography style={styles.timeSectionLabel} variant="label">
                    {t('consultation.evening', 'Evening')}
                  </Typography>
                </View>
                <View style={styles.slotsGrid}>
                  {eveningSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    const isUnavailable = slot.isBooked || slot.isExpired;
                    return (
                      <TouchableOpacity
                        accessibilityLabel={`${slot.time}, ${slot.isExpired ? 'Expired' : slot.isBooked ? 'Booked' : 'Available'}`}
                        accessibilityRole="button"
                        disabled={isUnavailable}
                        key={slot.id}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          isUnavailable && styles.slotBooked,
                          isSelected && styles.slotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            isUnavailable && styles.slotTextBooked,
                            isSelected && styles.slotTextSelected,
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Patient Details Form */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.patientDetails', 'Patient Details')}
        </Typography>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Typography style={styles.inputLabel} variant="label">
              {t('consultation.fullName', 'Full Name')} *
            </Typography>
            <TextInput
              onChangeText={setPatientName}
              placeholder={t('consultation.fullNamePlaceholder', 'e.g. Ramesh Patel')}
              placeholderTextColor={theme.colors.textTertiary}
              style={styles.input}
              value={patientName}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Typography style={styles.inputLabel} variant="label">
                {t('consultation.phone', 'Phone')} *
              </Typography>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={setPatientPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
                value={patientPhone}
              />
            </View>

            <View style={[styles.inputGroup, { width: ms(80) }]}>
              <Typography style={styles.inputLabel} variant="label">
                {t('consultation.age', 'Age')}
              </Typography>
              <TextInput
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={setPatientAge}
                placeholder="32"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
                value={patientAge}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Typography style={styles.inputLabel} variant="label">
              {t('consultation.healthSymptoms', 'Health Concern / Symptoms')}
            </Typography>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setSymptoms}
              placeholder={t(
                'consultation.symptomsPlaceholder',
                'Describe symptoms, chronic conditions, or allergies...',
              )}
              placeholderTextColor={theme.colors.textTertiary}
              style={[styles.input, styles.textArea]}
              value={symptoms}
            />
          </View>
        </View>

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
  dateScroll: {
    gap: ms(10),
    paddingBottom: ms(8),
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
  slotsLoader: {
    paddingVertical: ms(20),
    alignItems: 'center',
    gap: ms(8),
  },
  slotsContainer: {
    gap: ms(14),
    marginBottom: ms(12),
  },
  timeSection: {
    gap: ms(8),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },
  timeSectionLabel: {
    color: theme.colors.textSecondary,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  slotChip: {
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  slotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotBooked: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  slotText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: ms(12),
    color: theme.colors.text,
  },
  slotTextSelected: {
    color: theme.colors.textInverse,
  },
  slotTextBooked: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    gap: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: ms(16),
  },
  inputGroup: {
    gap: ms(4),
  },
  inputLabel: {
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingHorizontal: ms(12),
    paddingVertical: ms(10),
    fontFamily: theme.fonts.regular,
    fontSize: ms(14),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    height: ms(70),
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: ms(12),
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
