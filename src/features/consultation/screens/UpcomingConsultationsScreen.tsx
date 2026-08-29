import React, { useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
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
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

import { useCancelBooking, useMyBookings } from '../hooks/useDoctors';
import type { Booking } from '../types';

export function UpcomingConsultationsScreen(): React.JSX.Element {
  const { theme, rt } = useUnistyles();
  const { t } = useLanguage();
  const chipsListRef = useRef<FlatList>(null);

  const { data: bookings, isLoading, isError, refetch, isRefetching } = useMyBookings();
  const cancelMutation = useCancelBooking();

  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const isCancelling = cancelMutation.isPending;
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    if (filterStatus === 'all') return bookings;
    return bookings.filter((b: Booking) => b.status === filterStatus);
  }, [bookings, filterStatus]);

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    try {
      await cancelMutation.mutateAsync(selectedBookingForCancel.id);
      showSuccessToast(
        t('consultation.cancelledSuccess', 'Consultation slot has been cancelled.'),
        t('consultation.cancelled', 'Cancelled'),
      );
      setSelectedBookingForCancel(null);
    } catch {
      showErrorToast(
        t('consultation.cancelFailed', 'Could not cancel booking. Please try again.'),
        t('common.error', 'Error'),
      );
    }
  };

  const handleSelectChip = (status: 'all' | 'confirmed' | 'cancelled', index: number) => {
    setFilterStatus(status);
    chipsListRef.current?.scrollToIndex({
      index,
      viewPosition: 0.5,
      animated: true,
    });
  };

  const chipItems = useMemo(
    () => [
      {
        status: 'all' as const,
        label: t('consultation.allBookings', 'All Bookings'),
        icon: 'albums-outline' as const,
      },
      {
        status: 'confirmed' as const,
        label: t('consultation.upcomingConfirmed', 'Upcoming Confirmed'),
        icon: 'checkmark-circle-outline' as const,
      },
      {
        status: 'cancelled' as const,
        label: t('consultation.cancelled', 'Cancelled'),
        icon: 'close-circle-outline' as const,
      },
    ],
    [t],
  );

  const renderBooking = ({ item }: { item: Booking }) => {
    const isConfirmed = item.status === 'confirmed';
    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.docAvatarCircle}>
            <Ionicons color={theme.colors.primary} name="person" size={ms(22)} />
          </View>
          <View style={styles.docInfo}>
            <Typography style={styles.docName} variant="h3">
              Dr. {item.doctorName}
            </Typography>
            <Typography style={styles.specText} variant="caption">
              {item.specialization}
            </Typography>
          </View>
          <Badge
            label={
              isConfirmed
                ? t('consultation.confirmed', 'CONFIRMED')
                : t('consultation.cancelled', 'CANCELLED')
            }
            variant={isConfirmed ? 'success' : 'error'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.scheduleBlock}>
          <View style={styles.scheduleItem}>
            <Ionicons color={theme.colors.primary} name="calendar-outline" size={ms(15)} />
            <Typography style={styles.scheduleVal} variant="bodySmallSemiBold">
              {item.date}
            </Typography>
          </View>
          <View style={styles.scheduleItem}>
            <Ionicons color={theme.colors.primary} name="time-outline" size={ms(15)} />
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

        <View style={styles.patientRow}>
          <Typography style={styles.patientLabel} variant="caption">
            {t('consultation.patientDetails', 'Patient')}:
          </Typography>
          <Typography style={styles.patientValue} variant="bodySmallSemiBold">
            {item.patientName} ({item.patientAge} yrs)
          </Typography>
        </View>

        <View style={styles.symptomsBox}>
          <Ionicons color={theme.colors.textSecondary} name="medkit-outline" size={ms(14)} />
          <Typography numberOfLines={1} style={styles.symptomsText} variant="caption">
            {item.symptoms}
          </Typography>
        </View>

        <View style={styles.actionRow}>
          <Button
            leftIcon={
              <Ionicons color={theme.colors.primary} name="receipt-outline" size={ms(16)} />
            }
            onPress={() => navigate(NAVIGATION.BOOKING_CONFIRMATION, { bookingId: item.id })}
            size="sm"
            style={styles.actionBtn}
            title={t('consultation.viewReceipt', 'View Receipt')}
            variant="secondary"
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

  const renderEmptyState = () => {
    if (isError) {
      return (
        <EmptyState
          actionTitle={t('common.retry', 'Retry')}
          description={t(
            'common.errorSub',
            'An error occurred while communicating with the server. Please check your connection and retry.',
          )}
          iconName="alert-circle-outline"
          onAction={() => refetch()}
          title={t('common.errorTitle', 'Unable to Load Appointments')}
        />
      );
    }

    if (filterStatus === 'cancelled') {
      return (
        <EmptyState
          actionTitle={t('consultation.viewAllBookings', 'View All Bookings')}
          description={t(
            'consultation.noCancelledSub',
            "You don't have any cancelled appointments.",
          )}
          iconName="calendar-outline"
          onAction={() => setFilterStatus('all')}
          title={t('consultation.noCancelledFound', 'No Cancelled Consultations')}
        />
      );
    }

    if (filterStatus === 'confirmed') {
      return (
        <EmptyState
          actionTitle={t('consultation.findDoctor', 'Book a Consultation')}
          description={t(
            'consultation.noConfirmedSub',
            "You don't have any upcoming confirmed appointments.",
          )}
          iconName="calendar-outline"
          onAction={() => navigate(NAVIGATION.DOCTOR_LIST)}
          title={t('consultation.noConfirmedFound', 'No Upcoming Consultations')}
        />
      );
    }

    return (
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
    );
  };

  const activeCount = bookings
    ? bookings.filter((b: Booking) => b.status === 'confirmed').length
    : 0;

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Typography variant="h2">
            {t('consultation.myConsultations', 'My Consultations')}
          </Typography>
          <Typography style={styles.headerSub} variant="caption">
            {t('consultation.activeAppointments', '{{count}} Active Appointments', {
              count: activeCount,
            })}
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

      {/* Auto-Centering Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          contentContainerStyle={styles.filterScroll}
          data={chipItems}
          horizontal
          keyExtractor={(item) => item.status}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              chipsListRef.current?.scrollToIndex({
                index: info.index,
                viewPosition: 0.5,
                animated: true,
              });
            }, 100);
          }}
          ref={chipsListRef}
          renderItem={({ item, index }) => {
            const isSelected = filterStatus === item.status;
            return (
              <Chip
                icon={
                  <Ionicons
                    color={isSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                    name={item.icon}
                    size={ms(14)}
                  />
                }
                label={item.label}
                onPress={() => handleSelectChip(item.status, index)}
                selected={isSelected}
              />
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
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
          ListEmptyComponent={renderEmptyState}
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
