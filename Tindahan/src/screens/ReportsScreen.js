import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function ReportsScreen() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const db = await getDBConnection();
    const res = await db.executeSql(
      `SELECT Sales.sales_date, Products.name, Sale_items.quantity, Sale_items.amount
       FROM Sale_items
       JOIN Sales ON Sales.sales_id = Sale_items.sales_id
       JOIN Products ON Products.product_id = Sale_items.product_id
       ORDER BY Sales.sales_date DESC`
    );
    setReport(res[0].rows.raw());
  };

  return (
    <MainLayout>
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">Sales Report</Text>
        <FlatList
          data={report}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="mb-2 border-b pb-2">
              <Text>{item.sales_date} - {item.name}</Text>
              <Text>Qty: {item.quantity}, ₱{item.amount}</Text>
            </View>
          )}
        />
      </View>
    </MainLayout>
  );
}
