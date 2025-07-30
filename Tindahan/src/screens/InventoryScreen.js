import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, TextInput, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', sku: '', description: '', unit_price: '', supplier_id: null,
  });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInventory();
    fetchSuppliers();
  }, []);

  const fetchInventory = async () => {
    const db = await getDBConnection();
    const [res] = await db.executeSql(
      `SELECT p.product_id, p.name, p.sku, p.description, p.unit_price, p.supplier_id,
              i.quantity, i.expiration_date,
              (SELECT unit_cost FROM Resupplied_items r WHERE r.product_id = p.product_id ORDER BY r.resupply_date DESC LIMIT 1) as last_unit_cost
       FROM Products p
       LEFT JOIN Inventory i ON i.product_id = p.product_id`
    );
    const items = [];
    for (let i = 0; i < res.rows.length; i++) {
      items.push(res.rows.item(i));
    }
    setInventory(items);
  };

  const fetchSuppliers = async () => {
    const db = await getDBConnection();
    const [res] = await db.executeSql('SELECT supplier_id, name FROM Suppliers');
    const list = [];
    for (let i = 0; i < res.rows.length; i++) list.push(res.rows.item(i));
    setSuppliers(list);
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.unit_price || !newItem.supplier_id) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }
    const db = await getDBConnection();
    const existing = await db.executeSql(`SELECT * FROM Products WHERE name = ?`, [newItem.name]);
    if (existing[0].rows.length > 0) {
      Alert.alert('Duplicate Name', 'A product with this name already exists.');
      return;
    }
    await db.executeSql(
      `INSERT INTO Products (sku, name, description, unit_price, supplier_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        newItem.sku || null,
        newItem.name,
        newItem.description,
        parseFloat(newItem.unit_price),
        parseInt(newItem.supplier_id),
      ]
    );
    setShowAddModal(false);
    setNewItem({ name: '', sku: '', description: '', unit_price: '', supplier_id: null });
    fetchInventory();
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const db = await getDBConnection();
    await db.executeSql(
      `UPDATE Products SET sku = ?, name = ?, description = ?, unit_price = ?, supplier_id = ? WHERE product_id = ?`,
      [
        editingItem.sku,
        editingItem.name,
        editingItem.description,
        parseFloat(editingItem.unit_price),
        parseInt(editingItem.supplier_id),
        editingItem.product_id,
      ]
    );
    setShowEditModal(false);
    setEditingItem(null);
    fetchInventory();
  };

  const handleDelete = async (product_id) => {
    const db = await getDBConnection();
    await db.executeSql(`DELETE FROM Products WHERE product_id = ?`, [product_id]);
    await db.executeSql(`DELETE FROM Inventory WHERE product_id = ?`, [product_id]);
    fetchInventory();
  };

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
              <Text>Quantity: {item.quantity ?? 0}</Text>
              <Text>Expires: {item.expiration_date ?? 'N/A'}</Text>
              <Text>Unit Price: ₱{item.unit_price ?? '0.00'}</Text>
              <Text>Last Cost: ₱{item.last_unit_cost ?? '0.00'}</Text>
              <View className="flex-row mt-2 space-x-2">
                <TouchableOpacity onPress={() => handleEditItem(item)} className="bg-blue-500 px-2 py-1 rounded">
                  <Text className="text-white text-sm">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.product_id)} className="bg-red-500 px-2 py-1 rounded">
                  <Text className="text-white text-sm">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <Button title="Add New Item" onPress={() => setShowAddModal(true)} />

        {/* Add Modal */}
        <Modal visible={showAddModal} animationType="slide">
          <ScrollView className="p-4">
            <Text className="text-lg font-bold mb-2">Add New Product</Text>
            <TextInput placeholder="SKU (optional)" value={newItem.sku} onChangeText={(text) => setNewItem({ ...newItem, sku: text })} className="border p-2 my-1 rounded" />
            <TextInput placeholder="Name" value={newItem.name} onChangeText={(text) => setNewItem({ ...newItem, name: text })} className="border p-2 my-1 rounded" />
            <TextInput placeholder="Description" value={newItem.description} onChangeText={(text) => setNewItem({ ...newItem, description: text })} className="border p-2 my-1 rounded" />
            <TextInput placeholder="Unit Price" value={newItem.unit_price} keyboardType="numeric" onChangeText={(text) => setNewItem({ ...newItem, unit_price: text })} className="border p-2 my-1 rounded" />
            <Text className="mt-2 mb-1">Select Supplier:</Text>
            <View className="border rounded mb-3">
              <Picker selectedValue={newItem.supplier_id} onValueChange={(value) => setNewItem({ ...newItem, supplier_id: value })}>
                <Picker.Item label="Select Supplier" value={null} />
                {suppliers.map((sup) => (
                  <Picker.Item key={sup.supplier_id} label={sup.name} value={sup.supplier_id} />
                ))}
              </Picker>
            </View>
            <Button title="Submit" onPress={handleAddItem} />
            <View className="mt-2" />
            <Button title="Cancel" onPress={() => setShowAddModal(false)} color="red" />
          </ScrollView>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} animationType="slide">
          <ScrollView className="p-4">
            <Text className="text-lg font-bold mb-2">Edit Product</Text>
            <TextInput placeholder="SKU" value={editingItem?.sku} onChangeText={(text) => setEditingItem({ ...editingItem, sku: text })} className="border p-2 my-1 rounded" />
            <TextInput placeholder="Name" value={editingItem?.name} onChangeText={(text) => setEditingItem({ ...editingItem, name: text })} className="border p-2 my-1 rounded" />
            <TextInput placeholder="Description" value={editingItem?.description} onChangeText={(text) => setEditingItem({ ...editingItem, description: text })} className="border p-2 my-1 rounded" />
            <TextInput placeholder="Unit Price" value={editingItem?.unit_price?.toString()} keyboardType="numeric" onChangeText={(text) => setEditingItem({ ...editingItem, unit_price: text })} className="border p-2 my-1 rounded" />
            <Text className="mt-2 mb-1">Select Supplier:</Text>
            <View className="border rounded mb-3">
              <Picker selectedValue={editingItem?.supplier_id} onValueChange={(value) => setEditingItem({ ...editingItem, supplier_id: value })}>
                <Picker.Item label="Select Supplier" value={null} />
                {suppliers.map((sup) => (
                  <Picker.Item key={sup.supplier_id} label={sup.name} value={sup.supplier_id} />
                ))}
              </Picker>
            </View>
            <Button title="Save Changes" onPress={handleSaveEdit} />
            <View className="mt-2" />
            <Button title="Cancel" onPress={() => setShowEditModal(false)} color="red" />
          </ScrollView>
        </Modal>
      </View>
    </MainLayout>
  );
}
