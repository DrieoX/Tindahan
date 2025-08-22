import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MainLayout({ children, userMode }) {
  const navigation = useNavigation();

  // Define menu items dynamically based on userMode
  const menuItems = [
    { name: 'Dashboard', label: 'Home' },
    { name: 'Inventory', label: 'Inventory' },
    { name: 'Resupply', label: 'Resupply' },
  ];

  if (userMode === 'server') {
    menuItems.push(
      { name: 'Sales', label: 'Sales' },
      { name: 'Reports', label: 'Reports' },
      { name: 'Suppliers', label: 'Suppliers' }
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => navigation.navigate(item.name)}
          >
            <Text style={styles.link}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>{children}</View>
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
