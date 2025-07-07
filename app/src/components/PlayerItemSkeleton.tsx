import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme';

const PlayerItemSkeleton = () => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.playerItem}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.imageContainer} />
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <View style={styles.nameSkeleton} />
            <View style={styles.rankSkeleton} />
          </View>
          <View style={styles.row}>
            <View style={styles.occupationSkeleton} />
          </View>
          <View style={styles.row}>
            <View style={styles.notesSkeleton} />
          </View>
          <View style={styles.row}>
            <View style={styles.answerSkeleton} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerItem: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 8,
    height: 150,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  container: {
    padding: 12,
    flexDirection: 'row',
    flex: 1,
  },
  imageContainer: {
    width: 90,
    height: 120,
    backgroundColor: '#3a3a3a',
    borderRadius: 6,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameSkeleton: {
    width: '40%',
    height: 20,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  rankSkeleton: {
    width: '20%',
    height: 20,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  occupationSkeleton: {
    width: '70%',
    height: 16,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  notesSkeleton: {
    width: '90%',
    height: 16,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  answerSkeleton: {
    width: '50%',
    height: 16,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
});

export default PlayerItemSkeleton;
