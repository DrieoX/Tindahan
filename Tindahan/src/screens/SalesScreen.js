import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function SalesScreen() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // multiple products w/ qty
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const db = await getDBConnection();
    const result = await db.executeSql(
      `SELECT p.product_id, p.name, p.unit_price, i.quantity as stock
       FROM Products p
       JOIN Inventory i ON p.product_id = i.product_id`
    );
    const rows = result[0].rows.raw();
    const cleaned = rows.map(r => ({
      ...r,
      unit_price: parseFloat(r.unit_price) || 0,
      stock: parseInt(r.stock) || 0,
    }));
    setProducts(cleaned);
  };

  const addItem = (product) => {
    if (selectedItems.find((item) => item.product_id === product.product_id)) return;
    setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    setShowModal(false);
  };

  const updateQuantity = (productId, qty) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleSale = async () => {
    if (selectedItems.length === 0) return;
    const db = await getDBConnection();

    await db.executeSql(`INSERT INTO Sales (sales_date) VALUES (date("now"))`);
    const saleRes = await db.executeSql(`SELECT last_insert_rowid() as id`);
    const saleId = saleRes[0].rows.item(0).id;

    for (const item of selectedItems) {
      const amount = item.quantity * item.unit_price;

      await db.executeSql(
        `INSERT INTO Sale_items (sales_id, product_id, quantity, amount) VALUES (?, ?, ?, ?)`,
        [saleId, item.product_id, item.quantity, amount]
      );

      await db.executeSql(
        `UPDATE Inventory SET quantity = quantity - ? WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }

    setMessage('Sale recorded successfully');
    setSelectedItems([]);
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  return (
    <MainLayout>
      <View className="p-4 flex-1">
        <Text className="text-xl font-bold mb-4">New Sale</Text>

        {/* Selected Items List (Horizontal scroll) */}
        {selectedItems.length === 0 ? (
          <Text className="text-gray-500 mb-2">No items added yet.</Text>
        ) : (
          <FlatList
            data={selectedItems}
            keyExtractor={(item) => item.product_id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                key={item.product_id}
                className="border p-3 m-1 rounded-lg w-48"
              >
                {/* Item Name */}
                <Text className="font-semibold mb-1">{item.name}</Text>

                {/* Price + Stock */}
                <Text className="text-sm text-gray-600">
                  ₱{item.unit_price.toFixed(2)}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  Stock: {item.stock}
                </Text>

                {/* Quantity Input */}
                <TextInput
                  value={item.quantity.toString()}
                  onChangeText={(text) =>
                    updateQuantity(item.product_id, parseInt(text) || 0)
                  }
                  keyboardType="numeric"
                  className="border w-16 text-center mb-2 self-start"
                />

                {/* Subtotal */}
                <Text className="font-semibold">
                  ₱{(item.quantity * item.unit_price).toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}

        {/* Grand Total */}
        <View className="py-3 border-t mt-2">
          <Text className="text-lg font-bold">Total: ₱{totalAmount.toFixed(2)}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-gray-600 p-3 rounded mb-2"
        >
          <Text className="text-white text-center">+ Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSale}
          className="bg-blue-600 p-3 rounded"
        >
          <Text className="text-white text-center">Submit Sale</Text>
        </TouchableOpacity>
        {message ? <Text className="mt-2 text-green-600">{message}</Text> : null}

        {/* Modal for Product Selection */}
        <Modal visible={showModal} animationType="slide">
          <View className="flex-1 p-4">
            <Text className="text-lg font-bold mb-3">Select Product</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.product_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => addItem(item)}
                  className="p-3 border-b"
                >
                  <Text>{item.name} - ₱{item.unit_price.toFixed(2)}</Text>
                  <Text className="text-sm text-gray-500">
                    Stock: {item.stock}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="bg-red-500 p-3 rounded mt-4"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </MainLayout>
  );
}
