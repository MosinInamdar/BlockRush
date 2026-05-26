import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { REMOVE_ADS_PRODUCT_ID } from '../src/constants/monetization';
import { SettingsInfoRow, SettingsRow } from '../src/components/meta';
import { useSettingsStore } from '../src/store/settingsStore';
import { colors, spacing, typography } from '../src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);
  const musicEnabled = useSettingsStore((s) => s.musicEnabled);
  const removeAdsPurchased = useSettingsStore((s) => s.removeAdsPurchased);
  const iapBusy = useSettingsStore((s) => s.iapBusy);
  const setSfxEnabled = useSettingsStore((s) => s.setSfxEnabled);
  const setMusicEnabled = useSettingsStore((s) => s.setMusicEnabled);
  const purchaseRemoveAds = useSettingsStore((s) => s.purchaseRemoveAds);
  const restoreRemoveAds = useSettingsStore((s) => s.restoreRemoveAds);
  const [status, setStatus] = useState<string | null>(null);

  const onBuyRemoveAds = async () => {
    setStatus(null);
    const result = await purchaseRemoveAds();
    if (result === 'success') {
      setStatus('Ads removed — thank you!');
    } else if (result === 'cancelled') {
      setStatus(null);
    } else {
      setStatus('Purchase unavailable. Use a dev build with Play Billing configured.');
    }
  };

  const onRestore = async () => {
    setStatus(null);
    const restored = await restoreRemoveAds();
    setStatus(
      restored ? 'Purchases restored.' : 'No Remove Ads purchase found for this account.'
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Audio</Text>
        <SettingsRow
          label="Sound effects"
          description="Placement, clears, and game over tones"
          value={sfxEnabled}
          onValueChange={setSfxEnabled}
        />
        <SettingsRow
          label="Music"
          description="Lo-fi background loop while playing"
          value={musicEnabled}
          onValueChange={setMusicEnabled}
        />

        <Text style={styles.section}>Store</Text>
        <SettingsInfoRow
          label="Remove ads"
          value={removeAdsPurchased ? 'Purchased' : 'Not purchased'}
        />
        {!removeAdsPurchased && (
          <>
            <Pressable
              style={[styles.storeBtn, iapBusy && styles.storeBtnDisabled]}
              onPress={() => void onBuyRemoveAds()}
              disabled={iapBusy}
            >
              <Text style={styles.storeBtnText}>Buy Remove Ads — ₹99 / $0.99</Text>
            </Pressable>
            <Pressable
              style={styles.restoreBtn}
              onPress={() => void onRestore()}
              disabled={iapBusy}
            >
              <Text style={styles.restoreText}>Restore purchases</Text>
            </Pressable>
            <Text style={styles.productId}>Product: {REMOVE_ADS_PRODUCT_ID}</Text>
          </>
        )}
        {status && <Text style={styles.status}>{status}</Text>}

        {__DEV__ && !removeAdsPurchased && (
          <Pressable
            style={styles.devBtn}
            onPress={() =>
              Alert.alert('Dev only', 'Simulate Remove Ads purchase?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Grant',
                  onPress: () => void purchaseRemoveAds(),
                },
              ])
            }
          >
            <Text style={styles.devBtnText}>Dev: simulate purchase</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  back: {
    ...typography.label,
    color: colors.block.cyan,
    minWidth: 72,
  },
  title: {
    ...typography.score,
    color: colors.textPrimary,
  },
  headerSpacer: {
    minWidth: 72,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storeBtn: {
    backgroundColor: colors.block.hotPink,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  storeBtnDisabled: {
    opacity: 0.5,
  },
  storeBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  restoreBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  restoreText: {
    color: colors.block.cyan,
    fontWeight: '600',
  },
  productId: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  status: {
    ...typography.caption,
    color: colors.block.amber,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  devBtn: {
    marginTop: spacing.lg,
    padding: spacing.sm,
    alignItems: 'center',
  },
  devBtnText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
