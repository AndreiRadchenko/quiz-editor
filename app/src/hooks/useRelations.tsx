import { useTranslation } from 'react-i18next';
import { usePlayerState } from './usePlayerState';
import { View, Text } from 'react-native';
import React, { JSX } from 'react';
import { useTheme } from '../theme';
import { useWebSocketContext } from '../context/WebSocketContext';

export const useRelations = (
  relations: string[],
  role: string
): JSX.Element[] | undefined => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { quizState, playersQuery } = useWebSocketContext();
  const { data: playersData, isLoading: playersLoading } = playersQuery;

  if (role === 'editor' || role === 'general') {
    return relations.map((relation, index) => {
      const [playerName, relationship] = relation.split('-');
      const relationData = playersData?.find(
        s => s.player?.name === playerName.trim()
      );
      if (relationData) {
        return (
          <View
            key={`relation-${index}`}
            style={{
              // flex: 1,
              // flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
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
              {`${relationship ? `${playerName.trim()} (${relationship})` : `${playerName.trim()}`}`}
            </Text>
            <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>
              {`${relationData.seat}`}
            </Text>
          </View>
        );
      }
      return (
        <Text
          key={`relation-${index}`}
          style={{
            fontWeight: 'normal',
            color: 'white',
            fontSize: theme.fontSize.base,
          }}
        >{`${relationship ? `${playerName.trim()} (${relationship})` : playerName.trim()}`}</Text>
      );
    });
  }
  return relations.map((relation, index) => {
    const [playerName, relationship] = relation.split('-');
    const relationData = playersData?.find(
      s => s.player?.name === playerName.trim()
    );
    if (relationData) {
      return (
        <View
          key={`relation-${index}`}
          style={{
            // flex: 1,
            // flexGrow: 1,
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
            {`${relationship ? `${playerName.trim()} (${relationship})` : `${playerName.trim()}`}`}
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: theme.fontSize.base,
              width: 40,
              color: '#FFD700',
            }}
          >
            {`${relationData.seat}`}
          </Text>
          <Text
            style={{
              width: 80,
              fontSize: theme.fontSize.base,
              fontWeight: 'normal',
              color: theme.colors.primaryForeground,
            }}
          >
            {`${relationData.cameras}`}
          </Text>
          <Text
            style={{
              fontWeight: 'normal',
              fontSize: theme.fontSize.base,
              color: theme.colors.primaryForeground,
            }}
          >
            {`${relationData.description}`}
          </Text>
        </View>
      );
    }
    return (
      <Text
        key={`relation-${index}`}
        style={{
          fontWeight: 'normal',
          color: 'white',
          fontSize: theme.fontSize.base,
        }}
      >{`${relationship ? `${playerName.trim()} (${relationship})` : playerName.trim()}`}</Text>
    );
  });
};
