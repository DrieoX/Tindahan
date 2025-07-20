import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { getDBConnection } from '../db/db';
import { useNavigation } from '@react-navigation/native';
import MainLayout from '../components/MainLayout';

export default function DashboardScreen({ route }) {
  const [user, setUser] = useState(route.params?.user);
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
        `SELECT SUM(amount) as total FROM Sale_items INNER JOIN Sales ON Sales.sales_id = Sale_items.sales_id WHERE sales_date = ?`,
        [today]
      ),
      db.executeSql(`SELECT COUNT(*) as count FROM Products`),
      db.executeSql(`SELECT COUNT(*) as count FROM Inventory WHERE quantity <= threshold`),
      db.executeSql(`SELECT COUNT(*) as count FROM Inventory WHERE expiration_date <= ?`, [today]),
      db.executeSql(
        `SELECT p.name, i.expiration_date, i.quantity FROM Inventory i JOIN Products p ON i.product_id = p.product_id WHERE i.expiration_date <= ?`,
        [today]
      ),
      db.executeSql(
        `SELECT p.name, i.quantity FROM Inventory i JOIN Products p ON i.product_id = p.product_id WHERE i.quantity <= i.threshold`
      )
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
    <MainLayout>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Welcome back, {user?.username}!
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <StatCard label="Today's Sales" value={`₱ ${stats.salesToday.toFixed(2)}`} color="#a3e635" />
          <StatCard label="Total Products" value={stats.totalProducts} color="#60a5fa" />
          <StatCard label="Expired Items" value={stats.expired} color="#f87171" />
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Alerts & Notifications
        </Text>
        {notifications.map((item, index) => (
          <View
            key={index}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 12,
              backgroundColor: item.type === 'expired' ? '#fee2e2' : '#fef08a',
            }}
          >
            <Text style={{ fontWeight: '600' }}>
              {item.type === 'expired' ? 'Product Expired:' : 'Low Stock Alert:'} {item.name}
            </Text>
            <Text style={{ fontSize: 13 }}>
              {item.type === 'expired'
                ? `Expired on ${item.expiration_date}`
                : `Only ${item.quantity} left in stock`}
            </Text>
          </View>
        ))}
      </ScrollView>
    </MainLayout>
  );
}

const StatCard = ({ label, value, color }) => (
  <View style={{ backgroundColor: color, padding: 16, borderRadius: 12, flex: 1, marginHorizontal: 4 }}>
    <Text style={{ color: '#1f2937' }}>{label}</Text>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{value}</Text>
  </View>
);
