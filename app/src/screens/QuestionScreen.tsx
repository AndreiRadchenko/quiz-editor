import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { usePlayerState } from '../hooks/usePlayerState';
import { useWebSocketContext } from '../context/WebSocketContext';
import { useTheme } from '../theme';
import { useTiersData, getAppTier } from '../hooks/useTierState';
import { AppTierType, iQuizSate, PlayerDataType, QuestionTypeEnum, iAnswerMessage } from '../types';
import { getKeyboardProps } from '../utils/keyboard';
import { AnswerOptions } from '../components/AnswerOptions';
import { ConnectionStatus } from '../components/ConnectionStatus';

const { width: screenWidth } = Dimensions.get('window');

const QuestionScreen = () => {
  const { t, i18n } = useTranslation();
  const { seatNumber, serverIP, locale } = useAppContext();
  const { playerData, isLoading: isLoadingPlayer, error: playerError, refetchPlayer } = usePlayerState();
  const { quizState, setQuizState, status: wsStatus, sendMessage } = useWebSocketContext();
  const { theme } = useTheme();
  const { tiersData, isLoading: isLoadingTiers, error: tiersError } = useTiersData();

  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>(''); // Track selected multiple choice option
  const [actionTaken, setActionTaken] = useState<'answered' | 'passed' | 'bought_out' | null>(null);
  const [autoAnswer, setAutoAnswer] = useState<boolean | null>(null); // Track auto answer for QUESTION_CLOSED
  const [isBuyoutTier, setIsBuyoutTier] = useState<boolean>(false); // Track if current tier is a buyout tier

  // Create styles using theme
  const styles = StyleSheet.create({
    container: {
      ...theme.components.container,
      // padding: theme.spacing.xs,
    },
    scrollContentContainer: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      ...theme.components.card,
      marginBottom: theme.spacing.lg,
    },
    headerText: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.bold,
      textAlign: 'center',
    },
    tierLegendText: {
      ...theme.components.text.heading,
      fontSize: theme.fontSize.xl,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    questionImage: {
      width: '100%',
     aspectRatio: 16 / 9, // Maintain 16:9 aspect ratio
      marginBottom: theme.spacing.xl,
      // backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
    },
    actionButtonsContainer: {
      marginInline: 'auto',
      width: '90%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    actionButton: {
      flexGrow: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      minWidth: 120,
      width: screenWidth * 0.4, // Responsive width
    },
    passButton: {
      backgroundColor: theme.colors.accent,
    },
    actionSubmitButton: {
      backgroundColor: theme.colors.secondary,
    },
    actionButtonText: {
      ...theme.components.text.body,
      color: theme.colors.accentForeground,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      textAlign: 'center',
    },
    actionSubmitButtonText: {
      color: theme.colors.foreground,
    },
    disabledButton: {
      opacity: 0.5,
    },
    answerOptionsContainer: {
      marginBottom: theme.spacing.lg,
    },
    textInputContainer: {
      marginBottom: theme.spacing.lg,
    },
    textInput: {
      ...theme.components.card,
      color: theme.colors.cardForeground,
      fontSize: theme.fontSize.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      textAlign: 'center',
    },
    confirmButton: {
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
    },
    confirmButtonText: {
      ...theme.components.text.body,
      color: theme.colors.accentForeground,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.bold,
    },
    submitButton: {
      backgroundColor: theme.colors.accent,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
    },
    submitButtonText: {
      ...theme.components.text.body,
      color: theme.colors.accentForeground,
      fontSize: theme.fontSize.base,
      fontWeight: theme.fontWeight.bold,
    },
    countdownContainer: {
      backgroundColor: theme.colors.destructive,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'center',
      marginBottom: theme.spacing.lg,
    },
    countdownText: {
      ...theme.components.text.body,
      color: theme.colors.destructiveForeground,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      textAlign: 'center',
    },
    statusContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    statusText: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.lg,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      ...theme.components.text.error,
      fontSize: theme.fontSize.lg,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    resultContainer: {
      ...theme.components.card,
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    resultText: {
      ...theme.components.text.body,
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      textAlign: 'center',
    },
    answeredText: {
      color: theme.colors.accent,
    },
    passedText: {
      color: theme.colors.destructive,
    },
    boughtOutText: {
      color: theme.colors.secondary,
    },
  });

  // Refs to get current values in timer callback
  const currentAnswerRef = useRef<string>('');
  const selectedOptionRef = useRef<string>('');
  
  // Update refs when state changes
  useEffect(() => {
    currentAnswerRef.current = currentAnswer;
  }, [currentAnswer]);
  
  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  // Ensure locale is properly applied when component mounts or locale changes
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const currentAppTier: AppTierType | null = useMemo(() => {
    if (quizState && tiersData) {
      const currentAppTier = getAppTier(tiersData, quizState);
      setIsBuyoutTier(!!currentAppTier?.legend.toLocaleLowerCase().trim().includes('buyout'));
      return currentAppTier;
    }
    return null;
  }, [quizState?.state, quizState?.tierNumber, !!tiersData]);

  // Force cache refresh by adding tier number as query parameter
  const localImageUri = useMemo(() => {
    const baseUri = FileSystem.documentDirectory + 'question.png';
    return currentAppTier?.tierNumber ? `${baseUri}?t=${currentAppTier.tierNumber}` : baseUri;
  }, [currentAppTier?.tierNumber]);

  useEffect(() => {
    if (!quizState) return;
    
    const handleStateChange = async () => {
      switch (quizState.state) {
        case 'BUYOUT_COMPLETE':
        case 'QUESTION_COMPLETE':
        case 'IDLE':
          // Reset logic
          if (actionTaken !== null || currentAnswer !== '' || selectedOption !== '') {
            setActionTaken(null);
            setAutoAnswer(null);
            setCurrentAnswer('');
            setSelectedOption('');
          }
          break;
          
        case 'QUESTION_CLOSED':
          // Auto-submission logic
          if (seatNumber && !actionTaken && currentAppTier) {
            // ... auto-submission logic
            console.log('🚨 QUESTION_CLOSED received, auto-submitting answer if no action taken');
      
            // Auto-submit based on question type and current state
            const autoSubmitMessage: iAnswerMessage = {
              seat: seatNumber,
              pass: false,
              boughtOut: false,
              auto: true, // This is an automatic submission
            };
      
            // Determine the answer based on question type and current input
            if (currentAppTier.questionType === 'MULTIPLE') {
              // For multiple choice: send selected option or empty string if none selected
              autoSubmitMessage.answer = selectedOptionRef.current || '';
              console.log('📤 Auto-submitting MULTIPLE choice answer:', autoSubmitMessage.answer);
            } else if (currentAppTier.questionType === 'TEXT' || currentAppTier.questionType === 'TEXT NUMERIC') {
              // For text questions: send current input value
              autoSubmitMessage.answer = currentAnswerRef.current.trim();
              console.log('📤 Auto-submitting TEXT answer:', autoSubmitMessage.answer);
            } else {
              // For other question types or buyout scenarios
              autoSubmitMessage.answer = '';
              console.log('📤 Auto-submitting empty answer for question type:', currentAppTier.questionType);
            }
      
            console.log('📤 Sending auto-submission message:', autoSubmitMessage);
            sendMessage(autoSubmitMessage);
            setActionTaken('answered');
            setAutoAnswer(true); // Store auto answer for display 
          }
          break;
          
        default:
          // Other states don't need special handling
          break;
      }
    };
    
    handleStateChange();
  }, [quizState?.state,
    actionTaken,        // ← ADD THIS
    currentAnswer,      // ← ADD THIS  
    selectedOption,     // ← ADD THIS
    seatNumber,         // ← ADD THIS
    currentAppTier,     // ← ADD THIS
    sendMessage         // ← ADD THIS
  ]); // Minimal dependencies

  // Effect to reset actionTaken when question changes (new tier or question)
  // useEffect(() => {
  //   if (quizState) {
  //     if (['BUYOUT_COMPLETE', 'QUESTION_COMPLETE', 'IDLE'].includes(quizState.state)) {
  //       console.log('🔄 QuestionScreen reset effect triggered:', {
  //     tierNumber: quizState?.tierNumber,
  //     state: quizState?.state,
  //     previousActionTaken: actionTaken
  //   });
    
  //   // Only reset if we're not already in a clean state
  //   if (actionTaken !== null || currentAnswer !== '' || selectedOption !== '') {
  //     console.log('🔄 Resetting QuestionScreen state values');
  //     setActionTaken(null);
  //     setAutoAnswer(null); // Reset auto answer
  //     setCurrentAnswer(''); // Clear previous answer
  //     setSelectedOption(''); // Clear selected option
  //   }
  //     }
  //   }

    
  // }, [quizState?.tierNumber, quizState?.state]); // Also reset on state change


  // // Handle QUESTION_CLOSED auto-submission
  // useEffect(() => {
  //   if (quizState?.state === 'QUESTION_CLOSED' && seatNumber && !actionTaken && currentAppTier) {
  //     console.log('🚨 QUESTION_CLOSED received, auto-submitting answer if no action taken');
  //     console.log('Auto-submission conditions:', {
  //       state: quizState.state,
  //       seatNumber: !!seatNumber,
  //       actionTaken,
  //       currentAppTier: !!currentAppTier,
  //       questionType: currentAppTier.questionType,
  //       currentAnswer: currentAnswerRef.current,
  //       selectedOption: selectedOptionRef.current
  //     });

  //     // Auto-submit based on question type and current state
  //     const autoSubmitMessage: iAnswerMessage = {
  //       seat: seatNumber,
  //       pass: false,
  //       boughtOut: false,
  //       auto: true, // This is an automatic submission
  //     };

  //     // Determine the answer based on question type and current input
  //     if (currentAppTier.questionType === 'MULTIPLE') {
  //       // For multiple choice: send selected option or empty string if none selected
  //       autoSubmitMessage.answer = selectedOptionRef.current || '';
  //       console.log('📤 Auto-submitting MULTIPLE choice answer:', autoSubmitMessage.answer);
  //     } else if (currentAppTier.questionType === 'TEXT' || currentAppTier.questionType === 'TEXT NUMERIC') {
  //       // For text questions: send current input value
  //       autoSubmitMessage.answer = currentAnswerRef.current.trim();
  //       console.log('📤 Auto-submitting TEXT answer:', autoSubmitMessage.answer);
  //     } else {
  //       // For other question types or buyout scenarios
  //       autoSubmitMessage.answer = '';
  //       console.log('📤 Auto-submitting empty answer for question type:', currentAppTier.questionType);
  //     }

  //     console.log('📤 Sending auto-submission message:', autoSubmitMessage);
  //     sendMessage(autoSubmitMessage);
  //     setActionTaken('answered');
  //     setAutoAnswer(true); // Store auto answer for display 
  //   }
  // }, [quizState?.state, seatNumber, actionTaken, currentAppTier?.questionType, sendMessage]);

  const handleAnswerSubmit = useCallback((answer?: string, pass?: boolean, buyout?: boolean) => {
    console.log('📤 handleAnswerSubmit called:', { 
      answer, 
      pass, 
      buyout, 
      actionTaken, 
      seatNumber, 
      quizState: quizState?.state,
      answerDefined: answer !== undefined,
      isAnswerEmpty: answer === '',
      submitType: pass ? 'PASS' : buyout ? 'BUYOUT' : 'ANSWER'
    });
    
    // Verify this is a legitimate submission
    if (!seatNumber || !quizState || actionTaken) {
      console.log('❌ Cannot submit - missing requirements:', { 
        seatNumber: !!seatNumber, 
        quizState: !!quizState, 
        actionTaken 
      });
      return;
    }
    
    // Additional protection against accidental submissions with empty answers
    // This should only happen from user initiated actions
    if (answer === '' && !pass && !buyout) {
      console.log('❌ Prevented empty answer submission with no pass/buyout flag');
      return;
    }

    const message: iAnswerMessage = {
      seat: seatNumber,
      auto: false, // Manual submission
    };

    if (pass) {
      message.pass = true;
      setActionTaken('passed');
      console.log('📤 Sending PASS message:', message);
    } else if (buyout) {
      message.boughtOut = true;
      setActionTaken('bought_out');
      console.log('📤 Sending BUYOUT message:', message);
    } else if (answer !== undefined) {
      message.answer = answer.trim();
      setActionTaken('answered');
      setAutoAnswer(false)
      console.log('📤 Sending ANSWER message:', message);
    } else {
      console.log('❌ No valid action specified');
      return; // No valid action
    }

    console.log('📤 Sending message via WebSocket:', message);
    sendMessage(message);
    
    // Only clear text input, keep selectedOption for visual feedback
    if (currentAppTier?.questionType !== 'MULTIPLE') {
      setCurrentAnswer(''); // Clear input after submission/action for text questions only
    }
    // Don't clear selectedOption to maintain visual feedback of what was selected
    // refetchPlayer(); // Refetch player data to update pass/buyout status
  }, [seatNumber, quizState, sendMessage]);

  const canUsePass = useMemo(() => {
    if (!playerData || !currentAppTier ) return false;
    if (!currentAppTier.passTwoAllowed) return !playerData.usedPassOne && currentAppTier.passOneAllowed;
    return !playerData.usedPassTwo && currentAppTier.passTwoAllowed;
  }, [playerData?.usedPassOne, playerData?.usedPassTwo, currentAppTier?.tierNumber, currentAppTier?.passOneAllowed, currentAppTier?.passTwoAllowed, actionTaken]);

  const canUseBuyout = useMemo(() => {
    if (!playerData || actionTaken) return false;
    return quizState?.state === 'BUYOUT_OPEN' && !playerData.boughtOut;
  }, [quizState?.state, playerData?.boughtOut, actionTaken]);

  // Check if player has already used a pass for the current question's allowance
  // const hasUsedApplicablePass = useMemo(() => {
  //   if (!playerData || !currentAppTier) return false;
  //   if (currentAppTier.tierNumber <= 5) return playerData.usedPassOne;
  //   return playerData.usedPassTwo;
  // }, [playerData?.usedPassOne, playerData?.usedPassTwo, currentAppTier?.tierNumber]);

  const textInputJSX = useMemo(() => {
    console.log('🎯 Rendering text input for question type:', currentAppTier?.questionType);
    if (!currentAppTier || (currentAppTier.questionType !== 'TEXT' && currentAppTier.questionType !== 'TEXT NUMERIC')) return null;
    
    // Get the simplest keyboard props for this question type
    const keyboardProps = getKeyboardProps(currentAppTier.questionType, locale);
    
    return (
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={t('questionScreen.answerPlaceholder')}
          value={currentAnswer}
          onChangeText={setCurrentAnswer}
          {...keyboardProps} // Apply the simplest keyboard configuration
          clearButtonMode="while-editing" // Show clear button on iOS
          editable={!actionTaken}
          autoFocus={true} // Automatically open keyboard for text/numeric questions
        />
        <TouchableOpacity
          style={[styles.submitButton, (!!actionTaken || currentAnswer.trim() === '') && styles.disabledButton]}
          onPress={() => handleAnswerSubmit(currentAnswer)}
          disabled={!!actionTaken || currentAnswer.trim() === ''}
        >
          <Text style={styles.submitButtonText}>{t('questionScreen.submitAnswer')}</Text>
        </TouchableOpacity>
      </View>
    );
  }, [currentAppTier?.questionType, currentAnswer, actionTaken, handleAnswerSubmit, t, locale]);

  if (isLoadingPlayer || isLoadingTiers || (wsStatus === 'connecting' && !quizState)) {
    return (
      <View style={styles.statusContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (playerError || tiersError) {
    const combinedError: Error | null = playerError || tiersError;
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.errorText}>
          {playerError ? t('errors.playerDataError') : t('prepareScreen.errorLoadingTiers')}
        </Text>
        <Text style={styles.errorText}>{combinedError?.message || t('errors.unknownError')}</Text>
      </View>
    );
  }
  
  if (!playerData?.isActive) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{t('prepareScreen.playerInactiveOutOfGame')}</Text>
      </View>
    );
  }
  
  // Display WebSocket connection status if there's an issue
  if (wsStatus === 'error') {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.errorText}>{t('errors.webSocketError')}</Text>
      </View>
    );
  }

  // if (!quizState || !['QUESTION_OPEN', 'BUYOUT_OPEN'].includes(quizState.state)) {
  //   return (
  //     <View style={styles.statusContainer}>
  //       <Text style={styles.statusText}>{t('questionScreen.noQuestionData')}</Text>
  //     </View>
  //   );
  // }
  
  // Now check if we have a valid tier data
  if (!currentAppTier) {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{t('questionScreen.tierDataMissing')}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {`${t('seatNumber')}: ${seatNumber} | ${playerData.name}`}
        </Text>
      </View>

      <Text style={styles.tierLegendText}>{currentAppTier.legend}</Text>
      
      {currentAppTier.image && (
        <Image
          source={{ uri: localImageUri }}
          style={styles.questionImage}
          resizeMode="contain"
        />
      )}
      
      {/* {quizState.questionText && <Text style={styles.questionText}>{quizState.questionText}</Text>} */}

      {quizState?.state && ['QUESTION_OPEN', 'BUYOUT_OPEN'].includes(quizState.state) && (
        <View style={styles.actionButtonsContainer}>
        {canUsePass  && (
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton, !!actionTaken && styles.disabledButton]}
            onPress={() => handleAnswerSubmit(undefined, true)}
            disabled={!!actionTaken}
          >
            <Text style={styles.actionButtonText}>{t('questionScreen.pass')}</Text>
          </TouchableOpacity>
        )}
        {(canUseBuyout || isBuyoutTier) &&  (
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton, !!actionTaken && styles.disabledButton]}
            onPress={() => handleAnswerSubmit(undefined, undefined, true)}
            disabled={!!actionTaken}
          >
            <Text style={styles.actionButtonText}>{t('questionScreen.buyout')}</Text>
          </TouchableOpacity>
        )}
        {!isBuyoutTier &&  (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionSubmitButton, !!actionTaken && styles.disabledButton]}
            onPress={() => handleAnswerSubmit(currentAppTier.questionType === 'MULTIPLE' ? selectedOption : currentAnswer)}
            disabled={!!actionTaken}
          >
            <Text style={[styles.actionButtonText, styles.actionSubmitButtonText]}>{t('questionScreen.submitAnswer')}</Text>
          </TouchableOpacity>
        )}
      </View>)}

      {/* Use AnswerOptions component for multiple choice questions */}
      {currentAppTier.questionType === 'MULTIPLE' && !isBuyoutTier && (
        <AnswerOptions
          answerOptions={currentAppTier.answerOptions}
          selectedOption={selectedOption}
          actionTaken={actionTaken}
          onOptionSelect={setSelectedOption}
        />
      )}
      {/* {textInputJSX} */}

      {/* Action taken status messages */}
      {/* {actionTaken === 'answered' && autoAnswer && (
        <Text style={styles.statusText}>{t('questionScreen.answerAutoSubmitted')}</Text>
      )} */}
      {actionTaken === 'answered' && quizState?.state === 'QUESTION_OPEN' && (
        <Text style={styles.statusText}>{t('questionScreen.answerSubmitted')}</Text>
      )}
      {actionTaken === 'passed' && quizState?.state === 'QUESTION_OPEN' && (
        <Text style={styles.statusText}>{t('questionScreen.playerPassed')}</Text>
      )}
      {actionTaken === 'bought_out' && quizState?.state === 'BUYOUT_OPEN' && (
        <Text style={styles.statusText}>{t('questionScreen.playerBoughtOutState')}</Text>
      )}

       <ConnectionStatus showTitle={false} />

    </ScrollView>
  );
};

export default QuestionScreen;
