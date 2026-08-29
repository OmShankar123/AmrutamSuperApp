import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { NAVIGATION } from '@/navigation/constants';
import { navigate } from '@/navigation/navigationRef';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Chip } from '@/shared/components/Chip';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal';
import { EmptyState } from '@/shared/components/EmptyState';
import { LanguageToggle } from '@/shared/components/LanguageToggle';
import { LoadingState } from '@/shared/components/LoadingState';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showSuccessToast } from '@/shared/utils/toast';

import { useCancelBooking, useMyBookings } from '../hooks/useDoctors';
import type { Booking } from '../types';

export function UpcomingConsultationsScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();
  const { data: bookings, isLoading, refetch, isRefetching } = useMyBookings();
  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (filterStatus === 'all') return bookings;
    return bookings.filter((b) => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    try {
      await cancelBooking(selectedBookingForCancel.id);
      showSuccessToast(
        t('consultation.cancelSuccess', 'Your consultation has been cancelled and slot released.'),
        t('consultation.cancelled', 'Cancelled'),
      );
    } catch {
      // Handled by toast error
    } finally {
      setSelectedBookingForCancel(null);
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const isConfirmed = item.status === 'confirmed';
    return (
      <View style={styles.card}>
        {/* Top Doctor Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.docAvatarCircle}>
            <Ionicons color={theme.colors.primary} name="person" size={ms(20)} />
          </View>

          <View style={styles.docInfo}>
            <Typography style={styles.docName} variant="h3">
              {item.doctorName}
            </Typography>
            <Typography style={styles.specText} variant="caption">
              {item.specialization}
            </Typography>
          </View>

          <Badge
            label={item.status.toUpperCase()}
            variant={isConfirmed ? 'success' : item.status === 'cancelled' ? 'error' : 'neutral'}
          />
        </View>

        <View style={styles.divider} />

        {/* Schedule & Timing Block */}
        <View style={styles.scheduleBlock}>
          <View style={styles.scheduleItem}>
            <Ionicons color={theme.colors.primary} name="calendar" size={ms(15)} />
            <Typography style={styles.scheduleVal} variant="bodySmallSemiBold">
              {item.date}
            </Typography>
          </View>
          <View style={styles.scheduleItem}>
            <Ionicons color={theme.colors.primary} name="time" size={ms(15)} />
            <Typography style={styles.scheduleVal} variant="bodySmallSemiBold">
              {item.time}
            </Typography>
          </View>
          <View style={styles.feeTag}>
            <Typography style={styles.feeText} variant="caption">
              ₹{item.consultationFee}
            </Typography>
          </View>
        </View>

        {/* Patient Details */}
        <View style={styles.patientRow}>
          <Typography style={styles.patientLabel} variant="caption">
            {t('consultation.patient', 'Patient')}:
          </Typography>
          <Typography style={styles.patientValue} variant="bodySmall">
            {item.patientName} ({item.patientAge}y) • {item.patientPhone}
          </Typography>
        </View>

        {item.symptoms ? (
          <View style={styles.symptomsBox}>
            <Ionicons
              color={theme.colors.textSecondary}
              name="chatbubble-ellipses-outline"
              size={ms(13)}
            />
            <Typography numberOfLines={2} style={styles.symptomsText} variant="caption">
              {item.symptoms}
            </Typography>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            leftIcon={
              <Ionicons color={theme.colors.primary} name="receipt-outline" size={ms(16)} />
            }
            onPress={() => navigate(NAVIGATION.BOOKING_CONFIRMATION, { bookingId: item.id })}
            size="sm"
            style={styles.actionBtn}
            title={t('consultation.viewReceipt', 'View Receipt')}
            variant="outline"
          />

          {isConfirmed && (
            <Button
              leftIcon={
                <Ionicons color={theme.colors.error} name="close-circle-outline" size={ms(16)} />
              }
              onPress={() => setSelectedBookingForCancel(item)}
              size="sm"
              style={styles.cancelBtn}
              title={t('consultation.cancel', 'Cancel Slot')}
              variant="outline"
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Typography variant="h2">
            {t('consultation.myConsultations', 'My Consultations')}
          </Typography>
          <Typography style={styles.headerSub} variant="caption">
            {bookings
              ? `${bookings.filter((b) => b.status === 'confirmed').length} Active Appointments`
              : 'Ayurvedic Care Appointments'}
          </Typography>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity
            accessibilityLabel="Developer Panel"
            onPress={() => navigate(NAVIGATION.DEV_PANEL)}
            style={styles.devBtn}
          >
            <Ionicons color={theme.colors.textSecondary} name="construct-outline" size={ms(17)} />
          </TouchableOpacity>
          <LanguageToggle />
        </View>
      </View>

      {/* Filter Tabs (All / Confirmed / Cancelled) */}
      <View style={styles.filterSection}>
        <ScrollView
          contentContainerStyle={styles.filterScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Chip
            icon={
              <Ionicons
                color={
                  filterStatus === 'all' ? theme.colors.textInverse : theme.colors.textSecondary
                }
                name="albums-outline"
                size={ms(14)}
              />
            }
            label="All Bookings"
            onPress={() => setFilterStatus('all')}
            selected={filterStatus === 'all'}
          />
          <Chip
            icon={
              <Ionicons
                color={
                  filterStatus === 'confirmed'
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary
                }
                name="checkmark-circle-outline"
                size={ms(14)}
              />
            }
            label="Upcoming Confirmed"
            onPress={() => setFilterStatus('confirmed')}
            selected={filterStatus === 'confirmed'}
          />
          <Chip
            icon={
              <Ionicons
                color={
                  filterStatus === 'cancelled'
                    ? theme.colors.textInverse
                    : theme.colors.textSecondary
                }
                name="close-circle-outline"
                size={ms(14)}
              />
            }
            label="Cancelled"
            onPress={() => setFilterStatus('cancelled')}
            selected={filterStatus === 'cancelled'}
          />
        </ScrollView>
      </View>

      {/* Consultation Bookings List */}
      {isLoading ? (
        <LoadingState message={t('common.loading', 'Loading your consultations...')} />
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(rt.insets.bottom, ms(20)) },
          ]}
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              actionTitle={t('consultation.findDoctor', 'Book a Consultation')}
              description={t(
                'consultation.noConsultationsSub',
                'Book an appointment with top Ayurvedic specialists.',
              )}
              iconName="calendar-outline"
              onAction={() => navigate(NAVIGATION.DOCTOR_LIST)}
              title={t('consultation.noConsultations', 'No Consultations Found')}
            />
          }
          refreshControl={
            <RefreshControl
              colors={[theme.colors.primary]}
              onRefresh={refetch}
              refreshing={isRefetching}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={renderBooking}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        confirmTitle="Yes, Cancel Slot"
        description={
          selectedBookingForCancel
            ? `Are you sure you want to cancel your consultation with ${selectedBookingForCancel.doctorName} on ${selectedBookingForCancel.date} at ${selectedBookingForCancel.time}? The slot will be released for other patients.`
            : ''
        }
        iconName="alert-circle-outline"
        isLoading={isCancelling}
        onCancel={() => setSelectedBookingForCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Appointment"
        confirmVariant="danger"
        visible={selectedBookingForCancel !== null}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingTop: ms(6),
    paddingBottom: ms(8),
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerSub: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  headerControls: {
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
  filterSection: {
    paddingVertical: ms(4),
    marginBottom: ms(4),
  },
  filterScroll: {
    paddingHorizontal: ms(16),
    gap: ms(6),
  },
  listContent: {
    padding: ms(16),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  docAvatarCircle: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    color: theme.colors.text,
  },
  specText: {
    color: theme.colors.primary,
    marginTop: ms(1),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: ms(12),
  },
  scheduleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    padding: ms(10),
    borderRadius: theme.radius.md,
    gap: ms(12),
    marginBottom: ms(10),
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
  },
  scheduleVal: {
    color: theme.colors.text,
  },
  feeTag: {
    marginLeft: 'auto',
    backgroundColor: theme.colors.successLight,
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(4),
  },
  feeText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: ms(6),
  },
  patientLabel: {
    color: theme.colors.textSecondary,
  },
  patientValue: {
    color: theme.colors.text,
  },
  symptomsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(6),
    backgroundColor: theme.colors.surfaceElevated,
    padding: ms(8),
    borderRadius: theme.radius.sm,
    marginBottom: ms(12),
  },
  symptomsText: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    marginTop: ms(4),
  },
  actionBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
  },
}));
