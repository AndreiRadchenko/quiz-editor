import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { fetchSeatsData } from '../api';
import { PlayerType } from '../types';

export const usePlayerState = (playerType?: PlayerType) => {
  const { serverIP } = useAppContext();
  const playersQuery = useQuery({
    queryKey: ['players', playerType],
    queryFn: () => {
      if (!serverIP) {
        return Promise.resolve(null);
      }
      return fetchSeatsData(serverIP, playerType);
    },
    enabled: !!serverIP,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });

  return playersQuery;
};
