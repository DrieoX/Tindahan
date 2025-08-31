import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
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
      setUserMode(mode.toLowerCase());
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cart Icon Placeholder */}
      <Text style={styles.cartIcon}>🛒</Text>

      <Text style={styles.title}>Sign in to your account</Text>
      <Text style={styles.subtitle}>Access your POS system</Text>

      <TextInput
        placeholder="Email address"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#999"
      />

      {/* Keep Mode Picker (hidden in design, optional) */}
      <Picker
        selectedValue={mode}
        onValueChange={(itemValue) => setMode(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Server" value="Server" />
        <Picker.Item label="Client" value="Client" />
      </Picker>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={{ color: '#2563EB' }}>Sign up here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  cartIcon: {
    fontSize: 40,
    marginBottom: 20,
    color: '#2563EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 5,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registerText: {
    color: '#4B5563',
    fontSize: 14,
  },
});
