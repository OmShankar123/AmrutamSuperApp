import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
import { TextField } from '@/shared/components/TextField';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showErrorToast } from '@/shared/utils/toast';

import { useBookSlot, useDoctorDetail, useDoctorSlots } from '../hooks/useDoctors';
import type { Slot } from '../types';

type SlotBookingRouteProp = RouteProp<RootStackParamList, typeof NAVIGATION.SLOT_BOOKING>;

export function SlotBookingScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const route = useRoute<SlotBookingRouteProp>();
  const { doctorId } = route.params;
  const { t } = useLanguage();

  const selectedDate = new Date().toISOString().split('T')[0];
  const { data: doctor } = useDoctorDetail(doctorId);
  const { data: slots, isLoading: loadingSlots } = useDoctorSlots(doctorId, selectedDate);
  const { mutate: bookSlot, isPending: isBooking } = useBookSlot();

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');

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

  const handleConfirmBooking = () => {
    if (!selectedSlot || !doctor) return;
    if (!patientName.trim() || !patientPhone.trim()) {
      showErrorToast(
        t('consultation.fillDetails', 'Please fill in patient details'),
        t('common.error', 'Error'),
      );
      return;
    }

    bookSlot(
      {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        slotId: selectedSlot.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        patientName,
        patientPhone,
        patientAge: parseInt(patientAge, 10) || 25,
        symptoms,
        consultationFee: doctor.consultationFee,
      },
      {
        onSuccess: (booking: any) => {
          navigate(NAVIGATION.BOOKING_CONFIRMATION, { bookingId: booking.id });
        },
        onError: (err: any) => {
          showErrorToast(
            err?.message || 'Could not complete booking',
            t('common.error', 'Booking Failed'),
          );
        },
      },
    );
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      {/* Global Consistent Header with Close Action */}
      <Header showClose title={t('consultation.selectSlot', 'Select Slot')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Summary Card */}
        {doctor && (
          <View style={styles.doctorSummary}>
            <View style={styles.doctorInfoRow}>
              <View style={styles.docAvatarCircle}>
                <Ionicons color={theme.colors.primary} name="medkit" size={ms(22)} />
              </View>
              <View style={styles.docTextWrap}>
                <Typography variant="h3">{doctor.name}</Typography>
                <Typography style={styles.specText} variant="bodySmall">
                  {doctor.specialization}
                </Typography>
              </View>
            </View>
            <View style={styles.feeBadge}>
              <Typography style={styles.feeText} variant="label">
                ₹{doctor.consultationFee}
              </Typography>
            </View>
          </View>
        )}

        {/* Slot Selection Section */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.availableSlots', 'Available Slots')}
        </Typography>

        {loadingSlots ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Typography style={styles.loadingText} variant="caption">
              {t('consultation.loadingSlots', 'Loading slots...')}
            </Typography>
          </View>
        ) : (
          <>
            {morningSlots.length > 0 && (
              <View style={styles.timeSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons color={theme.colors.secondary} name="sunny-outline" size={ms(16)} />
                  <Typography style={styles.timeSectionLabel} variant="label">
                    {t('consultation.morning', 'Morning')}
                  </Typography>
                </View>
                <View style={styles.slotsGrid}>
                  {morningSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <TouchableOpacity
                        accessibilityLabel={`${slot.time}, ${slot.isBooked ? 'Booked' : 'Available'}`}
                        accessibilityRole="button"
                        disabled={slot.isBooked}
                        key={slot.id}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          slot.isBooked && styles.slotBooked,
                          isSelected && styles.slotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            slot.isBooked && styles.slotTextBooked,
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
                    return (
                      <TouchableOpacity
                        accessibilityLabel={`${slot.time}, ${slot.isBooked ? 'Booked' : 'Available'}`}
                        accessibilityRole="button"
                        disabled={slot.isBooked}
                        key={slot.id}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          slot.isBooked && styles.slotBooked,
                          isSelected && styles.slotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            slot.isBooked && styles.slotTextBooked,
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
                  <Ionicons color={theme.colors.info} name="moon-outline" size={ms(16)} />
                  <Typography style={styles.timeSectionLabel} variant="label">
                    {t('consultation.evening', 'Evening')}
                  </Typography>
                </View>
                <View style={styles.slotsGrid}>
                  {eveningSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <TouchableOpacity
                        accessibilityLabel={`${slot.time}, ${slot.isBooked ? 'Booked' : 'Available'}`}
                        accessibilityRole="button"
                        disabled={slot.isBooked}
                        key={slot.id}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          slot.isBooked && styles.slotBooked,
                          isSelected && styles.slotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            slot.isBooked && styles.slotTextBooked,
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
          </>
        )}

        {/* Patient Details Form Section */}
        <Typography style={styles.sectionTitle} variant="h3">
          {t('consultation.patientInfo', 'Patient Information')}
        </Typography>

        <View style={styles.formCard}>
          <TextField
            label={t('consultation.fullName', 'Full Name')}
            leftIcon={
              <Ionicons color={theme.colors.textSecondary} name="person-outline" size={ms(18)} />
            }
            onChangeText={setPatientName}
            placeholder={t('consultation.patientNamePlaceholder', 'Enter patient name')}
            value={patientName}
          />

          <TextField
            keyboardType="phone-pad"
            label={t('consultation.phone', 'Phone Number')}
            leftIcon={
              <Ionicons color={theme.colors.textSecondary} name="call-outline" size={ms(18)} />
            }
            onChangeText={setPatientPhone}
            placeholder="+91 98765 43210"
            value={patientPhone}
          />

          <TextField
            keyboardType="number-pad"
            label={t('consultation.age', 'Age')}
            leftIcon={
              <Ionicons color={theme.colors.textSecondary} name="calendar-outline" size={ms(18)} />
            }
            onChangeText={setPatientAge}
            placeholder="e.g. 32"
            value={patientAge}
          />

          <TextField
            label={t('consultation.symptoms', 'Primary Health Concern / Symptoms')}
            multiline
            numberOfLines={3}
            onChangeText={setSymptoms}
            placeholder={t(
              'consultation.symptomsPlaceholder',
              'Describe symptoms, chronic conditions, or allergies...',
            )}
            value={symptoms}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar with Safe Inset */}
      <View style={styles.bottomBar}>
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
    paddingBottom: ms(120),
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: ms(14),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
    marginBottom: ms(16),
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    flex: 1,
  },
  docAvatarCircle: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTextWrap: {
    flex: 1,
  },
  specText: {
    color: theme.colors.primary,
    marginTop: ms(1),
  },
  feeBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: ms(10),
    paddingVertical: ms(5),
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feeText: {
    color: theme.colors.primaryDark,
  },
  sectionTitle: {
    marginTop: ms(8),
    marginBottom: ms(10),
  },
  loaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ms(20),
    gap: ms(8),
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  timeSection: {
    marginBottom: ms(14),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: ms(8),
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
    paddingVertical: ms(8),
    paddingHorizontal: ms(12),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: ms(76),
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
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
    fontFamily: theme.fonts.bold,
  },
  slotTextBooked: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: ms(16),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
    marginTop: ms(4),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: ms(20),
    paddingTop: ms(12),
    paddingBottom: Math.max(rt.insets.bottom, ms(16)),
    boxShadow: theme.shadows.md,
  },
  confirmBtn: {
    width: '100%',
  },
}));
