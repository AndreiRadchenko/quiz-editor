import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { fetchPlayerData, fetchSeatsData } from '../api';
import { PlayerDataType, PlayerType } from '../types';

export const usePlayerState = () => {
  const { serverIP } = useAppContext();

  const getPlayersData = ( playerType?: PlayerType) => {
    const queryKey = ['players', playerType];

    return useQuery({
      queryKey,
      queryFn: () => {
        if (!serverIP) {
          // Should not happen if enabled is set correctly, but as a safeguard
          return Promise.resolve(null);
        }
        return fetchSeatsData(serverIP, playerType);
      },
      enabled: !!serverIP,
      // staleTime can be configured here or globally as done in queryClient.ts
    });
  };

  return { getPlayersData };
};
