import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InventoryScreen from './screens/InventoryScreen';
import ResupplyScreen from './screens/ResupplyScreen';
import SalesScreen from './screens/SalesScreen';
import ReportsScreen from './screens/ReportsScreen';
import { getDBConnection, createTables } from './db/db';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const setupDB = async () => {
      const db = await getDBConnection();
      await createTables(db);
    };
    setupDB();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Resupply" component={ResupplyScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
