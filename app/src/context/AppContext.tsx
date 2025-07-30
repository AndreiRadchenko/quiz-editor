import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactElement,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContextType, Role } from '../types';
import i18n from '../i18n';
import { View } from 'react-native'; // Import View component only

const SERVER_IP_KEY = 'app.serverIP';
const LOCALE_KEY = 'settings.lang'; // Same as in i18n
const ROLE_KEY = 'settings.role';

const defaultContextValues: AppContextType = {
  serverIP: '192.168.29.100',
  locale: 'uk',
  role: 'general',
  setServerIP: () => {},
  setLocale: () => {},
  setRole: () => {},
  reloadContext: async () => Promise.resolve(),
};

export const AppContext = createContext<AppContextType>(defaultContextValues);

// Update children type to only allow ReactElement (no text strings)
export const AppProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const [serverIP, setServerIPState] = useState<string | null>(
    '192.168.29.100'
  );
  const [locale, setLocaleState] = useState<'en' | 'uk'>('en');
  const [role, setRoleState] = useState<Role>('general');
  const [isLoading, setIsLoading] = useState(true);

  const reloadContext = useCallback(async () => {
    try {
      // Reload any persisted values from storage
      const savedRole = await AsyncStorage.getItem(ROLE_KEY);
      if (savedRole) setRoleState(savedRole as Role);

      const savedServerIP = await AsyncStorage.getItem(SERVER_IP_KEY);

      if (savedServerIP) {
        setServerIPState(savedServerIP);
      } else {
        setServerIPState('192.168.29.100');
      }

      const storedLocale = await AsyncStorage.getItem(LOCALE_KEY);
      if (storedLocale) {
        const parsedLocale = storedLocale as 'en' | 'uk';
        setLocaleState(parsedLocale);
        i18n.changeLanguage(parsedLocale);
      }
    } catch (error) {
      console.error('Failed to reload app context:', error);
    }
  }, []);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedIP = await AsyncStorage.getItem(SERVER_IP_KEY);
        const storedLocale = await AsyncStorage.getItem(LOCALE_KEY);
        const storedRole = await AsyncStorage.getItem(ROLE_KEY);

        if (storedIP) {
          setServerIPState(storedIP);
        } else {
          setServerIPState('192.168.29.100');
        }
        if (storedLocale) {
          const parsedLocale = storedLocale as 'en' | 'uk';
          setLocaleState(parsedLocale);
          i18n.changeLanguage(parsedLocale);
        } else {
          // If no locale is stored, use the one detected by i18next
          setLocaleState(i18n.language as 'en' | 'uk');
        }
        if (storedRole) {
          setRoleState(storedRole as Role);
        }
      } catch (e) {
        console.error('Failed to load app context data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPersistedData();
  }, []);

  const handleSetServerIP = async (ip: string | null) => {
    setServerIPState(ip);
    if (ip) {
      await AsyncStorage.setItem(SERVER_IP_KEY, ip);
    } else {
      await AsyncStorage.removeItem(SERVER_IP_KEY);
    }
  };

  const handleSetLocale = async (newLocale: 'en' | 'uk') => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(LOCALE_KEY, newLocale);
    i18n.changeLanguage(newLocale);
  };

  const handleSetRole = async (newRole: Role) => {
    setRoleState(newRole);
    await AsyncStorage.setItem(ROLE_KEY, newRole);
  };

  // Enhanced loading state handler to ensure it properly renders in React Native
  if (isLoading) {
    return <View style={{ flex: 1 }}>{/* Explicitly empty view */}</View>;
  }

  // Only accepts ReactElement children, not text strings
  return (
    <AppContext.Provider
      value={{
        serverIP,
        locale,
        role,
        setServerIP: handleSetServerIP,
        setLocale: handleSetLocale,
        setRole: handleSetRole,
        reloadContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
