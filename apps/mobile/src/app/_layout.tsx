import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../global.css';
import { Providers } from '../providers';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Providers>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </Providers>
    </SafeAreaProvider>
  );
}