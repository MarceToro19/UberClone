import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useActiveTrip } from '../context/ActiveTripContext';
import HomeScreen from '../screens/HomeScreen';
import ActiveTripScreen from '../screens/ActiveTripScreen';
import TripSummaryScreen from '../screens/TripSummaryScreen';

const Stack = createNativeStackNavigator();

export default function TripStack({ onOpenDrawer }) {
  const { activeTrip, hasActiveTrip } = useActiveTrip();

  const initialRoute =
    activeTrip?.status === 'completed'
      ? 'TripSummary'
      : hasActiveTrip
      ? 'ActiveTrip'
      : 'Home';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home">
        {(props) => (
          <HomeScreen
            {...props}
            onOpenDrawer={onOpenDrawer}
            onTripStarted={() => props.navigation.navigate('ActiveTrip')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ActiveTrip">
        {(props) => (
          <ActiveTripScreen
            {...props}
            onTripFinished={() => props.navigation.replace('TripSummary')}
            onCancelToHome={() =>
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TripSummary">
        {(props) => (
          <TripSummaryScreen
            {...props}
            onFinishSummary={() =>
              props.navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            }
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

