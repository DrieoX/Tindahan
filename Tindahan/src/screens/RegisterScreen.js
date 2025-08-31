import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { registerUser } from '../services/UserService';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const result = await registerUser(email, password, 'Owner'); // default role for now
    if (result.success) {
      Alert.alert('Success', 'User registered! Please login.');
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cart Icon */}
      <Text style={styles.cartIcon}>🛒</Text>

      {/* Title + Subtitle */}
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Start managing your business with our POS system
      </Text>

      {/* Input fields */}
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Name of the Store"
        value={storeName}
        onChangeText={setStoreName}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <TextInput
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
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

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
        style={styles.input}
        placeholderTextColor="#999"
      />

      {/* Button */}
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerText}>Create account</Text>
      </TouchableOpacity>

      {/* Footer link */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={{ color: '#2563EB' }}>Sign in here</Text>
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
    textAlign: 'center',
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
  registerButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    color: '#4B5563',
    fontSize: 14,
  },
});
