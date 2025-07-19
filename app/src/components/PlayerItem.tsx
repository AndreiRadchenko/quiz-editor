import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useReorderableDrag } from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { SeatDataType } from '../types';
import { useAppContext } from '../context/AppContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useWebSocketContext } from '../context/WebSocketContext';
import RelationsDisplay from '../components/RelationsDisplay';

// Move styles outside component to prevent recreation on every render
const createStyles = (theme: any) =>
  StyleSheet.create({
    playerItem: {
      flex: 1,
      opacity: 0.65,
      backgroundColor: theme.colors.muted,
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
    },

    playerItemActive: {
      borderLeftWidth: 4,
      backgroundColor: theme.colors.primaryHover,
      opacity: 1,
    },
    playerItemCorrect: {
      borderLeftWidth: 4,
      backgroundColor: '#1c6d1f', // Green
      opacity: 1,
    },
    playerItemIncorrect: {
      borderLeftWidth: 4,
      backgroundColor: '#8b0d0d', // Red
      opacity: 1,
    },
    playerItemPass: {
      borderLeftWidth: 4,
      backgroundColor: '#510bf5', // Amber/orange color for pass
      opacity: 1,
    },
    playerItemBoughtOut: {
      borderLeftWidth: 4,
      backgroundColor: '#b89217', // Amber/orange color for pass
      opacity: 1,
    },
    activeItem: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
      }),
    },
    shadowContainer: {
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
      zIndex: 10,
    },
    dragHandleDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      margin: 2.5,
    },
    container: {
      paddingVertical: theme.spacing.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing['3xl'],
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
    // modalOverlay: {
    //   flex: 1,
    //   backgroundColor: 'rgba(0, 0, 0, 0.65)',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    // },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000, // Ensure it's above everything else
    },
    // Add this new style specifically for Android production builds
    androidModalFix: {
      // Negative top margin to ensure coverage of status bar area
      marginTop: -50, // Generous value to cover any potential status bar
      // Extra height to compensate for the negative margin
      height: Dimensions.get('window').height + 50,
    },
    modalContent: {
      width: '70%',
      aspectRatio: 3 / 4,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 4,
        height: 6,
      },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 15,
      overflow: 'hidden',
    },
    fullSizeImage: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
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
      flexDirection: 'row',
      gap: theme.spacing.sm,
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
      color: '#FFD700',
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
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Add shared values for animations
  const pressed = useSharedValue(false);

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { serverIP } = useAppContext();
  const { quizState, playersQuery } = useWebSocketContext();
  const player = item.player;

  // Ensure relations is an array
  const safeRelations =
    Array.isArray(player?.relations) && player.relations[0] !== ''
      ? player.relations
      : [];

  // Use player.image if available, otherwise use a placeholder
  const playerImageSource = useMemo(() => {
    return player?.image
      ? { uri: `http://${serverIP}:9002/players/${player.image}` }
      : require('../assets/images/logo.png');
  }, [player?.image, serverIP]);

  // Memoize styles to prevent recreation on each render
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Memoize handlers to prevent recreation on each render
  const handleMoveToTop = useCallback(() => {
    moveToTop && moveToTop(Number(item.id));
  }, [moveToTop, item.id]);

  const handleMoveToBottom = useCallback(() => {
    moveToBottom && moveToBottom(Number(item.id));
  }, [moveToBottom, item.id]);

  // Add handler to toggle modal visibility
  const toggleImageModal = useCallback(() => {
    setImageModalVisible(prev => !prev);
  }, []);

  if (!player) return null;

  const playerAnswer = player.currentAnswer || '';
  const usedPasses =
    player.usedPassOne && player.usedPassTwo
      ? 2
      : player.usedPassOne || player.usedPassTwo
        ? 1
        : 0;

  // Using Animated.View for proper animations during drag
  return (
    <Animated.View
      style={[
        styles.playerItem,
        player.isActive === true && styles.playerItemActive,
        player.isAnswerCorrect === true && styles.playerItemCorrect,
        player.isAnswerCorrect === false &&
          quizState?.state !== 'BUYOUT_COMPLETE' &&
          styles.playerItemIncorrect,
        player.isAnswerPass === true && styles.playerItemPass,
        player.isAnswerBoughtOut === true && styles.playerItemBoughtOut,
      ]}
    >
      {/* Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={toggleImageModal}
        statusBarTranslucent={true} // This is key for Android
        hardwareAccelerated={true}
        presentationStyle="overFullScreen" // This is for iOS
      >
        {/* Force status bar configuration when modal opens */}
        <StatusBar
          backgroundColor="transparent"
          translucent={true}
          barStyle="light-content"
        />
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            Platform.OS === 'android' && styles.androidModalFix,
          ]}
          activeOpacity={1}
          onPress={toggleImageModal}
        >
          <View style={styles.modalContent}>
            <Image
              source={playerImageSource}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
      <Pressable
        style={{ flex: 1 }}
        onLongPress={role === 'editor' ? drag : undefined}
        onPressIn={() => {
          if (role === 'editor') {
            pressed.value = true;
          }
        }}
        onPressOut={() => {
          pressed.value = false;
        }}
        delayLongPress={200}
        disabled={
          role !== 'editor' ||
          (quizState?.state &&
            !['QUESTION_COMPLETE', 'BUYOUT_COMPLETE'].includes(
              quizState?.state
            ))
        }
      >
        <View style={styles.container}>
          {/* Drag handle indicator (visible only for editors) */}
          {role === 'editor' && (
            <View style={styles.pressable}>
              <View style={styles.dragHandle}>
                <View style={styles.dragHandleDot} />
                <View style={styles.dragHandleDot} />
                <View style={styles.dragHandleDot} />
              </View>
            </View>
          )}
          {/* <View style={styles.imageContainer}>
            <Image source={playerImageSource} style={styles.playerImage} />
          </View> */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={toggleImageModal}
            activeOpacity={0.8}
          >
            <Image source={playerImageSource} style={styles.playerImage} />
          </TouchableOpacity>
          <View style={styles.infoContainer}>
            <View style={styles.topRow}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.rowContainer}>
                <Text style={styles.label}>
                  {t('playerItem.rankLabel')}{' '}
                  <Text style={styles.value}>{player.rank || ''}</Text>
                </Text>
                <Text style={styles.label}>
                  {t('playerItem.usedPassesLabel')}{' '}
                  <Text style={styles.value}>{usedPasses}</Text>
                </Text>
                <Text style={styles.label}>
                  {t('playerItem.seatLabel')}{' '}
                  <Text style={styles.value}>{item.seat}</Text>
                </Text>
              </View>
            </View>

            {player.occupation && (
              <Text style={styles.occupation}>{player.occupation || ''}</Text>
            )}
            {player.notes && (
              <Text style={styles.notes}>{player.notes || ''}</Text>
            )}
            {player.goal && (
              <Text style={styles.goal}>{player.goal || ''}</Text>
            )}

            <View style={styles.thirdRow}>
              <View style={styles.answerContainer}>
                {playerAnswer && (
                  <>
                    <Text style={styles.answerLabel}>
                      {t('playerItem.answerLabel')}
                    </Text>
                    <Text style={styles.answer}>{playerAnswer || '-'}</Text>
                  </>
                )}
              </View>

              {safeRelations && safeRelations.length > 0 && (
                <View style={styles.companyContainer}>
                  <Text style={styles.answerLabel}>
                    {t('playerItem.companyLabel')}
                  </Text>
                  <View style={styles.relationList}>
                    <RelationsDisplay
                      relations={safeRelations}
                      role={role || 'general'}
                      playersData={playersQuery.data || []}
                      isLoading={playersQuery.isLoading}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Quick action buttons for moving item to top/bottom */}
          {role &&
            ['editor'].includes(role) &&
            quizState?.state &&
            ['QUESTION_COMPLETE', 'BUYOUT_COMPLETE'].includes(
              quizState?.state
            ) && (
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
                  <MaterialIcons
                    name="arrow-downward"
                    size={32}
                    color="white"
                  />
                </Pressable>
              </View>
            )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Custom comparison function for React.memo to prevent unnecessary re-renders
const areEqual = (prevProps: PlayerItemProps, nextProps: PlayerItemProps) => {
  // Compare basic props
  if (
    prevProps.item.id !== nextProps.item.id ||
    prevProps.role !== nextProps.role ||
    prevProps.item.seat !== nextProps.item.seat
  ) {
    return false;
  }

  // Deep compare player data that affects rendering
  const prevPlayer = prevProps.item.player;
  const nextPlayer = nextProps.item.player;

  if (!prevPlayer || !nextPlayer) {
    return prevPlayer === nextPlayer;
  }

  return true;
  // prevPlayer.name === nextPlayer.name &&
  // prevPlayer.rank === nextPlayer.rank &&
  // prevPlayer.isAnswerCorrect === nextPlayer.isAnswerCorrect &&
  // prevPlayer.isAnswerPass === nextPlayer.isAnswerPass &&
  // prevPlayer.isAnswerBoughtOut === nextPlayer.isAnswerBoughtOut &&
  // prevPlayer.currentAnswer === nextPlayer.currentAnswer &&
  // prevPlayer.usedPassOne === nextPlayer.usedPassOne &&
  // prevPlayer.usedPassTwo === nextPlayer.usedPassTwo &&
  // prevPlayer.occupation === nextPlayer.occupation &&
  // prevPlayer.notes === nextPlayer.notes &&
  // prevPlayer.goal === nextPlayer.goal &&
  // prevPlayer.image === nextPlayer.image
};

// Export memoized component with custom comparison function
export const MemoizedPlayerItem = memo(PlayerItem, areEqual);
