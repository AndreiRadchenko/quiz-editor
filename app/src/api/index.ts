import {
  AppContextType,
  iQuizSate,
  PlayerType,
  SeatDataType,
  TierDataType,
} from '../types';
import { useAppContext } from '../context/AppContext';

const getBaseUrl = (serverIP: string | null) => {
  if (!serverIP) {
    // console.error("Server IP is not set"); // Or handle more gracefully
    return null;
  }
  return `http://${serverIP}:5000`;
};

export const fetchQuizState = async (
  serverIP: string | null
): Promise<iQuizSate | null> => {
  const baseUrl = getBaseUrl(serverIP);
  if (!baseUrl) return null;

  try {
    const response = await fetch(`${baseUrl}/game/state`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quiz state: ${response.status}`);
    }
    return (await response.json()) as iQuizSate;
  } catch (error) {
    console.error('Error fetching quiz state:', error);
    throw error; // Re-throw to be caught by TanStack Query
  }
};

export const fetchPlayerData = async (
  seatNumber: number,
  serverIP: string | null
): Promise<SeatDataType | null> => {
  const baseUrl = getBaseUrl(serverIP);
  if (!baseUrl || !seatNumber) return null;

  try {
    const response = await fetch(`${baseUrl}/seats/${seatNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch player data: ${response.status}`);
    }
    return (await response.json()) as SeatDataType;
  } catch (error) {
    console.error('Error fetching player data:', error);
    throw error; // Re-throw to be caught by TanStack Query
  }
};

export const fetchSeatsData = async (
  serverIP: string | null,
  playerType?: PlayerType
): Promise<SeatDataType[] | null> => {
  const baseUrl = getBaseUrl(serverIP);
  if (!baseUrl) return null;

  try {
    let response: Response;
    if (!playerType) {
      response = await fetch(`${baseUrl}/seats`);
    } else {
      response = await fetch(`${baseUrl}/seats?playerType=${playerType}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch seats data: ${response.status}`);
    }
    return (await response.json()) as SeatDataType[];
  } catch (error) {
    console.error('Error fetching seats data:', error);
    throw error; // Re-throw to be caught by TanStack Query
  }
};

export const fetchTiersData = async (
  serverIP: string | null
): Promise<TierDataType[]> => {
  const baseUrl = getBaseUrl(serverIP);
  if (!baseUrl) return [];

  try {
    const response = await fetch(`${baseUrl}/tiers`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tiers data: ${response.status}`);
    }
    return (await response.json()) as TierDataType[];
  } catch (error) {
    console.error('Error fetching tiers data:', error);
    throw error; // Re-throw to be caught by TanStack Query
  }
};

export const updateSeatEditorIndex = async (
  seatNumber: number,
  newEditorIndex: number,
  serverIP: string | null
): Promise<void> => {
  const baseUrl = getBaseUrl(serverIP);
  if (!baseUrl) {
    throw new Error('Server IP is not set');
  }

  try {
    const response = await fetch(`${baseUrl}/game/editor-index/${seatNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editorIndex: newEditorIndex,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update seat editor index: ${response.status}`);
    }

    // If the API returns data, you can return it here
    // return await response.json();
  } catch (error) {
    console.error('Error updating editor index:', error);
    throw error; // Re-throw to be caught by the caller
  }
};
