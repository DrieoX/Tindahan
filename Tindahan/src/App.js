import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InventoryScreen from './screens/InventoryScreen';
import ResupplyScreen from './screens/ResupplyScreen';
import SalesScreen from './screens/SalesScreen';
import ReportsScreen from './screens/ReportsScreen';
import { getDBConnection, createTables } from './db/db';
import SuppliersScreen from './screens/SuppliersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const setupDB = async () => {
      const db = await getDBConnection();
      await createTables(db);
    };
    setupDB();
  }, []);

  // 🔹 Logout handler
  const handleLogout = (navigation) => {
    navigation.replace('Login'); // replace so back button won’t return
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerBackVisible: false, // 🔹 removes back button
          headerRight: () => (
            <TouchableOpacity onPress={() => handleLogout(navigation)} style={{ marginRight: 15 }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Resupply" component={ResupplyScreen} />
        <Stack.Screen name="Suppliers" component={SuppliersScreen} />
        <Stack.Screen name="Sales" component={SalesScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
