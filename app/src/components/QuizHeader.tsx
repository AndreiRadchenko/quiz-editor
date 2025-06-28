import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { iQuizSate, TimerStatus } from '../types';

interface QuizHeaderProps {
  tierLegend?: string;
  state?: string;
  questionLabel?: string;
  correctAnswer?: string;
  timerStatus?: TimerStatus;
  prizePool?: number;
  prizeChange?: number;
  remainingPlayers?: number;
  eliminatedPlayers?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  passes?: number;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
  tierLegend,
  state,
  questionLabel,
  correctAnswer,
  timerStatus,
  prizePool,
  prizeChange,
  remainingPlayers,
  eliminatedPlayers,
  correctAnswers,
  incorrectAnswers,
  passes,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Format timer display
  const getTimerDisplay = () => {
    if (!timerStatus) return t('defaultScreen.unknownState');

    if (timerStatus.status === 'running' && timerStatus.remainingTime !== null) {
      return timerStatus.remainingTime.toString();
    } else {
      return timerStatus.status;
    }
  };

  const styles = StyleSheet.create({
    headerContainer: {
      ...theme.components.card,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      minWidth: '30%',
      marginHorizontal: theme.spacing.xs,
    },
    column: {
      marginHorizontal: theme.spacing.xs,
    },
    headerText: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.base,
    },
    headerValueText: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.accent,
      marginLeft: theme.spacing.xs,
    },
    dataLabel: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.medium,
      fontFamily: 'monospace',
    },
    dataValue: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.accent,
      fontFamily: 'monospace',
    },
  });

  return (
    <View style={styles.headerContainer}>
      <View>
        {/* First Row */}
      <View style={styles.headerRow}>
        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.currentTierLabel')}</Text>
          <Text style={styles.dataValue}>
            {tierLegend || t('defaultScreen.noTierInformation')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.stateLabel')}</Text>
          <Text style={styles.dataValue}>
            {state || t('defaultScreen.unknownState')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.prizePoolLabel')}</Text>
          <Text style={styles.dataValue}>
            {prizePool !== undefined ? prizePool.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>
      </View>

      {/* Second Row */}
      <View style={styles.headerRow}>
        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.questionLabel')}</Text>
          <Text style={styles.dataValue}>
            {questionLabel || t('defaultScreen.unknownState')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.countdownLabel')}</Text>
          <Text style={styles.dataValue}>
            {getTimerDisplay()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.changeLabel')}</Text>
          <Text style={styles.dataValue}>
            {prizeChange !== undefined ? prizeChange.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>
        </View>
      </View>

      <View>
        {/* Third Row */}
      <View style={styles.headerRow}>
        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.remainingPlayersLabel')}</Text>
          <Text style={styles.dataValue}>
            {remainingPlayers !== undefined ? remainingPlayers.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.correctAnswersLabel')}</Text>
          <Text style={styles.dataValue}>
            {correctAnswers !== undefined ? correctAnswers.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.passesLabel')}</Text>
          <Text style={styles.dataValue}>
            {passes !== undefined ? passes.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>
      </View>

      {/* Fourth Row */}
      <View style={styles.headerRow}>
        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.eliminatedLabel')}</Text>
          <Text style={styles.dataValue}>
            {eliminatedPlayers !== undefined ? eliminatedPlayers.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.dataLabel}>{t('defaultScreen.incorrectLabel')}</Text>
          <Text style={styles.dataValue}>
            {incorrectAnswers !== undefined ? incorrectAnswers.toString() : t('defaultScreen.unknownState')}
          </Text>
        </View>

        <View style={styles.section}>
          {/* <Text style={styles.dataLabel}>{t('defaultScreen.correctAnswerLabel')}</Text>
          <Text style={styles.dataValue}>
            {correctAnswer || t('defaultScreen.unknownState')}
          </Text> */}
        </View>
      </View>
      </View>
    </View>
  );
};
