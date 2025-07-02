import React, { memo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useReorderableDrag, useIsActive } from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { SeatDataType } from '../types';
import { useAppContext } from '../context/AppContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRelations } from '../hooks/useRelations';

interface PlayerItemProps {
  item: SeatDataType;
  role?: string;
  moveToTop?: (id: number) => void;
  moveToBottom?: (id: number) => void;
}

export const PlayerItem = ({
  item,
  role,
  moveToTop,
  moveToBottom,
}: PlayerItemProps) => {
  // Use the hook to enable dragging for reorderable list
  let drag: () => void = () => {};
  if (role === 'editor') {
    drag = useReorderableDrag();
  }

  // Add shared values for animations
  const pressed = useSharedValue(false);

  const player = item.player;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { serverIP } = useAppContext();

  if (!player) return null;

  const playerAnswer = player.currentAnswer || '';
  const usedPasses =
    player.usedPassOne && player.usedPassTwo
      ? 2
      : player.usedPassOne || player.usedPassTwo
        ? 1
        : 0;

  const playerRelationsWithRole =
    player.relations && player.relations.length > 0
      ? useRelations(player.relations, role || '')
      : [];

  // Use player.image if available, otherwise use a placeholder
  const playerImageSource = player.image
    ? { uri: `http://${serverIP}:9002/players/${player.image}` }
    : require('../assets/images/logo.png');

  const styles = StyleSheet.create({
    playerItem: {
      flex: 1,
      backgroundColor: theme.colors.primaryHover,
      borderRadius: theme.borderRadius.md,
      padding: 0,
      marginBottom: theme.spacing.sm,
      // A simpler approach - just use elevation for Android
      elevation: 3,
      // For iOS, add a thin border instead of shadow to avoid styling issues
      ...Platform.select({
        ios: {
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
        },
      }),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
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
    activeItem: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: {
          // Android elevation is handled in the animated style
        },
      }),
    },
    shadowContainer: {
      // This wrapper ensures we don't have shadow styling issues
      marginBottom: theme.spacing.md,
    },
    pressable: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dragHandle: {
      left: -8,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10, // Ensure it's above other elements
    },
    dragHandleDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.85)', // Brighter for better visibility
      margin: 2.5,
    },
    container: {
      paddingVertical: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.md, // Increased right padding to make room for quick action buttons
      flexDirection: 'row',
      position: 'relative',
    },
    imageContainer: {
      width: 90,
      height: 120,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.md,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'column',
    },
    playerImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
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
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.semibold,
    },
    value: {
      color: '#FFD700', // Gold color for values
      fontWeight: theme.fontWeight.semibold,
      fontSize: theme.fontSize.lg,
    },
    valueOperator: {
      color: theme.colors.primaryForeground, // Gold color for values
      fontWeight: theme.fontWeight.normal,
      fontSize: theme.fontSize.lg,
    },
    occupation: {
      color: 'white',
      marginBottom: theme.spacing.xs,
      fontSize: theme.fontSize.base,
    },
    notes: {
      color: 'white',
      marginBottom: theme.spacing.xs,
      fontSize: theme.fontSize.base,
    },
    goal: {
      color: 'white',
      marginBottom: theme.spacing.xs,
      fontSize: theme.fontSize.base,
    },
    thirdRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    companyContainer: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      // gap: theme.spacing.sm,
    },
    companyContainerOperator: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      // gap: theme.spacing.sm,
    },
    company: {
      color: 'white',
      fontWeight: theme.fontWeight.medium,
    },
    relations: {
      color: 'white',
      fontSize: theme.fontSize.base,
      width: '92%',
    },
    relationList: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: 300,
    },
    relationListOperator: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      // width: 300,
    },
    answerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
      maxWidth: 200,
    },
    answerLabel: {
      color: 'white',
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.semibold,
      marginRight: theme.spacing.xs,
    },
    answer: {
      color: '#FFD700', // Gold color for answer
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize.base,
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
      marginTop: -8, // Adjusted to align with the container
      marginBottom: -8,
    },
    quickActionButton: {
      width: 54,
      height: 62, // Slightly larger for easier tapping
      borderRadius: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker for better contrast
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
      transform: [{ scale: 0.95 }], // Slight scale effect for feedback
    },
    buttonTooltip: {
      position: 'absolute',
      right: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      color: 'white',
      fontSize: theme.fontSize.sm,
      opacity: 0,
      width: 0,
      height: 0,
      overflow: 'hidden',
    },
    buttonTooltipVisible: {
      opacity: 1,
      width: 'auto',
      height: 'auto',
    },
  });

  // Using Animated.View for proper animations during drag
  return (
    <Animated.View
      style={[
        styles.playerItem,
        player.isAnswerCorrect === true && styles.playerItemCorrect,
        player.isAnswerCorrect === false && styles.playerItemIncorrect,
        player.isAnswerPass === true && styles.playerItemPass,
      ]}
    >
      <Pressable style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image source={playerImageSource} style={styles.playerImage} />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.topRow}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: theme.spacing.md,
                }}
              >
                <Text style={styles.label}>
                  {t('playerItem.seatLabel')}{' '}
                  <Text style={styles.value}>{item.seat}</Text>
                </Text>
                <Text style={styles.label}>
                  <Text style={styles.valueOperator}>{item.cameras}</Text>
                </Text>
                <Text style={styles.valueOperator}>{item.description}</Text>
              </View>
            </View>
            {playerRelationsWithRole && playerRelationsWithRole.length > 0 && (
              <View style={styles.companyContainerOperator}>
                <Text style={styles.answerLabel}>
                  {t('playerItem.companyLabel')}
                </Text>
                <View style={styles.relationListOperator}>
                  {playerRelationsWithRole.map((relation, index) => relation)}
                </View>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default PlayerItem;
