import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useReorderableDrag, useIsActive } from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { SeatDataType } from '../types';
import { useAppContext } from '../context/AppContext';
import { useRelations } from '../hooks/useRelations';
import { useWebSocketContext } from '../context/WebSocketContext';

const createStyles = (theme: any) =>
  StyleSheet.create({
    playerItem: {
      flex: 1,
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
interface PlayerItemProps {
  item: SeatDataType;
  role?: string;
  moveToTop?: (id: number) => void;
  moveToBottom?: (id: number) => void;
}

export const PlayerItem = ({ item, role }: PlayerItemProps) => {
  // Use the hook to enable dragging for reorderable list
  let drag: () => void = () => {};
  if (role === 'editor') {
    drag = useReorderableDrag();
  }

  // Add state for modal visibility
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const player = item.player;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { serverIP } = useAppContext();
  const { quizState } = useWebSocketContext();

  if (!player) return null;

  const playerRelationsWithRole =
    player.relations && player.relations.length > 0
      ? useRelations(player.relations, role || '')
      : [];

  // Use player.image if available, otherwise use a placeholder
  const playerImageSource = player.image
    ? { uri: `http://${serverIP}:9002/players/${player.image}` }
    : require('../assets/images/logo.png');

  // Memoize styles to prevent recreation on each render
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Add handler to toggle modal visibility
  const toggleImageModal = useCallback(() => {
    setImageModalVisible(prev => !prev);
  }, []);

  // Using Animated.View for proper animations during drag
  return (
    <View
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
        presentationStyle="overFullScreen" // This is for iOS
      >
        <TouchableOpacity
          style={styles.modalOverlay}
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

      <Pressable style={{ flex: 1 }}>
        <View style={styles.container}>
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
    </View>
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

  return (
    prevPlayer.name === nextPlayer.name &&
    prevPlayer.rank === nextPlayer.rank &&
    prevPlayer.isAnswerCorrect === nextPlayer.isAnswerCorrect &&
    prevPlayer.isAnswerPass === nextPlayer.isAnswerPass &&
    prevPlayer.isAnswerBoughtOut === nextPlayer.isAnswerBoughtOut &&
    prevPlayer.currentAnswer === nextPlayer.currentAnswer &&
    prevPlayer.usedPassOne === nextPlayer.usedPassOne &&
    prevPlayer.usedPassTwo === nextPlayer.usedPassTwo &&
    prevPlayer.occupation === nextPlayer.occupation &&
    prevPlayer.notes === nextPlayer.notes &&
    prevPlayer.goal === nextPlayer.goal &&
    prevPlayer.image === nextPlayer.image
  );
};

// const MemoizedPlayerItem = memo(PlayerItem, areEqual);
export default PlayerItem;
