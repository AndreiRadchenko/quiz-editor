import React, {
  createContext,
  useContext,
  ReactElement,
  useEffect,
} from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { iQuizSate, iCheckMessage, iAnswerState, PlayerType } from '../types';
import { WebSocketStatus } from '../hooks/useWebSocket';
import { useAppContext } from './AppContext';
import { fetchQuizState } from '../api';
import { usePlayerState } from '../hooks/usePlayerState';

interface WebSocketContextType {
  quizState: iQuizSate | null;
  setQuizState: React.Dispatch<React.SetStateAction<iQuizSate | null>>;
  answers: iAnswerState[];
  setAnswers: React.Dispatch<React.SetStateAction<iAnswerState[]>>;
  status: WebSocketStatus;
  errorDetails: string | null;
  sendMessage: (message: iCheckMessage | iAnswerState) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  playersQuery: ReturnType<typeof usePlayerState>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const { serverIP } = useAppContext();
  const [answers, setAnswers] = React.useState<iAnswerState[]>([]);
  const webSocketState = useWebSocket();
  const playersQuery = usePlayerState(webSocketState.showPlayerType);

  useEffect(() => {
    const initializeWebSocket = async () => {
      // Log the initial state for debugging
      console.log('WebSocketProvider initialized with state:', webSocketState);
      const updatedState = await fetchQuizState(serverIP);
      webSocketState.setQuizState(updatedState);
    };

    initializeWebSocket();
    if (webSocketState.status === 'connected') {
      // WebSocket is connected, you can perform actions here
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        ...webSocketState,
        answers,
        setAnswers,
        playersQuery,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      'useWebSocketContext must be used within a WebSocketProvider'
    );
  }
  return context;
};
