import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const db = await getDBConnection();
      const [res] = await db.executeSql(
        `SELECT p.name, i.quantity, i.expiration_date
         FROM Inventory i
         JOIN Products p ON p.product_id = i.product_id`
      );
      const items = [];
      for (let i = 0; i < res.rows.length; i++) {
        items.push(res.rows.item(i));
      }
      setInventory(items);
    };
    fetchInventory();
  }, []);

  return (
    <MainLayout>
      <View className="p-4 bg-white flex-1">
        <Text className="text-xl font-bold mb-4">Inventory</Text>
        <FlatList
          data={inventory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="bg-gray-100 p-3 mb-2 rounded-xl">
              <Text className="font-semibold">{item.name}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text>Expires: {item.expiration_date}</Text>
            </View>
          )}
        />
      </View>
    </MainLayout>
  );
}
