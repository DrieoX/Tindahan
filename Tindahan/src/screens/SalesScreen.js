import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function SalesScreen() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const db = await getDBConnection();
    const result = await db.executeSql('SELECT * FROM Products');
    const items = result[0].rows.raw();
    setProducts(items);
  };

  const handleSale = async () => {
    if (!selectedProduct || !quantity) return;
    const db = await getDBConnection();
    await db.executeSql(
      'INSERT INTO Sales (sales_date) VALUES (date("now"))'
    );
    const saleRes = await db.executeSql('SELECT last_insert_rowid() as id');
    const saleId = saleRes[0].rows.item(0).id;

    await db.executeSql(
      'INSERT INTO Sale_items (sales_id, product_id, quantity, amount) VALUES (?, ?, ?, ?)',
      [saleId, selectedProduct.product_id, quantity, quantity * selectedProduct.price]
    );
    await db.executeSql(
      'UPDATE Inventory SET quantity = quantity - ? WHERE product_id = ?',
      [quantity, selectedProduct.product_id]
    );
    setMessage('Sale recorded successfully');
  };

  return (
    <MainLayout>
      <View className="p-4">
        <Text className="text-xl font-bold mb-2">New Sale</Text>
        <FlatList
          data={products}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedProduct(item)} className="mb-2">
              <Text className="text-blue-600">{item.name} - ₱{item.price}</Text>
            </TouchableOpacity>
          )}
        />
        <TextInput
          placeholder="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          className="border p-2 my-3"
        />
        <TouchableOpacity onPress={handleSale} className="bg-blue-600 p-3 rounded">
          <Text className="text-white text-center">Submit Sale</Text>
        </TouchableOpacity>
        {message ? <Text className="mt-2 text-green-600">{message}</Text> : null}
      </View>
    </MainLayout>
  );
}
