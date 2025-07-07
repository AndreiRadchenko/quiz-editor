import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface ScrollToTopButtonProps {
  onPress: () => void;
  visible: boolean;
  style?: ViewStyle;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  onPress,
  visible,
  style,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name="arrow-upward" size={24} color="white" />
      <Text style={styles.text}>ВГОРУ</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default ScrollToTopButton;
