import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MainLayout({ children }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.link}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
          <Text style={styles.link}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Resupply')}>
          <Text style={styles.link}>Resupply</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
          <Text style={styles.link}>Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
          <Text style={styles.link}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: 120,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  link: {
    marginVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
});
