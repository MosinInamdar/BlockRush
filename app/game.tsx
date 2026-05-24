import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ClearEffectsLayer,
  DragOverlay,
  GameGrid,
  GameHeader,
  GameOverOverlay,
  PieceTray,
  ScreenShake,
} from '../src/components/game';
import { GRID_SIZE } from '../src/engine/constants';
import { AdBanner } from '../src/components/ads/AdBanner';
import { useAutoSaveGame } from '../src/hooks/useAutoSaveGame';
import { useGameFeedback } from '../src/hooks/useGameFeedback';
import { useInterstitialOnGameOver } from '../src/hooks/useInterstitialOnGameOver';
import { useGameInput } from '../src/hooks/useGameInput';
import { useGridLayout } from '../src/hooks/useGridLayout';
import { usePieceDrag } from '../src/hooks/usePieceDrag';
import { showInterstitialIfAllowed, showRewardedAd } from '../src/services/ads/adService';
import { useGameStore } from '../src/store/gameStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { colors, spacing } from '../src/theme';

export default function GameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const horizontalPad = spacing.md * 2;
  const cellSize = Math.floor((width - horizontalPad) / GRID_SIZE);

  const grid = useGameStore((s) => s.grid);
  const score = useGameStore((s) => s.score);
  const bestScore = useGameStore((s) => s.bestScore);
  const currentPieces = useGameStore((s) => s.currentPieces);
  const usedPieces = useGameStore((s) => s.usedPieces);
  const clearEffect = useGameStore((s) => s.clearEffect);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const commitClearAnimation = useGameStore((s) => s.commitClearAnimation);
  const clearSavedGame = useGameStore((s) => s.clearSavedGame);
  const isRunNewBest = useGameStore((s) => s.isRunNewBest);
  const applyRewardedContinue = useGameStore((s) => s.applyRewardedContinue);
  const removeAdsPurchased = useSettingsStore((s) => s.removeAdsPurchased);

  const { canInteract, isGameOver } = useGameInput();
  useAutoSaveGame();
  useInterstitialOnGameOver(isGameOver);
  const { gridRef, layout, onGridLayout, remeasureGrid } = useGridLayout(cellSize);
  const { drag, ghostCells, startDrag, moveDrag, endDrag } = usePieceDrag(layout);

  useGameFeedback();

  const handleClearComplete = useCallback(() => {
    commitClearAnimation();
  }, [commitClearAnimation]);

  useEffect(() => {
    remeasureGrid();
  }, [cellSize, grid, remeasureGrid]);

  useEffect(() => {
    if (isGameOver) {
      void clearSavedGame();
    }
  }, [isGameOver, clearSavedGame]);

  const shakeBoard = clearEffect !== null && clearEffect.linesCleared >= 2;

  const handleWatchContinue = useCallback(async () => {
    const earned = await showRewardedAd();
    if (!earned) return false;
    return applyRewardedContinue();
  }, [applyRewardedContinue]);

  const handleGoHome = useCallback(() => {
    void showInterstitialIfAllowed(removeAdsPurchased);
  }, [removeAdsPurchased]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Leave game"
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerGrow}>
          <GameHeader score={score} bestScore={bestScore} />
        </View>
      </View>

      <ScreenShake active={shakeBoard} style={styles.board}>
        <View style={styles.gridStack}>
          <GameGrid
            ref={gridRef}
            grid={grid}
            cellSize={cellSize}
            ghostCells={ghostCells}
            ghostColor={drag?.piece.color ?? null}
            onLayout={onGridLayout}
          />
          {clearEffect && (
            <ClearEffectsLayer
              effect={clearEffect}
              cellSize={cellSize}
              onComplete={handleClearComplete}
            />
          )}
        </View>
      </ScreenShake>

      <PieceTray
        pieces={currentPieces}
        usedPieces={usedPieces}
        cellSize={cellSize}
        draggingIndex={drag?.pieceIndex ?? null}
        canInteract={canInteract}
        onDragStart={startDrag}
        onDragMove={moveDrag}
        onDragEnd={endDrag}
      />

      <AdBanner />

      {isGameOver && (
        <GameOverOverlay
          score={score}
          bestScore={bestScore}
          isNewBest={isRunNewBest()}
          onPlayAgain={startNewGame}
          onWatchContinue={handleWatchContinue}
          onGoHome={handleGoHome}
        />
      )}

      {drag && (
        <DragOverlay
          piece={drag.piece}
          cellSize={cellSize}
          absoluteX={drag.absoluteX}
          absoluteY={drag.absoluteY}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  backText: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '600',
  },
  headerGrow: {
    flex: 1,
  },
  board: {
    flex: 1,
    justifyContent: 'center',
  },
  gridStack: {
    alignSelf: 'center',
    position: 'relative',
  },
});
