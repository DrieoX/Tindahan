import React, { useEffect, useState } from 'react';
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
import SuppliersScreen from './screens/SuppliersScreen';
import { getDBConnection, createTables } from './db/db';

const Stack = createNativeStackNavigator();

// 🔹 Custom header logout
const LogoutButton = ({ handleLogout, navigation }) => (
  <TouchableOpacity
    onPress={() => handleLogout(navigation)}
    style={{ marginRight: 15 }}
  >
    <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
  </TouchableOpacity>
);

const screenOptions = (handleLogout, navigation) => ({
  headerShown: true,
  headerBackVisible: false,
  headerRight: () => <LogoutButton handleLogout={handleLogout} navigation={navigation} />,
});

// 🔹 Client-only stack
function ClientStack({ handleLogout, userMode, navigation }) {
  return (
    <Stack.Navigator screenOptions={screenOptions(handleLogout, navigation)}>
      <Stack.Screen name="Dashboard">
        {(props) => <DashboardScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Inventory">
        {(props) => <InventoryScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Resupply">
        {(props) => <ResupplyScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Suppliers">
        {(props) => <SuppliersScreen {...props} userMode={userMode} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// 🔹 Server-only stack
function ServerStack({ handleLogout, userMode, navigation }) {
  return (
    <Stack.Navigator screenOptions={screenOptions(handleLogout, navigation)}>
      <Stack.Screen name="Dashboard">
        {(props) => <DashboardScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Inventory">
        {(props) => <InventoryScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Resupply">
        {(props) => <ResupplyScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Sales">
        {(props) => <SalesScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Reports">
        {(props) => <ReportsScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Suppliers">
        {(props) => <SuppliersScreen {...props} userMode={userMode} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// 🔹 Auth stack
function AuthStack({ setUserMode }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} setUserMode={setUserMode} />}
      </Stack.Screen>
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [userMode, setUserMode] = useState(null); // server | client | null

  useEffect(() => {
    const setupDB = async () => {
      const db = await getDBConnection();
      await createTables(db);
    };
    setupDB();
  }, []);

  const handleLogout = (navigation) => {
    setUserMode(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <NavigationContainer key={userMode}> 
      {userMode === 'server' ? (
        <ServerStack handleLogout={handleLogout} userMode={userMode} />
      ) : userMode === 'client' ? (
        <ClientStack handleLogout={handleLogout} userMode={userMode} />
      ) : (
        <AuthStack setUserMode={setUserMode} />
      )}
    </NavigationContainer>
  );
}
