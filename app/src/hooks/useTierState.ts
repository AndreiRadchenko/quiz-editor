import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { fetchTiersData } from '../api';
import { 
  TierDataType, 
  iQuizSate, 
  AppTierType, 
  QuestionDataType, 
  QuestionTypeEnum 
} from '../types';

// This hook will fetch all tiers and then allow selecting/transforming a specific tier
// based on tierNumber, potentially from a WebSocket message.
export const useTiersData = () => {
  const { serverIP } = useAppContext();

  const queryKey = ['tiers'];

  const { data: tiersData, isLoading, error, refetch } = useQuery<TierDataType[], Error>({
    queryKey,
    queryFn: () => {
      if (!serverIP) {
        return Promise.resolve([]);
      }
      return fetchTiersData(serverIP);
    },
    enabled: !!serverIP,
  });

  return { tiersData, isLoading, error, refetchTiers: refetch };
};

// Helper function to find and transform a specific tier
export const getAppTier = (
  tiersData: TierDataType[] | undefined,
  quizSate: iQuizSate | null // This would come from WebSocket state
): AppTierType | null => {
  if (!tiersData || !quizSate) return null;

  const currentTierData = tiersData.find(t => t.idx === quizSate.tierNumber);
  if (!currentTierData || !currentTierData.question) return null;

  const question = currentTierData.question;

  return {
    tierNumber: quizSate.tierNumber,
    legend: currentTierData.legend || quizSate.tierLegend, // Prefer tierData legend, fallback to quizSate
    passOneAllowed: currentTierData.passOneAllowed,
    passTwoAllowed: currentTierData.passTwoAllowed,
    enableCountdown: currentTierData.enableCountdown,
    label: question.label,
    image: question.image,
    questionType: question.questionType,
    answerOptions: question.answerOptions,
  };
};
