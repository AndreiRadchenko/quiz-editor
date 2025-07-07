import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { fetchSeatsData } from '../api';
import { PlayerType } from '../types';

export const usePlayerState = (playerType?: PlayerType) => {
  const { serverIP } = useAppContext();
  // const { showPlayerType: contextPlayerType } = useWebSocketContext();

  // Use provided playerType or fall back to context
  // const queryPlayerType = playerType || (contextPlayerType as PlayerType);
  console.log(`usePlayerState called with playerType: ${playerType}`);

  // Call useQuery directly at the top level - this is correct usage
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

  return playersQuery; // Return the query result directly
};
