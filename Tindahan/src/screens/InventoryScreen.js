import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, TextInput, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Count expired and low stock items
  const expiredCount = inventory.filter(item => {
    if (!item.expiration_date) return false;
    const expiryDate = new Date(item.expiration_date);
    const today = new Date();
    return expiryDate < today;
  }).length;

  const lowStockCount = inventory.filter(item => {
    const minStock = 10; // Default minimum stock
    return item.quantity < minStock;
  }).length;

  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.header}>SmartTindahan</Text>
        
        <Text style={styles.subheader}>Inventory Management</Text>
        <Text style={styles.description}>Manage your products, track stock levels and expiration dates</Text>
        
        {(expiredCount > 0 || lowStockCount > 0) && (
          <View style={styles.attentionContainer}>
            <Text style={styles.attentionHeader}>Attention Required</Text>
            {expiredCount > 0 && (
              <Text style={styles.attentionText}>{expiredCount} product(s) have expired</Text>
            )}
            {lowStockCount > 0 && (
              <Text style={styles.attentionText}>{lowStockCount} product(s) are low in stock</Text>
            )}
          </View>
        )}
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name, barcode, or category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <Text style={styles.sectionHeader}>Products</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Barcode</Text>
            <Text style={styles.tableHeaderCell}>Price</Text>
            <Text style={styles.tableHeaderCell}>Stock</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Expiry Date</Text>
            <Text style={styles.tableHeaderCell}>Status</Text>
            <Text style={styles.tableHeaderCell}>Actions</Text>
          </View>
          
          <FlatList
            data={filteredInventory}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              // Determine status
              let status = 'Good';
              let statusStyle = styles.statusGood;
              
              if (item.expiration_date) {
                const expiryDate = new Date(item.expiration_date);
                const today = new Date();
                if (expiryDate < today) {
                  status = 'Expired';
                  statusStyle = styles.statusExpired;
                }
              }
              
              if (item.quantity < 10) { // Assuming min stock is 10
                status = 'Low Stock';
                statusStyle = styles.statusLowStock;
              }
              
              return (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>{item.name}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.sku || 'N/A'}</Text>
                  <Text style={styles.tableCell}>₱{item.unit_price || '0.00'}</Text>
                  <Text style={styles.tableCell}>{item.quantity || 0}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.expiration_date || 'N/A'}</Text>
                  <Text style={[styles.tableCell, statusStyle]}>{status}</Text>
                  <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.editButton}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>

        {/* Add Modal */}
        <Modal visible={showAddModal} animationType="slide">
          <ScrollView style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Add New Product</Text>
            <TextInput
              placeholder="Scan or Enter SKU"
              value={newItem.sku}
              autoFocus={true}
              onChangeText={(text) => setNewItem({ ...newItem, sku: text })}
              style={styles.input}
            />
            <TextInput 
              placeholder="Name" 
              value={newItem.name} 
              onChangeText={(text) => setNewItem({ ...newItem, name: text })} 
              style={styles.input}
            />
            <TextInput 
              placeholder="Description" 
              value={newItem.description} 
              onChangeText={(text) => setNewItem({ ...newItem, description: text })} 
              style={styles.input}
            />
            <TextInput 
              placeholder="Unit Price" 
              value={newItem.unit_price} 
              keyboardType="numeric" 
              onChangeText={(text) => setNewItem({ ...newItem, unit_price: text })} 
              style={styles.input}
            />
            <Text style={styles.pickerLabel}>Select Supplier:</Text>
            <View style={styles.pickerContainer}>
              <Picker 
                selectedValue={newItem.supplier_id} 
                onValueChange={(value) => setNewItem({ ...newItem, supplier_id: value })}
              >
                <Picker.Item label="Select Supplier" value={null} />
                {suppliers.map((sup) => (
                  <Picker.Item key={sup.supplier_id} label={sup.name} value={sup.supplier_id} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddItem}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={showEditModal} animationType="slide">
          <ScrollView style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Edit Product</Text>
            <TextInput
              placeholder="Scan or Enter SKU"
              value={editingItem?.sku}
              autoFocus={true}
              onChangeText={(text) => setEditingItem({ ...editingItem, sku: text })}
              style={styles.input}
            />
            <TextInput 
              placeholder="Name" 
              value={editingItem?.name} 
              onChangeText={(text) => setEditingItem({ ...editingItem, name: text })} 
              style={styles.input}
            />
            <TextInput 
              placeholder="Description" 
              value={editingItem?.description} 
              onChangeText={(text) => setEditingItem({ ...editingItem, description: text })} 
              style={styles.input}
            />
            <TextInput 
              placeholder="Unit Price" 
              value={editingItem?.unit_price?.toString()} 
              keyboardType="numeric" 
              onChangeText={(text) => setEditingItem({ ...editingItem, unit_price: text })} 
              style={styles.input}
            />
            <Text style={styles.pickerLabel}>Select Supplier:</Text>
            <View style={styles.pickerContainer}>
              <Picker 
                selectedValue={editingItem?.supplier_id} 
                onValueChange={(value) => setEditingItem({ ...editingItem, supplier_id: value })}
              >
                <Picker.Item label="Select Supplier" value={null} />
                {suppliers.map((sup) => (
                  <Picker.Item key={sup.supplier_id} label={sup.name} value={sup.supplier_id} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSaveEdit}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </View>
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
    marginBottom: 16,
    color: '#6b7280',
  },
  attentionContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  attentionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#92400e',
  },
  attentionText: {
    fontSize: 14,
    color: '#92400e',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: '600',
    fontSize: 12,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  statusExpired: {
    color: '#dc2626',
    fontWeight: '600',
  },
  statusLowStock: {
    color: '#ea580c',
    fontWeight: '600',
  },
  statusGood: {
    color: '#16a34a',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});