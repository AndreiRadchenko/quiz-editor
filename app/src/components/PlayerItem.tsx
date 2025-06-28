import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import {
  ScaleDecorator,
  OpacityDecorator,
} from 'react-native-draggable-flatlist';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { SeatDataType } from '../types';
import { useAppContext } from '../context/AppContext';
import { prepareRelations } from '../utils/prepareRelations';
import { useRelations } from '../hooks/useRelations';

interface PlayerItemProps {
  item: SeatDataType;
  drag?: () => void;
  role?: string;
}

export const PlayerItem = ({ item, drag, role }: PlayerItemProps) => {
  const player = item.player;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { serverIP } = useAppContext();

  if (!player) return null;

  const playerAnswer = ''; // This would eventually come from player data
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
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: 0,
      marginBottom: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    playerItemActive: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.accent,
    },
    playerItemCorrect: {
      borderLeftWidth: 4,
      backgroundColor: '#1c6d1f90', // Green
    },
    playerItemIncorrect: {
      borderLeftWidth: 4,
      backgroundColor: '#8b0d0d76', // Red
    },
    playerItemPass: {
      borderLeftWidth: 4,
      backgroundColor: '#510bf58d', // Amber/orange color for pass
    },
    container: {
      padding: theme.spacing.md,
      paddingRight: theme.spacing['2xl'],
      flexDirection: 'row',
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
      gap: theme.spacing.lg,
    },
    playerName: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: 'white',
    },
    secondRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    label: {
      textAlign: 'right',
      color: 'white',
      marginRight: theme.spacing.xs,
      width: 100, // Fixed width for labels
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.semibold,
    },
    value: {
      color: '#FFD700', // Gold color for values
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
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.md,
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
  });

  return (
    <ScaleDecorator activeScale={0.95}>
      <OpacityDecorator activeOpacity={0.8}>
        <TouchableOpacity
          style={[
            styles.playerItem,
            player.isAnswerCorrect === true && styles.playerItemCorrect,
            player.isAnswerCorrect === false && styles.playerItemIncorrect,
            player.isAnswerPass === true && styles.playerItemPass,
          ]}
          onLongPress={role === 'editor' ? drag : undefined}
          disabled={role !== 'editor'}
        >
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image source={playerImageSource} style={styles.playerImage} />
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
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
                  <Text style={styles.answerLabel}>
                    {t('playerItem.answerLabel')}
                  </Text>
                  <Text style={styles.answer}>{playerAnswer || '-'}</Text>
                </View>

                {playerRelationsWithRole &&
                  playerRelationsWithRole.length > 0 && (
                    <View style={styles.companyContainer}>
                      <Text style={styles.answerLabel}>
                        {t('playerItem.companyLabel')}
                      </Text>
                      <View style={styles.relationList}>
                        {playerRelationsWithRole.map(
                          (relation, index) => relation
                        )}
                      </View>
                    </View>
                  )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </OpacityDecorator>
    </ScaleDecorator>
  );
};

export default PlayerItem;
