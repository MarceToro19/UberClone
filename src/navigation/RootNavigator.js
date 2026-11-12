import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDriverSession } from '../context/DriverSessionContext';
import RegisterTabs from './RegisterTabs';
import DriverDrawer from './DriverDrawer';
import PendingApprovalScreen from '../screens/register/PendingApprovalScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isRegistered, isApproved } = useDriverSession();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isRegistered ? (
        <Stack.Screen name="RegisterFlow" component={RegisterTabs} />
      ) : !isApproved ? (
        <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      ) : (
        <Stack.Screen name="DriverApp" component={DriverDrawer} />
      )}
    </Stack.Navigator>
  );
}

