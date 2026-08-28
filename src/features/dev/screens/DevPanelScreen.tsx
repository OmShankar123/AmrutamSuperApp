import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';

import { getChaosConfig, setChaosConfig } from '@/core/api/interceptors/chaos';
import { useNetworkStore } from '@/core/api/services/syncManager';
import { appStorage } from '@/core/storage';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import { ScreenWrapper } from '@/shared/components/ScreenWrapper';
import { Typography } from '@/shared/components/Typography';
import { ms } from '@/shared/utils/scale';
import { showSuccessToast } from '@/shared/utils/toast';

const LATENCY_PRESETS = [
  { label: '0ms (Fast)', val: 0 },
  { label: '350ms (Normal)', val: 350 },
  { label: '1000ms (Slow 3G)', val: 1000 },
  { label: '2500ms (High)', val: 2500 },
];

const ERROR_RATE_PRESETS = [
  { label: '0% (Healthy)', val: 0 },
  { label: '15% (Flaky)', val: 0.15 },
  { label: '30% (Severe)', val: 0.3 },
  { label: '50% (Chaos)', val: 0.5 },
];

export function DevPanelScreen(): React.JSX.Element {
  const { theme } = useUnistyles();
  const queryClient = useQueryClient();
  const isConnected = useNetworkStore((s) => s.isConnected);
  const setNetworkState = useNetworkStore((s) => s.setNetworkState);

  const [chaos, setChaos] = useState(getChaosConfig());

  const updateChaos = (patch: Partial<typeof chaos>) => {
    const updated = { ...chaos, ...patch };
    setChaos(updated);
    setChaosConfig(updated);
  };

  const toggleForceOffline = (val: boolean) => {
    updateChaos({ offline: val });
    setNetworkState(!val, !val);
    showSuccessToast(
      val ? 'Simulated offline mode enabled' : 'Simulated online mode restored',
      'Network State Changed',
    );
  };

  const handleResetCache = () => {
    queryClient.clear();
    appStorage.clearAll();
    showSuccessToast('Query cache & local MMKV storage wiped', 'Reset Complete');
  };

  return (
    <ScreenWrapper withHorizontalPadding={false} withTopInset={false}>
      <Header showBack subtitle="API Simulation & Diagnostics" title="Chaos & Dev Panel" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chaos Mode Master Switch */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelGroup}>
              <Typography variant="h3">Chaos Mode</Typography>
              <Typography style={styles.subtext} variant="caption">
                Enable simulated network latency & error injection
              </Typography>
            </View>
            <Switch
              onValueChange={(enabled) => updateChaos({ enabled })}
              thumbColor={chaos.enabled ? theme.colors.primary : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.primaryLight }}
              value={chaos.enabled}
            />
          </View>
        </View>

        {/* Latency Presets */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.primary} name="timer-outline" size={ms(18)} />
            <Typography variant="h3">Simulated API Latency</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            Current delay: {chaos.delayMs}ms
          </Typography>

          <View style={styles.presetGrid}>
            {LATENCY_PRESETS.map((preset) => {
              const isSelected = chaos.delayMs === preset.val;
              return (
                <TouchableOpacity
                  key={preset.val}
                  onPress={() => updateChaos({ enabled: true, delayMs: preset.val })}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 500 Error Rate Injection */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.error} name="warning-outline" size={ms(18)} />
            <Typography variant="h3">HTTP 500 Error Injection</Typography>
          </View>
          <Typography style={styles.sectionDesc} variant="caption">
            Probability of simulated network failure: {Math.round(chaos.errorRate * 100)}%
          </Typography>

          <View style={styles.presetGrid}>
            {ERROR_RATE_PRESETS.map((preset) => {
              const isSelected = chaos.errorRate === preset.val;
              return (
                <TouchableOpacity
                  key={preset.val}
                  onPress={() => updateChaos({ enabled: true, errorRate: preset.val })}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                >
                  <Typography
                    style={isSelected ? styles.presetTextActive : styles.presetText}
                    variant="bodySmallSemiBold"
                  >
                    {preset.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Force Offline Toggle */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelGroup}>
              <Typography variant="h3">Force Offline Mode</Typography>
              <Typography style={styles.subtext} variant="caption">
                Disconnect app from network to test offline sync banner & cached queries
              </Typography>
            </View>
            <Switch
              onValueChange={toggleForceOffline}
              thumbColor={!isConnected ? theme.colors.error : theme.colors.border}
              trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.errorLight }}
              value={!isConnected}
            />
          </View>
        </View>

        {/* System Diagnostics */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons color={theme.colors.info} name="analytics-outline" size={ms(18)} />
            <Typography variant="h3">System Diagnostics</Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              Network Status
            </Typography>
            <Typography
              style={isConnected ? styles.connectedText : styles.disconnectedText}
              variant="bodySmallSemiBold"
            >
              {isConnected ? 'ONLINE' : 'OFFLINE (Simulated)'}
            </Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              MMKV Storage Engine
            </Typography>
            <Typography variant="bodySmallSemiBold">Active</Typography>
          </View>

          <View style={styles.diagRow}>
            <Typography style={styles.diagLabel} variant="bodySmall">
              TanStack Query Cache
            </Typography>
            <Typography variant="bodySmallSemiBold">Hydrated</Typography>
          </View>
        </View>

        {/* Actions */}
        <Button
          leftIcon={
            <Ionicons color={theme.colors.textInverse} name="trash-outline" size={ms(18)} />
          }
          onPress={handleResetCache}
          style={styles.resetBtn}
          title="Wipe Query Cache & Reset Stores"
          variant="danger"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollContent: {
    padding: ms(16),
    paddingBottom: ms(40),
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flex: 1,
    paddingRight: ms(12),
  },
  subtext: {
    color: theme.colors.textSecondary,
    marginTop: ms(2),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: ms(4),
  },
  sectionDesc: {
    color: theme.colors.textSecondary,
    marginBottom: ms(12),
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(8),
  },
  presetChip: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: ms(10),
    paddingHorizontal: ms(12),
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  presetText: {
    color: theme.colors.text,
  },
  presetTextActive: {
    color: theme.colors.textInverse,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: ms(6),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceElevated,
  },
  diagLabel: {
    color: theme.colors.textSecondary,
  },
  connectedText: {
    color: theme.colors.success,
  },
  disconnectedText: {
    color: theme.colors.error,
  },
  resetBtn: {
    marginTop: ms(12),
  },
}));
