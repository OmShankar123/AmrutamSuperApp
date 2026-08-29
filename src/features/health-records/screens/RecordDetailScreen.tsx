import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';

import { useFeatureFlags } from '@/core/config/featureFlags';
import { useLanguage } from '@/core/localization/useLanguage';
import { useCartStore } from '@/features/shop/store/useCartStore';
import { NAVIGATION } from '@/navigation/constants';
import { goBack, navigate } from '@/navigation/navigationRef';
import type { RootStackParamList } from '@/navigation/types';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { LoadingState } from '@/shared/components/LoadingState';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { generateAndDownloadReportPdf } from '@/shared/utils/pdfGenerator';
import { ms } from '@/shared/utils/scale';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

import { useHealthRecordDetail } from '../hooks/useHealthRecords';
import type { RecordAttachment } from '../types';

type RecordDetailRouteProp = RouteProp<RootStackParamList, typeof NAVIGATION.RECORD_DETAIL>;

export function RecordDetailScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const route = useRoute<RecordDetailRouteProp>();
  const { recordId } = route.params;
  const { t } = useLanguage();
  const addToCart = useCartStore((s) => s.addToCart);

  const { data: record, isLoading, isError } = useHealthRecordDetail(recordId);

  const [selectedImage, setSelectedImage] = useState<RecordAttachment | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);

  const enablePdfExport = useFeatureFlags((s) => s.flags.enablePdfExport);

  const handleDownloadPdf = async () => {
    if (!record) return;
    setIsDownloading(true);
    try {
      await generateAndDownloadReportPdf(record);
      showSuccessToast(
        t('healthRecords.downloadSuccess', 'Medical report downloaded to your device storage.'),
        t('healthRecords.downloadPdf', 'Download PDF Report'),
      );
    } catch (err: any) {
      showErrorToast(err?.message || 'Could not generate report PDF', 'Download Error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRefillPrescription = () => {
    if (!record?.medications) return;
    setIsRefilling(true);
    setTimeout(() => {
      record.medications?.forEach((med, idx) => {
        addToCart(
          {
            id: `prod_med_${idx}`,
            name: med.name,
            subtitle: med.dosage,
            category: 'Immunity',
            healthConcerns: ['Low Energy'],
            price: 499,
            originalPrice: 599,
            discountPercentage: 15,
            rating: 4.8,
            reviewCount: 120,
            inStock: true,
            stockCount: 10,
            imageUrl: 'https://images.unsplash.com/photo-1608248597359-07f9c2d1b0ef?w=600',
            description: `Authentic Ayurvedic formulation: ${med.name}. Dosage: ${med.dosage}. Frequency: ${med.frequency}.`,
            ingredients: ['Amla', 'Ashwagandha', 'Tulsi'],
            benefits: ['Dosha balancing', 'Vitality enhancement'],
            howToUse: med.frequency,
          },
          1,
        );
      });
      setIsRefilling(false);
      showSuccessToast(
        t('shop.addedToCartDesc', 'Prescribed formulations added to your shopping bag.'),
        t('shop.addedToCart', 'Added to Cart'),
      );
      navigate(NAVIGATION.CART);
    }, 400);
  };

  if (isLoading) {
    return (
      <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
        <Header showBack title={t('healthRecords.title', 'Health Record')} />
        <LoadingState message={t('common.loading', 'Loading health record...')} />
      </ScreenWrapper>
    );
  }

  if (isError || !record) {
    return (
      <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
        <Header showBack title={t('healthRecords.title', 'Health Record')} />
        <View style={styles.centered}>
          <Typography color={theme.colors.error} style={styles.errorText} variant="h3">
            {t('common.error', 'Health record not found')}
          </Typography>
          <Button onPress={goBack} title={t('common.back', 'Go Back')} variant="outline" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header showBack subtitle={record.formattedDate} title={record.title} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Record Overview Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <Badge label={record.type.replace('_', ' ').toUpperCase()} variant="success" />
            <Typography style={styles.recordIdText} variant="caption">
              {record.id}
            </Typography>
          </View>

          <Typography style={styles.title} variant="h2">
            {record.title}
          </Typography>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Typography style={styles.metaLabel} variant="caption">
                {t('consultation.doctor', 'Doctor / Practitioner')}
              </Typography>
              <Typography style={styles.metaVal} variant="bodySmallSemiBold">
                {record.doctorName}
              </Typography>
            </View>

            <View style={styles.metaItem}>
              <Typography style={styles.metaLabel} variant="caption">
                {t('consultation.clinicInfo', 'Facility / Diagnostic Lab')}
              </Typography>
              <Typography style={styles.metaVal} variant="bodySmallSemiBold">
                {record.clinicOrLabName}
              </Typography>
            </View>
          </View>
        </View>

        {/* Patient Vitals & Dosha Imbalance */}
        {record.vitals && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons color={theme.colors.primary} name="pulse" size={ms(18)} />
              <Typography variant="h3">
                {t('healthRecords.vitals', 'Patient Vitals & Dosha Assessment')}
              </Typography>
            </View>

            <View style={styles.vitalsGrid}>
              {record.vitals.dosha && (
                <View style={styles.vitalCard}>
                  <Typography style={styles.vitalLabel} variant="caption">
                    Dosha Balance
                  </Typography>
                  <Typography style={styles.doshaValue} variant="bodySemiBold">
                    {record.vitals.dosha}
                  </Typography>
                </View>
              )}

              {record.vitals.bp && (
                <View style={styles.vitalCard}>
                  <Typography style={styles.vitalLabel} variant="caption">
                    Blood Pressure
                  </Typography>
                  <Typography style={styles.vitalValue} variant="bodySemiBold">
                    {record.vitals.bp}
                  </Typography>
                </View>
              )}

              {record.vitals.pulse && (
                <View style={styles.vitalCard}>
                  <Typography style={styles.vitalLabel} variant="caption">
                    Pulse (Nadi)
                  </Typography>
                  <Typography style={styles.vitalValue} variant="bodySemiBold">
                    {record.vitals.pulse} bpm
                  </Typography>
                </View>
              )}

              {record.vitals.weight && (
                <View style={styles.vitalCard}>
                  <Typography style={styles.vitalLabel} variant="caption">
                    Weight
                  </Typography>
                  <Typography style={styles.vitalValue} variant="bodySemiBold">
                    {record.vitals.weight} kg
                  </Typography>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Clinical Summary & Notes */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="clipboard-outline" size={ms(18)} />
            <Typography variant="h3">Clinical Notes & Observations</Typography>
          </View>
          <Typography style={styles.notesText} variant="body">
            {record.notes}
          </Typography>
        </View>

        {/* Prescriptions List (If available) */}
        {record.medications && record.medications.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons color={theme.colors.primary} name="medkit-outline" size={ms(18)} />
              <Typography variant="h3">Prescribed Ayurvedic Formulations</Typography>
            </View>

            {record.medications.map((med, idx) => (
              <View key={idx} style={styles.medicationRow}>
                <View style={styles.medNumberCircle}>
                  <Typography style={styles.medNumber} variant="caption">
                    {idx + 1}
                  </Typography>
                </View>
                <View style={styles.medContent}>
                  <Typography variant="bodySemiBold">{med.name}</Typography>
                  <Typography style={styles.medDosage} variant="bodySmall">
                    {med.dosage} • {med.frequency}
                  </Typography>
                  <Typography style={styles.medDuration} variant="caption">
                    Duration: {med.duration}
                  </Typography>
                </View>
              </View>
            ))}

            {/* Refill Button (Cross-Module Shop Integration) */}
            <Button
              isLoading={isRefilling}
              leftIcon={
                <Ionicons color={theme.colors.textInverse} name="bag-add-outline" size={ms(18)} />
              }
              onPress={handleRefillPrescription}
              style={styles.refillBtn}
              title="Order Prescribed Medicines"
              variant="primary"
            />
          </View>
        )}

        {/* Clinical Scans & Attachments */}
        {record.attachments.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons color={theme.colors.primary} name="images-outline" size={ms(18)} />
              <Typography variant="h3">
                {t('healthRecords.attachments', 'Attachments & Scans')} ({record.attachments.length}
                )
              </Typography>
            </View>

            <View style={styles.attachmentsGrid}>
              {record.attachments.map((att) => (
                <TouchableOpacity
                  key={att.id}
                  onPress={() => setSelectedImage(att)}
                  style={styles.attachmentCard}
                >
                  <Image
                    cachePolicy="memory-disk"
                    contentFit="cover"
                    source={{ uri: att.url }}
                    style={styles.attachmentThumbnail}
                    transition={200}
                  />
                  <View style={styles.attachmentInfo}>
                    <Typography
                      numberOfLines={1}
                      style={styles.attachmentName}
                      variant="bodySmallSemiBold"
                    >
                      {att.name}
                    </Typography>
                    <Typography style={styles.attachmentSize} variant="caption">
                      {att.size} • {att.type.toUpperCase()}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Download PDF Button */}
        {enablePdfExport && (
          <Button
            isLoading={isDownloading}
            leftIcon={
              <Ionicons color={theme.colors.primary} name="download-outline" size={ms(18)} />
            }
            onPress={handleDownloadPdf}
            style={styles.downloadBtn}
            title={t('healthRecords.downloadPdf', 'Download PDF Report')}
            variant="outline"
          />
        )}
      </ScrollView>

      {/* Fullscreen Image Preview Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
        transparent
        visible={selectedImage !== null}
      >
        <View style={styles.imageModalBackdrop}>
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.modalCloseBtn}>
            <Ionicons color="#FFFFFF" name="close" size={ms(24)} />
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.imageModalContent}>
              <Image
                cachePolicy="memory-disk"
                contentFit="contain"
                source={{ uri: selectedImage.url }}
                style={styles.fullscreenImage}
              />
              <Typography style={styles.modalImageTitle} variant="bodySemiBold">
                {selectedImage.name}
              </Typography>
            </View>
          )}
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: ms(16),
    marginBottom: ms(12),
    borderWidth: 1,
    borderColor: theme.colors.border,
    boxShadow: theme.shadows.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(8),
  },
  recordIdText: {
    color: theme.colors.textTertiary,
    fontFamily: 'Courier',
  },
  title: {
    color: theme.colors.text,
    marginTop: ms(2),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: ms(12),
  },
  metaGrid: {
    gap: ms(10),
  },
  metaItem: {
    gap: ms(2),
  },
  metaLabel: {
    color: theme.colors.textSecondary,
  },
  metaVal: {
    color: theme.colors.text,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginBottom: ms(12),
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  vitalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surfaceElevated,
    padding: ms(10),
    borderRadius: theme.radius.md,
    gap: ms(2),
  },
  vitalLabel: {
    color: theme.colors.textSecondary,
  },
  vitalValue: {
    color: theme.colors.text,
  },
  doshaValue: {
    color: theme.colors.primary,
  },
  notesText: {
    color: theme.colors.text,
    lineHeight: ms(22),
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(10),
    paddingVertical: ms(8),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  medNumberCircle: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(12),
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(2),
  },
  medNumber: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  medContent: {
    flex: 1,
  },
  medDosage: {
    color: theme.colors.primary,
    marginTop: ms(2),
  },
  medDuration: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  refillBtn: {
    marginTop: ms(12),
  },
  attachmentsGrid: {
    gap: ms(10),
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  attachmentThumbnail: {
    width: ms(60),
    height: ms(60),
    backgroundColor: theme.colors.surface,
  },
  attachmentInfo: {
    flex: 1,
    paddingHorizontal: ms(12),
    gap: ms(2),
  },
  attachmentName: {
    color: theme.colors.text,
  },
  attachmentSize: {
    color: theme.colors.textSecondary,
  },
  downloadBtn: {
    marginTop: ms(4),
    marginBottom: ms(20),
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(16),
  },
  modalCloseBtn: {
    position: 'absolute',
    top: ms(48),
    right: ms(20),
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageModalContent: {
    width: '100%',
    height: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '90%',
  },
  modalImageTitle: {
    color: '#FFFFFF',
    marginTop: ms(12),
    textAlign: 'center',
  },
}));
