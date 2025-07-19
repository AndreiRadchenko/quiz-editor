import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { throttle } from 'lodash';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';
import { useTranslation } from 'react-i18next';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useTheme } from '../theme';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QuizHeader } from '../components/QuizHeader';
import { useAppContext } from '../context/AppContext';
import { SeatDataType } from '../types';
import { PlayerItem } from '../components/PlayerItem';
import PlayerItemOperator from '../components/PlayerItemOperator';
import { updateSeatEditorIndex } from '../api';
import PlayerItemSkeleton from '../components/PlayerItemSkeleton';
import ScrollToTopButton from '../components/ScrollToTopButton';

const DefaultScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { role, serverIP } = useAppContext();
  const { quizState, playersQuery } = useWebSocketContext();
  const [players, setPlayers] = useState<SeatDataType[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef<any>(null);
  const scrollY = useSharedValue(0);

  // Use the player state hook to fetch players data
  const { data: playersData, isLoading: playersLoading } = playersQuery;
  const isPreparing = useRef(false);

  // When playersData changes, update our local state
  useEffect(() => {
    isPreparing.current = true; // Set preparing state to true
    if (playersData) {
      const playersList = Array.isArray(playersData)
        ? playersData
        : [playersData];
      if (
        quizState?.state &&
        [
          'QUESTION_PRE',
          'IDLE',
          'QUESTION_OPEN',
          'QUESTION_CLOSED',
          'BUYOUT_OPEN',
          'QUESTION_COMPLETE',
          'BUYOUT_COMPLETE',
        ].includes(quizState.state)
      ) {
        setPlayers(playersList);
      }
    }
    setTimeout(() => {
      isPreparing.current = false; // Reset preparing state after processing
    }, 50); // Use setTimeout to ensure state update happens after current render
  }, [playersData, quizState?.state]);

  const throttledSetVisibility = useMemo(
    () =>
      throttle(
        (currentOffset: number) => {
          setShowScrollButton(currentOffset > 100);
        },
        200, // The throttle interval in milliseconds.
        { leading: true, trailing: true } // Options to ensure responsiveness.
      ),
    []
  );
  // Replace your handleScroll with useAnimatedScrollHandler for ReorderableList
  const animatedScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
      runOnJS(throttledSetVisibility)(event.contentOffset.y);
    },
  });
  // const animatedScrollHandler = useAnimatedScrollHandler({
  //   onScroll: event => {
  //     scrollY.value = event.contentOffset.y;
  //     // Update React state from worklet context using runOnJS
  //     if (event.contentOffset.y > 100 && !showScrollButton) {
  //       runOnJS(setShowScrollButton)(true);
  //     } else if (event.contentOffset.y <= 100 && showScrollButton) {
  //       runOnJS(setShowScrollButton)(false);
  //     }
  //   },
  // });

  // Keep the original handleScroll for FlatList components
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: any } } }) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      setShowScrollButton(offsetY > 100);
    },
    []
  );

  // Function to scroll back to top
  const scrollToTop = useCallback(() => {
    if (listRef.current) {
      if (typeof listRef.current.scrollToOffset === 'function') {
        listRef.current.scrollToOffset({ offset: 0, animated: true });
      } else if (typeof listRef.current.scrollToIndex === 'function') {
        listRef.current.scrollToIndex({ index: 0, animated: true });
      }
    }
  }, []);

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

  const moveToTop = useCallback(
    (id: number) => {
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
    },
    [players, serverIP]
  );

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
          <PlayerItemOperator
            item={item}
            role={role}
            moveToTop={moveToTop}
            moveToBottom={moveToBottom}
          />
        );
      } else {
        return role === 'editor' ? (
          <PlayerItem
            item={item}
            role={role}
            moveToTop={moveToTop}
            moveToBottom={moveToBottom}
          />
        ) : (
          <PlayerItem
            item={item}
            role={role}
            moveToTop={moveToTop}
            moveToBottom={moveToBottom}
          />
        );
      }
    },
    [role, moveToTop, moveToBottom]
  );

  const getSkeletonData = useCallback(() => {
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
    scrollTopButton: {
      bottom: -theme.spacing.xl,
    },
  });

  return (
    <View style={styles.container}>
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
      <View style={styles.content}>
        <View style={styles.section}>
          {(playersLoading && isPreparing.current) || !players.length ? (
            <FlatList
              ref={listRef}
              onScroll={handleScroll}
              data={getSkeletonData()}
              renderItem={() => <PlayerItemSkeleton />}
              contentContainerStyle={styles.listContainer}
            />
          ) : players.length > 0 ? (
            role === 'editor' ? (
              <ReorderableList
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                ref={listRef}
                onScroll={animatedScrollHandler} // Use the animated handler
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
                initialNumToRender={players.length}
                windowSize={players.length}
              />
            ) : (
              <Animated.FlatList
                ref={listRef}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
          <ScrollToTopButton
            visible={showScrollButton}
            onPress={scrollToTop}
            style={styles.scrollTopButton}
          />
        </View>
      </View>
      <ConnectionStatus />
    </View>
  );
};

export default DefaultScreen;
