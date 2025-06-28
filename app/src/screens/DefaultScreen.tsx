import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useTranslation } from 'react-i18next';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useTheme } from '../theme';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { QuizHeader } from '../components/QuizHeader';
import { useAppContext } from '../context/AppContext';
import { usePlayerState } from '../hooks/usePlayerState';
import { SeatDataType } from '../types';
import PlayerItem from '../components/PlayerItem';

const DefaultScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { role } = useAppContext();
  const { quizState } = useWebSocketContext();
  const [players, setPlayers] = useState<SeatDataType[]>([]);

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
  }, []);

  // Render function for player items in the draggable list
  const renderPlayerItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<SeatDataType>) => (
    <PlayerItem item={item} drag={drag} role={role} />
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('defaultScreen.playersTitle')}
            </Text>
          </View>

          {/* Players content */}
          {playersLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.emptyText}>
                {t('defaultScreen.loadingPlayers')}
              </Text>
            </View>
          ) : players.length > 0 ? (
            role === 'editor' ? (
              <DraggableFlatList
                data={players}
                onDragEnd={({ data }) => handlePlayersReorder(data)}
                keyExtractor={item => item.id.toString()}
                renderItem={renderPlayerItem}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <FlatList
                data={players}
                renderItem={({ item }) => (
                  <PlayerItem item={item} role={role} />
                )}
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
