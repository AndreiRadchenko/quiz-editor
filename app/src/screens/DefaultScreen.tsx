import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
  use,
} from 'react';
// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  LayoutAnimationConfig,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';
// import { Gesture } from 'react-native-gesture-handler';
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
import PlayerItemOperator from '../components/PlayerItemOperator';
import { updateSeatEditorIndex } from '../api';
import SimplePlayerItem from '../components/simplePlayerItem';
import { queryClient } from '../store/queryClient';
import PlayerItemSkeleton from '../components/PlayerItemSkeleton';

// const MemoizedPlayerItem = memo(SimplePlayerItem);
const MemoizedPlayerItemOperator = memo(PlayerItemOperator);

const DefaultScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { role, serverIP } = useAppContext();
  const { quizState } = useWebSocketContext();
  const [players, setPlayers] = useState<SeatDataType[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const isPreparing = useRef(false);

  // Use the player state hook to fetch players data
  const { getPlayersData } = usePlayerState();
  const { data: playersData, isLoading: playersLoading } =
    getPlayersData('editor');

  // When playersData changes, update our local state
  useEffect(() => {
    isPreparing.current = true; // Set preparing state to true
    if (playersData) {
      const playersList = Array.isArray(playersData)
        ? playersData
        : [playersData];
      if (
        quizState?.state &&
        ['QUESTION_COMPLETE', 'BUYOUT_COMPLETE'].includes(quizState.state)
      ) {
        setPlayers(playersList);
      } else if (
        quizState?.state &&
        ['QUESTION_PRE', 'IDLE'].includes(quizState.state)
      ) {
        setPlayers([]);
      }
    }
    setTimeout(() => {
      isPreparing.current = false; // Reset preparing state after processing
    }, 0); // Use setTimeout to ensure state update happens after current render
  }, [playersData, quizState?.state]);

  // Function to handle player reordering (only for editors)
  const handlePlayersReorder = useCallback(
    (newData: SeatDataType[], from: number, to: number) => {
      const seatToUpdate = newData[to].seat;
      console.log(`Updating seat ${seatToUpdate} to position ${to}`);

      setPlayers(newData);
      setUpdateCounter(prev => prev + 1);
      updateSeatEditorIndex(seatToUpdate, to, serverIP);
    },
    []
  );

  const moveToTop = (id: number) => {
    const playerIndex = players.findIndex(
      player => Number(player.id) === Number(id)
    );
    if (playerIndex <= 0) {
      return;
    }
    const playerToMove = players[playerIndex];
    const newData = reorderItems(players, playerIndex, 0);
    setPlayers(newData);
    setUpdateCounter(prev => prev + 1);
    updateSeatEditorIndex(playerToMove.seat, 0, serverIP);
  };

  const moveToBottom = useCallback(
    (id: number) => {
      const playerIndex = players.findIndex(
        player => Number(player.id) === Number(id)
      );
      if (playerIndex >= players.length - 1) {
        return;
      }
      const playerToMove = players[playerIndex];
      const newData = reorderItems(players, playerIndex, players.length - 1);
      setPlayers(newData);
      setUpdateCounter(prev => prev + 1);
      updateSeatEditorIndex(playerToMove.seat, players.length - 1, serverIP);
    },
    [players, serverIP]
  );

  const renderPlayerItem = useCallback(
    ({ item }: { item: SeatDataType }) => {
      if (role === 'operator') {
        return (
          <MemoizedPlayerItemOperator
            item={item}
            role={role}
            moveToTop={moveToTop}
            moveToBottom={moveToBottom}
          />
        );
      } else {
        return (
          <PlayerItem
            item={item}
            role={role}
            moveToTop={moveToTop}
            moveToBottom={moveToBottom}
          />
        );
      }
    },
    [role, moveToTop, moveToBottom, players]
  );
  // // Create an animated scroll handler for smooth scrolling
  // const scrollHandler = useAnimatedScrollHandler({
  //   onScroll: () => {
  //     // Additional scroll animations can be added here if needed
  //   },
  // });

  // // Drag start handler (worklet function)
  // const handleDragStart = useCallback((event: { index: number }) => {
  //   'worklet';
  //   console.log('Drag started at index:', event.index);
  // }, []);

  // // Drag end handler (worklet function) - more detailed logging and feedback
  // const handleDragEnd = useCallback((event: { from: number; to: number }) => {
  //   'worklet';

  //   if (event.from !== event.to) {
  //     console.log(`Player moved from position ${event.from} to ${event.to}`);
  //   } else {
  //     console.log('Player position unchanged');
  //   }
  // }, []);

  // Function to generate skeleton items
  const getSkeletonData = useCallback(() => {
    // Create 8 skeleton items (or however many you want to show while loading)
    return Array(8)
      .fill(0)
      .map((_, index) => ({
        id: `skeleton-${index}`,
        seat: index,
        player: null,
      }));
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
          {playersLoading && isPreparing.current ? (
            // Skeleton loader when loading
            <FlatList
              data={getSkeletonData()}
              renderItem={() => <PlayerItemSkeleton />}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContainer}
            />
          ) : players.length > 0 ? (
            role === 'editor' ? (
              <ReorderableList
                data={players}
                onReorder={({ from, to }: ReorderableListReorderEvent) => {
                  console.log(`Reordering from ${from} to ${to}`);
                  const newData = reorderItems(players, from, to);
                  handlePlayersReorder(newData, from, to);
                }}
                keyExtractor={item => `player-${item.id}-${item.seat}`}
                extraData={updateCounter}
                renderItem={renderPlayerItem}
                shouldUpdateActiveItem={true}
                contentContainerStyle={styles.listContainer}
                autoscrollThreshold={0.1}
                autoscrollActivationDelta={5}
                autoscrollSpeedScale={3}
                animationDuration={100}
                dragEnabled={true}
                cellAnimations={{
                  opacity: 0.9,
                  transform: [{ scale: 1.01 }],
                }}
                itemLayoutAnimation={LinearTransition}
              />
            ) : (
              <Animated.FlatList
                data={players}
                renderItem={renderPlayerItem}
                extraData={updateCounter}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                itemLayoutAnimation={LinearTransition}
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
