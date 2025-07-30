import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function SuppliersScreen() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const db = await getDBConnection();
    const [res] = await db.executeSql('SELECT * FROM Suppliers');
    const list = [];
    for (let i = 0; i < res.rows.length; i++) list.push(res.rows.item(i));
    setSuppliers(list);
  };

  const handleSave = async () => {
    const db = await getDBConnection();
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');

    if (editingId) {
      await db.executeSql(
        'UPDATE Suppliers SET name=?, contact_info=?, address=? WHERE supplier_id=?',
        [name, contact, address, editingId]
      );
    } else {
      await db.executeSql(
        'INSERT INTO Suppliers (name, contact_info, address) VALUES (?, ?, ?)',
        [name, contact, address]
      );
    }

    setName('');
    setContact('');
    setAddress('');
    setEditingId(null);
    fetchSuppliers();
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.supplier_id);
    setName(supplier.name);
    setContact(supplier.contact_info);
    setAddress(supplier.address);
  };

  const handleDelete = async (id) => {
    const db = await getDBConnection();
    await db.executeSql('DELETE FROM Suppliers WHERE supplier_id=?', [id]);
    fetchSuppliers();
  };

  return (
    <MainLayout>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Suppliers</Text>

        <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderBottomWidth: 1, marginVertical: 5 }} />
        <TextInput placeholder="Contact Info" value={contact} onChangeText={setContact} style={{ borderBottomWidth: 1, marginVertical: 5 }} />
        <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={{ borderBottomWidth: 1, marginVertical: 5 }} />
        <Button title={editingId ? 'Update Supplier' : 'Add Supplier'} onPress={handleSave} />

        <FlatList
          data={suppliers}
          keyExtractor={(item) => item.supplier_id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>{item.name}</Text>
              <Text>{item.contact_info}</Text>
              <Text>{item.address}</Text>
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button title="Delete" onPress={() => handleDelete(item.supplier_id)} color="red" />
            </View>
          )}
        />
      </View>
    </MainLayout>
  );
}