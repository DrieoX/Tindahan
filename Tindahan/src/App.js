import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
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

// 🔹 Custom header with logout using hook
const LogoutButton = ({ handleLogout }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => handleLogout(navigation)}
      style={{ marginRight: 15 }}
    >
      <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
    </TouchableOpacity>
  );
};

const screenOptions = (handleLogout) => ({
  headerShown: true,
  headerBackVisible: false,
  headerRight: () => <LogoutButton handleLogout={handleLogout} />,
});

// 🔹 Client-only stack
function ClientStack({ handleLogout, userMode }) {
  return (
    <Stack.Navigator screenOptions={screenOptions(handleLogout)}>
      <Stack.Screen name="Dashboard">
        {(props) => <DashboardScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Inventory">
        {(props) => <InventoryScreen {...props} userMode={userMode} />}
      </Stack.Screen>
      <Stack.Screen name="Resupply">
        {(props) => <ResupplyScreen {...props} userMode={userMode} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// 🔹 Server-only stack
function ServerStack({ handleLogout, userMode }) {
  return (
    <Stack.Navigator screenOptions={screenOptions(handleLogout)}>
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

// 🔹 AuthStack (before login)
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
  const [userMode, setUserMode] = useState(null); // server or client

  useEffect(() => {
    const setupDB = async () => {
      const db = await getDBConnection();
      await createTables(db);
    };
    setupDB();
  }, []);

  const handleLogout = (navigation) => {
    setUserMode(null);
    navigation.replace('Login'); // back to login
  };

  return (
    <NavigationContainer>
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
