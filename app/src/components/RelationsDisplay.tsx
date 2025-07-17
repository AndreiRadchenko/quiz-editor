import React, { memo, useRef, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { SeatDataType, Role } from '../types';

// Define prop types for the components
interface RelationItemProps {
  playerName: string;
  relationship?: string;
  seatNumber?: string | number;
  cameras?: string;
  description?: string;
  role: string;
  theme: any; // Theme type
}

interface RelationsDisplayProps {
  relations: string[];
  role: string;
  playersData?: SeatDataType[];
  isLoading: boolean;
}

// Individual relation item - memoized
const RelationItem = memo(
  ({
    playerName,
    relationship,
    seatNumber,
    cameras,
    description,
    role,
    theme,
  }: RelationItemProps) => {
    // Keep previous values to prevent flickering
    const prevSeat = useRef(seatNumber);

    useEffect(() => {
      if (seatNumber) {
        prevSeat.current = seatNumber;
      }
    }, [seatNumber]);

    // Display format based on role
    if (role === 'editor' || role === 'general') {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontWeight: 'normal',
              color: 'white',
              fontSize: theme.fontSize.base,
              width: '90%',
            }}
          >
            {relationship ? `${playerName} (${relationship})` : playerName}
          </Text>
          <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>
            {seatNumber || prevSeat.current || ''}
          </Text>
        </View>
      );
    }

    // Admin role format
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <Text
          style={{
            fontWeight: 'normal',
            color: 'white',
            fontSize: theme.fontSize.base,
            width: 250,
          }}
        >
          {relationship ? `${playerName} (${relationship})` : playerName}
        </Text>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: theme.fontSize.base,
            width: 40,
            color: '#FFD700',
          }}
        >
          {seatNumber || prevSeat.current || ''}
        </Text>
        <Text
          style={{
            width: 80,
            fontSize: theme.fontSize.base,
            fontWeight: 'normal',
            color: theme.colors.primaryForeground,
          }}
        >
          {cameras || ''}
        </Text>
        <Text
          style={{
            fontWeight: 'normal',
            fontSize: theme.fontSize.base,
            color: theme.colors.primaryForeground,
          }}
        >
          {description || ''}
        </Text>
      </View>
    );
  }
);

// Main component
const RelationsDisplay = ({
  relations,
  role,
  playersData,
  isLoading,
}: RelationsDisplayProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const prevPlayersDataRef = useRef(playersData);

  // Keep previous data during loading
  useEffect(() => {
    if (playersData && !isLoading) {
      prevPlayersDataRef.current = playersData;
    }
  }, [playersData, isLoading]);

  // Use current data or fall back to previous data during loading
  const dataToUse = isLoading ? prevPlayersDataRef.current : playersData;

  if (!relations || relations.length === 0) {
    return null;
  }

  return (
    <>
      {relations.map((relation, index) => {
        const [playerName, relationship] = relation.split('-');
        const trimmedName = playerName.trim();
        const relationData = dataToUse?.find(
          s => s.player?.name === trimmedName
        );

        return (
          <RelationItem
            key={`relation-${trimmedName}-${relationship || ''}-${index}`}
            playerName={trimmedName}
            relationship={relationship}
            seatNumber={relationData?.seat}
            cameras={relationData?.cameras}
            description={relationData?.description}
            role={role}
            theme={theme}
          />
        );
      })}
    </>
  );
};

export default RelationsDisplay;
