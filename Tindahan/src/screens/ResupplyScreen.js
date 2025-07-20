import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function ResupplyScreen() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const db = await getDBConnection();
    const [res] = await db.executeSql(`SELECT product_id, name FROM Products`);

    const items = [];
    for (let i = 0; i < res.rows.length; i++) {
      items.push(res.rows.item(i));
    }
    setProducts(items);
  };

  const handleResupply = async () => {
    if (!selectedProductId || !quantity || !expirationDate) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const db = await getDBConnection();
    await db.executeSql(
      `INSERT INTO Inventory (product_id, quantity, expiration_date) VALUES (?, ?, ?)`,
      [selectedProductId, parseInt(quantity), expirationDate]
    );

    Alert.alert('Success', 'Product resupplied successfully.');
    setQuantity('');
    setExpirationDate('');
    setSelectedProductId(null);
  };

  return (
    <MainLayout>
      <ScrollView className="bg-white px-4 py-6 flex-1">
        <Text className="text-lg font-bold mb-4">Resupply Inventory</Text>

        {products.map((product) => (
          <Button
            key={product.product_id}
            title={`Select ${product.name}`}
            onPress={() => setSelectedProductId(product.product_id)}
            color={selectedProductId === product.product_id ? 'green' : 'gray'}
          />
        ))}

        <TextInput
          placeholder="Quantity"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          className="border p-2 mt-4 rounded"
        />

        <TextInput
          placeholder="Expiration Date (YYYY-MM-DD)"
          value={expirationDate}
          onChangeText={setExpirationDate}
          className="border p-2 mt-2 rounded"
        />

        <Button title="Submit Resupply" onPress={handleResupply} className="mt-4" />
      </ScrollView>
    </MainLayout>
  );
}
