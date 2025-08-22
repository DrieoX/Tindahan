import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { loginUser } from '../services/UserService';

export default function LoginScreen({ navigation, setUserMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('Client'); // 🔥 Session-only mode

  const handleLogin = async () => {
    const result = await loginUser(username, password);
    if (result.success) {
      Alert.alert('Welcome', `Logged in as ${result.user.role} in ${mode} mode`);
      // 🔹 Instead of navigate, set the mode (switches stack to AppStack)
      setUserMode(mode.toLowerCase()); 
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ marginBottom: 10, borderBottomWidth: 1 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ marginBottom: 20, borderBottomWidth: 1 }}
      />

      <Text style={{ marginTop: 10 }}>Select Mode:</Text>
      <Picker
        selectedValue={mode}
        onValueChange={(itemValue) => setMode(itemValue)}
        style={{ height: 50, marginBottom: 20 }}
      >
        <Picker.Item label="Server" value="Server" />
        <Picker.Item label="Client" value="Client" />
      </Picker>

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ marginTop: 20, color: 'blue', textAlign: 'center' }}>
          Not registered yet? Register here
        </Text>
      </TouchableOpacity>
    </View>
  );
}
