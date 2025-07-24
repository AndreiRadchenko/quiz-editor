import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { iQuizSate, TimerStatus } from '../types';
import { MaterialIcons } from '@expo/vector-icons';
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
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
  onRefresh,
  isRefreshing = false,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRefreshing) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [isRefreshing, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // Format timer display
  const getTimerDisplay = () => {
    if (!timerStatus) return t('defaultScreen.unknownState');

    if (
      timerStatus.status === 'running' &&
      timerStatus.remainingTime !== null
    ) {
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
      marginBottom: theme.spacing.sm,
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
      minWidth: '33%',
      // marginRight: theme.spacing.xs,
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
    reloadButton: {
      position: 'absolute',
      bottom: theme.spacing.md,
      right: theme.spacing.md,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      display: 'flex',
    },
    reloadButtonRefreshing: {
      opacity: 0.7,
      // backgroundColor: theme.colors.accent, // Different color when refreshing
    },
    IconView: {
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
    },
  });

  return (
    <View style={styles.headerContainer}>
      <View>
        {/* First Row */}
        <View style={styles.headerRow}>
          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.currentTierLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {tierLegend || t('defaultScreen.noTierInformation')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.stateLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {state || t('defaultScreen.unknownState')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.prizePoolLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {prizePool !== undefined
                ? prizePool.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>
        </View>

        {/* Second Row */}
        <View style={styles.headerRow}>
          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.questionLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {questionLabel || t('defaultScreen.unknownState')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.countdownLabel')}
            </Text>
            <Text style={styles.dataValue}>{getTimerDisplay()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.changeLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {prizeChange !== undefined
                ? prizeChange.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>
        </View>
      </View>

      <View>
        {/* Third Row */}
        <View style={styles.headerRow}>
          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.remainingPlayersLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {remainingPlayers !== undefined
                ? remainingPlayers.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.correctAnswersLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {correctAnswers !== undefined
                ? correctAnswers.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.passesLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {passes !== undefined
                ? passes.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>
        </View>

        {/* Fourth Row */}
        <View style={styles.headerRow}>
          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.eliminatedLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {eliminatedPlayers !== undefined
                ? eliminatedPlayers.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.dataLabel}>
              {t('defaultScreen.incorrectLabel')}
            </Text>
            <Text style={styles.dataValue}>
              {incorrectAnswers !== undefined
                ? incorrectAnswers.toString()
                : t('defaultScreen.unknownState')}
            </Text>
          </View>

          <View style={styles.section}></View>
        </View>
      </View>
      {onRefresh && (
        <TouchableOpacity
          style={[
            styles.reloadButton,
            isRefreshing && styles.reloadButtonRefreshing, // Optional: add style for when refreshing
          ]}
          onPress={onRefresh}
          activeOpacity={0.7}
          disabled={isRefreshing} // Disable button while refreshing
        >
          <Animated.View
            style={[{ transform: [{ rotate: spin }] }, styles.IconView]}
          >
            <MaterialIcons name="cached" size={24} color="white" />
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};
