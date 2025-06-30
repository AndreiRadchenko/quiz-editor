import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  unstable_batchedUpdates,
} from 'react-native';
import { useAnimatedScrollHandler } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useTheme } from '../theme';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QuizHeader } from '../components/QuizHeader';
import { useAppContext } from '../context/AppContext';
// import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { usePlayerState } from '../hooks/usePlayerState';
import { SeatDataType } from '../types';
import PlayerItem from '../components/PlayerItem';
import { memo } from 'react';

const MemoizedPlayerItem = memo(PlayerItem);

const DefaultScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { role } = useAppContext();
  const { quizState } = useWebSocketContext();
  const [players, setPlayers] = useState<SeatDataType[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);

  // Use the player state hook to fetch players data
  const { getPlayersData } = usePlayerState();
  const { data: playersData, isLoading: playersLoading } =
    getPlayersData('editor');

  // When playersData changes, update our local state
  useEffect(() => {
    if (playersData) {
      const playersList = Array.isArray(playersData)
        ? playersData
        : [playersData];

      setPlayers(playersList);
    }
  }, [playersData]);

  // Function to handle player reordering (only for editors)
  const handlePlayersReorder = useCallback((newData: SeatDataType[]) => {
    setPlayers(newData);
    // Here you would typically send the new order to your API
    // We're just updating the state here for the demo
    // console.log(
    //   'Players reordered:',
    //   newData.map(p => p.id)
    // );
  }, []);

  const moveToTop = useCallback((id: number) => {
    setPlayers(prevPlayers => {
      const playerIndex = prevPlayers.findIndex(
        player => Number(player.id) === Number(id)
      );
      if (playerIndex <= 0) return prevPlayers;

      const playerToMove = prevPlayers[playerIndex];
      const remainingPlayers = prevPlayers.filter(
        (_, index) => index !== playerIndex
      );
      const newPlayers = [playerToMove, ...remainingPlayers];
      return newPlayers;
    });
    console.log(`Moved player ${id} to the top`);
    setUpdateCounter(prev => prev + 1);
  }, []);

  const moveToBottom = useCallback((id: number) => {
    setPlayers(prevPlayers => {
      const playerIndex = prevPlayers.findIndex(
        player => Number(player.id) === Number(id)
      );
      if (playerIndex > prevPlayers.length - 1) return prevPlayers;

      const playerToMove = prevPlayers[playerIndex];
      const remainingPlayers = prevPlayers.filter(
        (_, index) => index !== playerIndex
      );
      const newPlayers = [...remainingPlayers, playerToMove];
      return newPlayers;
    });
    console.log(`Moved player ${id} to the bottom`);
    setUpdateCounter(prev => prev + 1);
  }, []);

  const renderPlayerItem = useCallback(
    ({ item }: { item: SeatDataType }) => {
      return (
        <MemoizedPlayerItem
          item={item}
          role={role}
          moveToTop={moveToTop}
          moveToBottom={moveToBottom}
        />
      );
    },
    [role, moveToTop, moveToBottom]
  );
  // Create an animated scroll handler for smooth scrolling
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: () => {
      // Additional scroll animations can be added here if needed
    },
  });

  // Drag start handler (worklet function)
  const handleDragStart = useCallback((event: { index: number }) => {
    'worklet';
    console.log('Drag started at index:', event.index);
  }, []);

  // Drag end handler (worklet function) - more detailed logging and feedback
  const handleDragEnd = useCallback((event: { from: number; to: number }) => {
    'worklet';

    if (event.from !== event.to) {
      console.log(`Player moved from position ${event.from} to ${event.to}`);
    } else {
      console.log('Player position unchanged');
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      // padding: theme.spacing.xs,
    },
    section: {
      flex: 1,
      marginBottom: theme.spacing['2xl'],
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.foreground,
    },
    listContainer: {
      paddingBottom: theme.spacing.lg,
    },
    emptyText: {
      textAlign: 'center',
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize.base,
      marginTop: 50,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <QuizHeader
        tierLegend={quizState?.tierLegend}
        state={quizState?.state}
        questionLabel={quizState?.questionLabel}
        correctAnswer={quizState?.correctAnswer}
        timerStatus={quizState?.timerStatus}
        prizePool={quizState?.prizePool}
        prizeChange={quizState?.prizeChange}
        remainingPlayers={quizState?.remainingPlayers}
        eliminatedPlayers={quizState?.eliminatedPlayers}
        correctAnswers={quizState?.correctAnswers}
        incorrectAnswers={quizState?.incorrectAnswers}
        passes={quizState?.passes}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.section}>
          {/* Players content */}
          {playersLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>
                {t('defaultScreen.loadingPlayers')}
              </Text>
            </View>
          ) : players.length > 0 ? (
            role === 'editor' ? (
              <ReorderableList
                data={players}
                onReorder={({ from, to }: ReorderableListReorderEvent) => {
                  console.log(`Reordering from ${from} to ${to}`);
                  const newData = reorderItems(players, from, to);
                  handlePlayersReorder(newData);
                }}
                keyExtractor={(item: SeatDataType) => item.id.toString()}
                extraData={`${updateCounter}-${players.map(p => p.id).join('-')}`}
                renderItem={renderPlayerItem}
                contentContainerStyle={styles.listContainer}
                autoscrollThreshold={0.1} // Optimized threshold for better scrolling
                autoscrollActivationDelta={5} // Reduced activation delta for quicker response
                autoscrollSpeedScale={3} // Balanced for smoother scrolling
                animationDuration={1} // Even faster animations for better responsiveness
                dragEnabled={true}
                // shouldUpdateActiveItem={true}
                // onScroll={scrollHandler}
                // onDragStart={handleDragStart}
                // onDragEnd={handleDragEnd}
                // Custom cell animations to control opacity and transform (scale)
                // cellAnimations={{
                //   // Set to 1 to disable opacity animation, or adjust as needed (0.8-0.95 is subtle)
                //   opacity: 1,
                //   // Override the default transform animations
                //   transform: [
                //     // Set scale to 1 to completely disable scaling, or use a subtle value
                //     { scale: 1.03 },
                //     // Optionally add a slight translation for visual feedback
                //     // { translateY: -2 },
                //   ],
                // }}
              />
            ) : (
              <FlatList
                data={players}
                renderItem={renderPlayerItem}
                extraData={`${updateCounter}-${players.map(p => p.id).join('-')}`}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
              />
            )
          ) : (
            <Text style={styles.emptyText}>
              {t('defaultScreen.noPlayersFound')}
            </Text>
          )}
        </View>
      </View>

      {/* Connection Status at bottom */}
      <ConnectionStatus />
    </View>
  );
};

export default DefaultScreen;
