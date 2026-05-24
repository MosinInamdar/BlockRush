import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettingsStore } from '../../store/settingsStore';
import { colors, typography } from '../../theme';

interface GameHeaderProps {
  score: number;
  bestScore: number;
  showSfxToggle?: boolean;
}

export function GameHeader({ score, bestScore, showSfxToggle }: GameHeaderProps) {
  const sfxEnabled = useSettingsStore((s) => s.sfxEnabled);
  const toggleSfx = useSettingsStore((s) => s.toggleSfx);

  return (
    <View style={styles.header}>
      <View style={styles.block}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>SCORE</Text>
      </View>

      {showSfxToggle && (
        <Pressable
          onPress={toggleSfx}
          style={[styles.sfxBtn, !sfxEnabled && styles.sfxOff]}
          hitSlop={8}
        >
          <Text style={styles.sfxText}>{sfxEnabled ? 'SFX ON' : 'SFX OFF'}</Text>
        </Pressable>
      )}

      <View style={[styles.block, styles.right]}>
        <Text style={styles.label}>BEST</Text>
        <Text style={styles.best}>{bestScore}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  block: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  right: {
    marginLeft: 'auto',
  },
  score: {
    ...typography.score,
    color: colors.textPrimary,
    marginRight: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 3,
    marginRight: 6,
  },
  best: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.block.amber,
  },
  sfxBtn: {
    borderWidth: 1,
    borderColor: colors.gridLine,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 8,
  },
  sfxOff: {
    opacity: 0.5,
  },
  sfxText: {
    ...typography.caption,
    color: colors.block.cyan,
  },
});
