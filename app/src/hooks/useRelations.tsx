import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import React, { JSX } from 'react';
import { useTheme } from '../theme';
import { useWebSocketContext } from '../context/WebSocketContext';
import RelationsDisplay from '../components/RelationsDisplay';

/**
 * @deprecated Use the RelationsDisplay component directly instead.
 * This hook will be removed in a future version.
 */
export const useRelations = (
  relations: string[],
  role: string
): JSX.Element[] | undefined => {
  console.warn(
    'useRelations is deprecated. Use RelationsDisplay component instead'
  );
  const { theme } = useTheme();
  const { playersQuery } = useWebSocketContext();
  const { data: playersData } = playersQuery;

  // Create a wrapper element to render our component
  const RelationsWrapper = () => (
    <RelationsDisplay
      relations={relations}
      role={role}
      playersData={playersData || []}
      isLoading={playersQuery.isLoading}
    />
  );

  // Render the component to get JSX elements
  const wrapperElement = <RelationsWrapper />;

  // For backward compatibility, return an array with a single JSX element
  return [wrapperElement];
};
