import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  Image,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
  OpacityDecorator,
} from 'react-native-draggable-flatlist';
import { useTranslation } from 'react-i18next';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useTheme } from '../theme';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { AnswerItem } from '../components/AnswerItem';
import { QuizHeader } from '../components/QuizHeader';
import { useAppContext } from '../context/AppContext';
import { setAnswersCorrect, updateQuestionCorrectAnswer } from '../api';
import { usePlayerState } from '../hooks/usePlayerState';
import { PlayerDataType, SeatDataType } from '../types';

const DefaultScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { serverIP, role } = useAppContext();
  const { quizState, answers, setAnswers } = useWebSocketContext();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [displayItems, setDisplayItems] = useState<string[]>([]);
  const [players, setPlayers] = useState<SeatDataType[]>([]);
  const [activeTab, setActiveTab] = useState<'answers' | 'players'>('players');

  // Use the player state hook to fetch players data
  const { getPlayersData } = usePlayerState();
  const { data: playersData, isLoading: playersLoading } = getPlayersData('active');

  // When playersData changes, update our local state
  useEffect(() => {
    if (playersData) {
      const playersList = Array.isArray(playersData) ? playersData : [playersData];
      setPlayers(playersList);
    }
  }, [playersData]);

  // Function to handle player reordering (only for editors)
  const handlePlayersReorder = useCallback((newData: SeatDataType[]) => {
    setPlayers(newData);
    // Here you would typically send the new order to your API
    // We're just updating the state here for the demo
  }, []);

  const handleSwipeLeft = useCallback(
    async (answer: string) => {
      if (quizState?.questionLabel) {
        // Mark item as being removed for animation
        setRemovingItems(prev => new Set([...prev, answer]));

        const matchingAnswers = answers.filter(
          a => a.answer === answer && !a.isCorrect
        );
        const seats = matchingAnswers.map(a => a.seat);

        try {
          await updateQuestionCorrectAnswer(
            quizState.questionLabel,
            answer,
            serverIP
          );
          await setAnswersCorrect(seats, serverIP);
        } catch (error) {
          // If API call fails, remove the removing state
          setRemovingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(answer);
            return newSet;
          });
          console.error('Error updating answer:', error);
        }
      }
    },
    [quizState, serverIP, answers]
  );

  const handleSwipeRight = useCallback((answer: string) => {
    setRemovingItems(prev => new Set([...prev, answer]));
  }, []);

  const showTip = () => {
    Alert.alert(
      t('defaultScreen.swipeGesturesTitle'),
      t('defaultScreen.swipeGesturesMessage'),
      [{ text: t('defaultScreen.gotIt') }]
    );
  };

  const AnimatedAnswerItem = ({
    item,
    onAnimationComplete,
  }: {
    item: string;
    onAnimationComplete: (item: string) => void;
  }) => {
    const [fadeAnim] = useState(new Animated.Value(1));
    const [scaleAnim] = useState(new Animated.Value(1));
    const isRemoving = removingItems.has(item);

    useEffect(() => {
      if (isRemoving) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Only update list after animation is complete
          onAnimationComplete(item);
        });
      }
    }, [isRemoving]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <AnswerItem
          item={item}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </Animated.View>
    );
  };

  // Player item component to display in the list
  const PlayerItem = ({
    item,
    drag,
    isActive,
  }: {
    item: SeatDataType;
    drag?: () => void;
    isActive?: boolean;
  }) => {
    const player = item.player;

    if (!player) return null;

    return (
      <ScaleDecorator activeScale={0.95}>
        <OpacityDecorator activeOpacity={0.7}>
          <TouchableOpacity
            style={[
              styles.playerItem,
              isActive && styles.playerItemActive,
              player.isAnswerCorrect && styles.playerItemCorrect,
              player.isAnswerPass && styles.playerItemPass,
            ]}
            onLongPress={role === 'editor' ? drag : undefined}
            disabled={role !== 'editor'}
          >
            <View style={styles.playerInfo}>
              <Text style={styles.playerSeat}>#{item.seat}</Text>
              <Text style={styles.playerName}>{player.name}</Text>
              {player.isActive && (
                <View style={styles.activeIndicator}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              )}
            </View>
            <Text style={styles.playerDetails}>
              {player.rank || ''} {player.occupation || ''}
            </Text>
          </TouchableOpacity>
        </OpacityDecorator>
      </ScaleDecorator>
    );
  };

  // Render function for answer items
  const renderAnswerItem = ({ item }: { item: string }) => (
    <AnimatedAnswerItem
      item={item}
      onAnimationComplete={item => {
        setTimeout(() => {
          setDisplayItems(prev => prev.filter(i => i !== item));
          setAnswers(prev => prev.filter(a => a.answer !== item));
          setRemovingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item);
            return newSet;
          });
        }, 300);
      }}
    />
  );

  // Render function for player items in the draggable list
  const renderPlayerItem = ({ item, drag, isActive }: RenderItemParams<SeatDataType>) => (
    <PlayerItem item={item} drag={drag} isActive={isActive} />
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
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
    tipButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipText: {
      color: theme.colors.primaryForeground,
      fontSize: 14,
      fontWeight: 'bold',
    },
    tipDescription: {
      fontSize: 14,
      color: theme.colors.mutedForeground,
      marginBottom: theme.spacing.md,
      fontStyle: 'italic',
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
    adminSection: {
      paddingTop: theme.spacing.lg,
    },
    adminButton: {
      backgroundColor: theme.colors.secondary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    adminButtonText: {
      color: theme.colors.secondaryForeground,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.medium,
    },
    // Player item styles
    playerItem: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    playerItemActive: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent,
    },
    playerItemCorrect: {
      borderLeftWidth: 4,
      borderLeftColor: '#10b981', // Green
    },
    playerItemPass: {
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b', // Amber/orange color for pass
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    playerSeat: {
      backgroundColor: theme.colors.muted,
      color: theme.colors.foreground,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
      fontWeight: theme.fontWeight.bold,
      fontSize: theme.fontSize.sm,
    },
    playerName: {
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.foreground,
      flex: 1,
    },
    playerDetails: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.mutedForeground,
    },
    activeIndicator: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: theme.spacing.sm,
    },
    activeText: {
      color: '#fff',
      fontSize: theme.fontSize.xs,
      fontWeight: theme.fontWeight.medium,
    },
    tabSelector: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    tab: {
      flex: 1,
      padding: theme.spacing.sm,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
    },
    activeTab: {
      borderBottomColor: theme.colors.accent,
    },
    tabText: {
      color: theme.colors.mutedForeground,
    },
    activeTabText: {
      color: theme.colors.accent,
      fontWeight: theme.fontWeight.semibold,
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
        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'answers' && styles.activeTab]}
            onPress={() => setActiveTab('answers')}
          >
            <Text style={[styles.tabText, activeTab === 'answers' && styles.activeTabText]}>
              {t('defaultScreen.incorrectAnswersTitle')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'players' && styles.activeTab]}
            onPress={() => setActiveTab('players')}
          >
            <Text style={[styles.tabText, activeTab === 'players' && styles.activeTabText]}>
              {t('defaultScreen.playersTitle')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {activeTab === 'answers' ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t('defaultScreen.incorrectAnswersTitle')}
                </Text>
                <TouchableOpacity onPress={showTip} style={styles.tipButton}>
                  <Text style={styles.tipText}>
                    {t('defaultScreen.tipButtonText')}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.tipDescription}>
                {t('defaultScreen.swipeInstructions')}
              </Text>

              {displayItems.length > 0 ? (
                <FlatList
                  data={displayItems}
                  renderItem={renderAnswerItem}
                  keyExtractor={(item, index) => `${item}+${index}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                <Text style={styles.emptyText}>
                  {t('defaultScreen.noIncorrectAnswers')}
                </Text>
              )}
            </>
          ) : (
            // Players tab content
            playersLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.emptyText}>{t('defaultScreen.loadingPlayers')}</Text>
              </View>
            ) : (
              players.length > 0 ? (
                role === 'editor' ? (
                  <DraggableFlatList
                    data={players}
                    onDragEnd={({ data }) => handlePlayersReorder(data)}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPlayerItem}
                    contentContainerStyle={styles.listContainer}
                  />
                ) : (
                  <FlatList
                    data={players}
                    renderItem={({ item }) => <PlayerItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                  />
                )
              ) : (
                <Text style={styles.emptyText}>
                  {t('defaultScreen.noPlayersFound')}
                </Text>
              )
            )
          )}
        </View>
      </View>

      {/* Connection Status at bottom */}
      <ConnectionStatus />
    </View>
  );
};

export default DefaultScreen;
