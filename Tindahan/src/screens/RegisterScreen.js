import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '../services/UserService';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('IT admin');

  const handleRegister = async () => {
    const result = await registerUser(username, password, role);
    if (result.success) {
      Alert.alert('Success', 'User registered! Please login.');
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Register</Text>

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
        style={{ marginBottom: 10, borderBottomWidth: 1 }}
      />

      <Text style={{ marginTop: 10 }}>Select Role:</Text>
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
        style={{ height: 50, marginBottom: 20 }}
      >
        <Picker.Item label="Owner" value="Owner" />
        <Picker.Item label="Staff" value="Staff" />
        <Picker.Item label="IT admin" value="IT admin" />
      </Picker>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}
