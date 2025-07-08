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

  const styles = StyleSheet.create({
    button: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 70,
      height: 70,
      borderRadius: 35,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.secondary,
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

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name="arrow-upward" size={24} color="white" />
      {/* <Text style={styles.text}>ВГОРУ</Text> */}
    </TouchableOpacity>
  );
};

export default ScrollToTopButton;
