// MainLayout.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 200;

export default function MainLayout({ children, userMode }) {
  const navigation = useNavigation();
  const route = useRoute();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const mode = (userMode || 'client').toLowerCase();
  const routeNames = useNavigationState((state) => state?.routeNames ?? []);

  const menuItems = [
    { name: 'Dashboard', label: 'Home' },
    { name: 'Inventory', label: 'Inventory' },
    { name: 'Resupply', label: 'Resupply' },
    { name: 'Suppliers', label: 'Suppliers' },
  ];

  if (mode === 'server') {
    menuItems.push(
      { name: 'Sales', label: 'Sales' },
      { name: 'Reports', label: 'Reports' }
    );
  }

  const handleNav = (name, label) => {
    if (routeNames.includes(name)) {
      navigation.navigate(name);
      closeSidebar();
    } else {
      Alert.alert('Unavailable', `${label} is not available in this mode.`);
    }
  };

  const openSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setSidebarVisible(true);
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setSidebarVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Always visible top bar with Menu button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openSidebar}>
          <Text style={styles.menuTitle}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => handleNav(item.name, item.label)}
            style={styles.menuButton}
          >
            <Text style={styles.link}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Overlay for closing when tapping outside */}
      {sidebarVisible && (
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Main Content */}
      <View style={styles.mainContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    elevation: 2,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 50, // below topBar
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
    zIndex: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  menuButton: {
    paddingVertical: 8,
  },
  link: {
    marginVertical: 6,
    fontSize: 16,
    color: '#1f2937',
  },
  overlay: {
    position: 'absolute',
    top: 50, // same as topBar height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
});
