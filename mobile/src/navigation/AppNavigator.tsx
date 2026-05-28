import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { ClientNavigator } from './ClientNavigator';
import { ProviderNavigator } from './ProviderNavigator';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.user?.role);
  const needsOnboarding = useAuthStore((s) => s.needsOnboarding);

  // Derive boolean explicitly to avoid string/boolean coercion from persisted storage
  const isAuthenticated = Boolean(token);
  const isProvider = role === 'PROVIDER';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated || needsOnboarding ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : isProvider ? (
        <Stack.Screen name="Provider" component={ProviderNavigator} />
      ) : (
        <Stack.Screen name="Client" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
}
