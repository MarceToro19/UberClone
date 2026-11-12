import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterTabsScreen from '../screens/register/RegisterTabsScreen';
import PendingApprovalScreen from '../screens/register/PendingApprovalScreen';

const Stack = createNativeStackNavigator();

export default function RegisterTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegisterForm">
        {(props) => (
          <RegisterTabsScreen
            {...props}
            onRegistrationSuccess={() => props.navigation.navigate('PendingApproval')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
    </Stack.Navigator>
  );
}

