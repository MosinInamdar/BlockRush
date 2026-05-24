import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[AppErrorBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            BlockRush hit an unexpected error. You can try again — your saved game may still be
            on device.
          </Text>
          {__DEV__ && (
            <Text style={styles.debug} numberOfLines={4}>
              {this.state.error.message}
            </Text>
          )}
          <Pressable
            style={styles.button}
            onPress={this.handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.score,
    color: colors.block.hotPink,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  debug: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.block.hotPink,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minHeight: spacing.minTouchTarget,
    minWidth: spacing.minTouchTarget * 2,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});
