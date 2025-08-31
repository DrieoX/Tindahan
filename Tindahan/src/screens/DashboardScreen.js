import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getDBConnection } from '../db/db';
import { useNavigation, useRoute } from '@react-navigation/native';
import MainLayout from '../components/MainLayout';

export default function DashboardScreen({ userMode }) {
  const route = useRoute();
  const [user] = useState(route.params?.user || {}); 
  const [mode] = useState(userMode || 'Client'); 
  const [stats, setStats] = useState({
    salesToday: 0,
    totalProducts: 0,
    lowStock: 0,
    expired: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const db = await getDBConnection();
    const today = new Date().toISOString().split('T')[0];

    const queries = [
      db.executeSql(
        `SELECT SUM(amount) as total 
         FROM Sale_items 
         INNER JOIN Sales ON Sales.sales_id = Sale_items.sales_id 
         WHERE sales_date = ?`,
        [today]
      ),
      db.executeSql(`SELECT COUNT(*) as count FROM Products`),
      db.executeSql(`SELECT COUNT(*) as count FROM Inventory WHERE quantity <= threshold`),
      db.executeSql(`SELECT COUNT(*) as count FROM Inventory WHERE expiration_date <= ?`, [today]),
      db.executeSql(
        `SELECT p.name, i.expiration_date, i.quantity 
         FROM Inventory i 
         JOIN Products p ON i.product_id = p.product_id 
         WHERE i.expiration_date <= ?`,
        [today]
      ),
      db.executeSql(
        `SELECT p.name, i.quantity 
         FROM Inventory i 
         JOIN Products p ON i.product_id = p.product_id 
         WHERE i.quantity <= i.threshold`
      ),
    ];

    const results = await Promise.all(queries);

    const salesToday = results[0][0].rows.item(0).total || 0;
    const totalProducts = results[1][0].rows.item(0).count;
    const lowStock = results[2][0].rows.item(0).count;
    const expired = results[3][0].rows.item(0).count;

    const expAlerts = [];
    for (let i = 0; i < results[4][0].rows.length; i++) {
      expAlerts.push({ ...results[4][0].rows.item(i), type: 'expired' });
    }
    for (let i = 0; i < results[5][0].rows.length; i++) {
      expAlerts.push({ ...results[5][0].rows.item(i), type: 'low' });
    }

    setStats({ salesToday, totalProducts, lowStock, expired });
    setNotifications(expAlerts);
  };

  return (
    <MainLayout userMode={mode.toLowerCase()}>
      <ScrollView style={{ padding: 16 }}>
        
        {/* Welcome Text */}
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>
          Welcome back, {user?.username || 'User'}!
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
          Here's what's happening with your business today.
        </Text>

        {/* Stat Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          <StatCard label="Today's Sales" value={`₱${stats.salesToday.toFixed(2)}`} bg="#d1fae5" text="#065f46" /> 
          <StatCard label="Total Products" value={stats.totalProducts} bg="#dbeafe" text="#1e40af" />
          <StatCard label="Low Stock" value={stats.lowStock} bg="#fef9c3" text="#854d0e" />
          <StatCard label="Expired Items" value={stats.expired} bg="#fee2e2" text="#991b1b" />
        </View>

        {/* Alerts & Notifications */}
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Alerts & Notifications
        </Text>
        {notifications.length === 0 ? (
          <Text style={{ color: '#6b7280', fontSize: 14 }}>No alerts right now.</Text>
        ) : (
          notifications.map((item, index) => (
            <View
              key={index}
              style={{
                padding: 12,
                marginBottom: 10,
                borderRadius: 12,
                backgroundColor: item.type === 'expired' ? '#fee2e2' : '#fef9c3',
              }}
            >
              <Text style={{ fontWeight: '600', marginBottom: 4 }}>
                {item.type === 'expired' ? 'Product Expired:' : 'Low Stock Alert:'} {item.name}
              </Text>
              <Text style={{ fontSize: 13, color: '#374151' }}>
                {item.type === 'expired'
                  ? `Expired on ${item.expiration_date}`
                  : `Only ${item.quantity} left in stock`}
              </Text>
            </View>
          ))
        )}

        {/* Recent Sales */}
        <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
          Recent Sales
        </Text>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#6b7280' }}>No sales yet</Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
            Sales will appear here once you start processing transactions
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <QuickAction label="Start New Sale" desc="Process customer transactions" bg="#dbeafe" />
          <QuickAction label="Manage Inventory" desc="Add or update products" bg="#d1fae5" />
          <QuickAction label="View Reports" desc="Analyze sales performance" bg="#ede9fe" />
        </View>
      </ScrollView>
    </MainLayout>
  );
}

/* Stat Card */
const StatCard = ({ label, value, bg, text }) => (
  <View
    style={{
      backgroundColor: bg,
      padding: 16,
      borderRadius: 12,
      width: '48%',
      marginBottom: 12,
    }}
  >
    <Text style={{ color: '#374151', fontSize: 13 }}>{label}</Text>
    <Text style={{ fontSize: 18, fontWeight: 'bold', color: text }}>{value}</Text>
  </View>
);

/* Quick Action Card */
const QuickAction = ({ label, desc, bg }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: bg,
      padding: 14,
      borderRadius: 12,
      marginHorizontal: 4,
    }}
  >
    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{label}</Text>
    <Text style={{ fontSize: 12, color: '#374151' }}>{desc}</Text>
  </View>
);
