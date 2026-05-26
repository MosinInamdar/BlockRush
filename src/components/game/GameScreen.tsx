import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../ads/AdBanner';
import { GameBoardFrame, NeonBackdrop, NeonButton } from '../ui';
import { GRID_SIZE } from '../../engine/constants';
import { useAutoSaveGame } from '../../hooks/useAutoSaveGame';
import { useGameFeedback } from '../../hooks/useGameFeedback';
import { useInterstitialOnGameOver } from '../../hooks/useInterstitialOnGameOver';
import { useGameInput } from '../../hooks/useGameInput';
import { useGridLayout } from '../../hooks/useGridLayout';
import { usePieceDrag } from '../../hooks/usePieceDrag';
import { feedback } from '../../services/feedback';
import { showInterstitialIfAllowed, showRewardedAd } from '../../services/ads/adService';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { spacing } from '../../theme';
import {
  ClearEffectsLayer,
  DragOverlay,
  GameGrid,
  GameHud,
  GameOverOverlay,
  PieceTray,
  ScreenShake,
} from './index';

export function GameScreen() {
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
  useGameFeedback();

  const { gridRef, layout, onGridLayout, remeasureGrid } = useGridLayout(cellSize);
  const {
    dragMeta,
    ghostCells,
    overlayX,
    overlayY,
    overlayVisible,
    hostOriginX,
    hostOriginY,
    startDrag,
    moveDrag,
    endDrag,
    measureDragHost,
  } = usePieceDrag(layout);

  const dragHostRef = useRef<View>(null);

  const measureDragHostWindow = useCallback(() => {
    dragHostRef.current?.measureInWindow((x, y) => {
      measureDragHost(x, y);
    });
  }, [measureDragHost]);

  const boardOpacity = useSharedValue(0);
  const boardScale = useSharedValue(0.98);
  const trayOpacity = useSharedValue(0);
  const trayY = useSharedValue(12);

  useEffect(() => {
    void feedback.prewarm();
    boardOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    boardScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    trayOpacity.value = withDelay(100, withTiming(1, { duration: 350 }));
    trayY.value = withDelay(100, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
  }, [boardOpacity, boardScale, trayOpacity, trayY]);

  const handleClearComplete = useCallback(() => {
    commitClearAnimation();
  }, [commitClearAnimation]);

  useEffect(() => {
    remeasureGrid();
  }, [cellSize, grid, remeasureGrid]);

  useEffect(() => {
    const id = requestAnimationFrame(() => measureDragHostWindow());
    return () => cancelAnimationFrame(id);
  }, [cellSize, measureDragHostWindow]);

  useEffect(() => {
    if (isGameOver) {
      void clearSavedGame();
    }
  }, [isGameOver, clearSavedGame]);

  const shakeIntensity =
    clearEffect === null
      ? undefined
      : clearEffect.linesCleared >= 3
        ? 'heavy'
        : clearEffect.linesCleared >= 2
          ? 'medium'
          : 'light';
  const shakeBoard = shakeIntensity !== undefined;

  const handleWatchContinue = useCallback(async () => {
    const earned = await showRewardedAd();
    if (!earned) return false;
    return applyRewardedContinue();
  }, [applyRewardedContinue]);

  const handleGoHome = useCallback(() => {
    void showInterstitialIfAllowed(removeAdsPurchased);
  }, [removeAdsPurchased]);

  const boardEnterStyle = useAnimatedStyle(() => ({
    opacity: boardOpacity.value,
    transform: [{ scale: boardScale.value }],
  }));

  const trayEnterStyle = useAnimatedStyle(() => ({
    opacity: trayOpacity.value,
    transform: [{ translateY: trayY.value }],
  }));

  return (
    <NeonBackdrop variant="game" centerGlow>
      <View style={styles.screenRoot}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <NeonButton
            variant="ghost"
            label="←"
            onPress={() => router.back()}
            accessibilityLabel="Leave game"
            style={styles.backBtn}
          />
          <GameHud score={score} bestScore={bestScore} />
        </View>

        <ScreenShake active={shakeBoard} intensity={shakeIntensity} style={styles.board}>
          <Animated.View style={[styles.boardInner, boardEnterStyle]}>
            <GameBoardFrame>
              <View style={styles.gridStack}>
                <GameGrid
                  ref={gridRef}
                  grid={grid}
                  cellSize={cellSize}
                  ghostCells={ghostCells}
                  ghostColor={dragMeta?.piece.color ?? null}
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
            </GameBoardFrame>
          </Animated.View>
        </ScreenShake>

        <Animated.View style={trayEnterStyle}>
          <PieceTray
            pieces={currentPieces}
            usedPieces={usedPieces}
            cellSize={cellSize}
            draggingIndex={dragMeta?.pieceIndex ?? null}
            canInteract={canInteract}
            onDragStart={startDrag}
            onDragMove={moveDrag}
            onDragEnd={endDrag}
          />
        </Animated.View>

        <AdBanner />
      </SafeAreaView>

      <GameOverOverlay
        visible={isGameOver}
        score={score}
        bestScore={bestScore}
        isNewBest={isRunNewBest()}
        onPlayAgain={startNewGame}
        onWatchContinue={handleWatchContinue}
        onGoHome={handleGoHome}
      />

      <View
        ref={dragHostRef}
        style={styles.dragLayer}
        pointerEvents="box-none"
        onLayout={measureDragHostWindow}
        collapsable={false}
      >
        {dragMeta && (
          <DragOverlay
            piece={dragMeta.piece}
            cellSize={dragMeta.cellSize}
            width={dragMeta.width}
            height={dragMeta.height}
            overlayX={overlayX}
            overlayY={overlayY}
            overlayVisible={overlayVisible}
            hostOriginX={hostOriginX}
            hostOriginY={hostOriginY}
          />
        )}
      </View>
      </View>
    </NeonBackdrop>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  backBtn: {
    marginRight: spacing.xs,
    minWidth: spacing.minTouchTarget,
  },
  board: {
    flex: 1,
    justifyContent: 'center',
  },
  boardInner: {
    alignSelf: 'center',
  },
  gridStack: {
    position: 'relative',
  },
  dragLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 500,
    elevation: 500,
  },
});
