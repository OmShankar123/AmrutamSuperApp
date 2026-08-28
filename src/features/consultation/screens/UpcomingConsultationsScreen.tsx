import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

import { useLanguage } from '@/core/localization/useLanguage';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';

import { useCancelBooking, useMyBookings } from '../hooks/useDoctors';
import type { Booking } from '../types';

export function UpcomingConsultationsScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const { t } = useLanguage();
  const { data: bookings, isLoading, refetch } = useMyBookings();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <Typography variant="h3">{item.doctorName}</Typography>
        <Badge
          label={item.status.toUpperCase()}
          variant={
            item.status === 'confirmed'
              ? 'success'
              : item.status === 'cancelled'
                ? 'error'
                : 'warning'
          }
        />
      </View>

      <Typography style={styles.specialization} variant="bodySmallSemiBold">
        {item.specialization}
      </Typography>
      <View style={styles.infoRow}>
        <Ionicons color={theme.colors.textSecondary} name="calendar-outline" size={ms(14)} />
        <Typography style={styles.infoText} variant="bodySmall">
          {item.date} at {item.time}
        </Typography>
      </View>
      <View style={styles.infoRow}>
        <Ionicons color={theme.colors.textSecondary} name="person-outline" size={ms(14)} />
        <Typography style={styles.infoText} variant="caption">
          Patient: {item.patientName} ({item.patientAge}y)
        </Typography>
      </View>

      {item.status === 'confirmed' && (
        <Button
          disabled={isCancelling}
          onPress={() => cancelBooking(item.id)}
          size="sm"
          style={styles.cancelBtn}
          title={t('consultation.cancelConsultation')}
          variant="danger"
        />
      )}
    </View>
  );

  return (
    <ScreenWrapper withTopInset>
      <View style={styles.header}>
        <Typography variant="h1">{t('consultation.myConsultations')}</Typography>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={bookings ?? []}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              description={t('consultation.noConsultationsSub')}
              icon="📅"
              title={t('consultation.noConsultations')}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={renderBooking}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContent: {
    padding: ms(16),
  },
  bookingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialization: {
    color: theme.colors.primary,
    marginTop: ms(2),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
    marginTop: ms(4),
  },
  infoText: {
    color: theme.colors.textSecondary,
  },
  cancelBtn: {
    marginTop: ms(12),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
