import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { SeatDataType } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

// Move styles outside component to prevent recreation on every render
const createStyles = (theme: any) =>
  StyleSheet.create({
    playerItem: {
      flex: 1,
      backgroundColor: theme.colors.primaryHover,
      borderRadius: theme.borderRadius.md,
      padding: 0,
      marginBottom: theme.spacing.sm,
      elevation: 3,
      ...Platform.select({
        ios: {
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        },
      }),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: 150, // Fixed height for player items
    },
    playerItemCorrect: {
      borderLeftWidth: 4,
      backgroundColor: '#1c6d1f', // Green
    },
    playerItemIncorrect: {
      borderLeftWidth: 4,
      backgroundColor: '#8b0d0d', // Red
    },
    playerItemPass: {
      borderLeftWidth: 4,
      backgroundColor: '#510bf5', // Amber/orange color for pass
    },
    playerItemBoughtOut: {
      borderLeftWidth: 4,
      backgroundColor: '#b89217', // Amber/orange color for pass
    },
    container: {
      paddingVertical: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing['3xl'],
      flexDirection: 'row',
      position: 'relative',
    },
    infoContainer: {
      flex: 1,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    playerName: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: 'white',
    },
    label: {
      textAlign: 'right',
      color: 'white',
      width: 90,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.semibold,
    },
    value: {
      color: '#FFD700',
      fontWeight: theme.fontWeight.semibold,
      fontSize: theme.fontSize.lg,
    },
    quickActionsContainer: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      zIndex: 5,
      flexDirection: 'column',
      elevation: 5,
      marginTop: -8,
      marginBottom: -8,
    },
    quickActionButton: {
      width: 54,
      height: 62,
      borderRadius: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 6,
      elevation: Platform.OS === 'android' ? 3 : 0,
      shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
      shadowOffset:
        Platform.OS === 'ios'
          ? { width: 0, height: 2 }
          : { width: 0, height: 0 },
      shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0,
      shadowRadius: Platform.OS === 'ios' ? 3 : 0,
    },
    quickActionButtonActive: {
      backgroundColor: 'rgba(0, 120, 255, 0.8)',
      transform: [{ scale: 0.95 }],
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  });

interface PlayerItemProps {
  item: SeatDataType;
  role?: string;
  moveToTop?: (id: number) => void;
  moveToBottom?: (id: number) => void;
}

const SimplePlayerItem = ({
  item,
  role,
  moveToTop,
  moveToBottom,
}: PlayerItemProps) => {
  const player = item.player;
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Memoize styles
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Memoize handlers to prevent recreation on each render
  const handleMoveToTop = useCallback(() => {
    if (moveToTop) moveToTop(Number(item.id));
  }, [moveToTop, item.id]);

  const handleMoveToBottom = useCallback(() => {
    if (moveToBottom) moveToBottom(Number(item.id));
  }, [moveToBottom, item.id]);

  if (!player) return null;

  const showActions = role && ['editor', 'general'].includes(role);

  return (
    <View
      style={[
        styles.playerItem,
        player.isAnswerCorrect === true && styles.playerItemCorrect,
        player.isAnswerCorrect === false && styles.playerItemIncorrect,
        player.isAnswerPass === true && styles.playerItemPass,
        player.isAnswerBoughtOut === true && styles.playerItemBoughtOut,
      ]}
    >
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <View style={styles.topRow}>
            <Text style={styles.playerName}>{player.name}</Text>
            <View style={styles.rowContainer}>
              <Text style={styles.label}>
                {t('playerItem.rankLabel')}{' '}
                <Text style={styles.value}>{player.rank || ''}</Text>
              </Text>
              <Text style={styles.label}>
                {t('playerItem.seatLabel')}{' '}
                <Text style={styles.value}>{item.seat}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Quick action buttons for moving item to top/bottom */}
        {showActions && (
          <View style={styles.quickActionsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.quickActionButton,
                pressed && styles.quickActionButtonActive,
              ]}
              onPress={handleMoveToTop}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              pressRetentionOffset={{
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              }}
              disabled={!moveToTop}
            >
              <MaterialIcons name="arrow-upward" size={32} color="white" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.quickActionButton,
                pressed && styles.quickActionButtonActive,
              ]}
              onPress={handleMoveToBottom}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              pressRetentionOffset={{
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              }}
              disabled={!moveToBottom}
            >
              <MaterialIcons name="arrow-downward" size={32} color="white" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

// Custom comparison function for React.memo
const areEqual = (prevProps: PlayerItemProps, nextProps: PlayerItemProps) => {
  // Only re-render if these props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.seat === nextProps.item.seat &&
    prevProps.role === nextProps.role &&
    JSON.stringify(prevProps.item.player) ===
      JSON.stringify(nextProps.item.player)
  );
};

// Export memoized component
export default memo(SimplePlayerItem, areEqual);
