import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';
import { useRoute } from '@react-navigation/native';

export default function SuppliersScreen({ userMode }) {
  const route = useRoute();
  const [mode] = useState(userMode || route.params?.userMode || 'client');

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
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this supplier?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const db = await getDBConnection();
          await db.executeSql('DELETE FROM Suppliers WHERE supplier_id=?', [id]);
          fetchSuppliers();
        },
      },
    ]);
  };

  return (
    <MainLayout userMode={userMode}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>SmartTindahan</Text>
        <Text style={styles.subheader}>Suppliers Management</Text>
        <Text style={styles.description}>Manage your product suppliers and contact information</Text>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formHeader}>{editingId ? 'Edit Supplier' : 'Add New Supplier'}</Text>
          <TextInput placeholder="Supplier Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Contact Information" value={contact} onChangeText={setContact} style={styles.input} />
          <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{editingId ? 'Update Supplier' : 'Add Supplier'}</Text>
          </TouchableOpacity>
        </View>

        {/* Suppliers List */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionHeader}>Suppliers List</Text>
          <FlatList
            data={suppliers}
            keyExtractor={(item) => item.supplier_id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No suppliers found</Text>
                <Text style={styles.emptySubText}>Add suppliers to get started</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.supplierCard}>
                <Text style={styles.supplierName}>{item.name}</Text>
                {item.contact_info ? <Text style={styles.supplierDetail}>Contact: {item.contact_info}</Text> : null}
                {item.address ? <Text style={styles.supplierDetail}>Address: {item.address}</Text> : null}
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.supplier_id)} style={styles.deleteButton}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  subheader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: '#374151',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    color: '#6b7280',
  },
  formContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  emptyState: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  supplierCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  supplierDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});