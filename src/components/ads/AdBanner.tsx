import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { analyticsEvents } from '../../services/analytics/analyticsService';
import { AD_UNIT_IDS, getAdsModule, initAds, isAdsNativeAvailable } from '../../services/ads/adService';
import { useSettingsStore } from '../../store/settingsStore';
import { colors, spacing, typography } from '../../theme';

export function AdBanner() {
  const removeAds = useSettingsStore((s) => s.removeAdsPurchased);
  const [ready, setReady] = useState(isAdsNativeAvailable());

  useEffect(() => {
    if (removeAds) return;
    void initAds().then((ok) => setReady(ok));
  }, [removeAds]);

  if (removeAds) {
    return null;
  }

  const ads = getAdsModule();

  if (!ready || !ads) {
    return (
      <View style={styles.strip}>
        <View style={styles.placeholder}>
          {__DEV__ && <Text style={styles.hint}>Ads need a dev build</Text>}
        </View>
      </View>
    );
  }

  const { BannerAd, BannerAdSize } = ads;

  return (
    <View style={styles.strip}>
    <View style={styles.bannerWrap}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          void analyticsEvents.adImpression('banner');
        }}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  placeholder: {
    height: spacing.adBanner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bannerWrap: {
    alignItems: 'center',
    minHeight: spacing.adBanner,
  },
});
