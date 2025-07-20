import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { loginUser } from '../services/UserService';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await loginUser(username, password);
    if (result.success) {
      Alert.alert('Welcome', `Logged in as ${result.user.role}`);
      navigation.navigate('Dashboard', { user: result.user });
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

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ marginTop: 20, color: 'blue', textAlign: 'center' }}>
          Not registered yet? Register here
        </Text>
      </TouchableOpacity>
    </View>
  );
}