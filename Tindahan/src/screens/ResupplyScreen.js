import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';
import { useRoute } from '@react-navigation/native';

export default function ResupplyScreen({ userMode }) {
  const route = useRoute();
  const [mode] = useState(userMode || route.params?.userMode || 'client');

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [threshold, setThreshold] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const db = await getDBConnection();
    const [prodRes] = await db.executeSql(`SELECT product_id, name FROM Products`);
    const [supRes] = await db.executeSql(`SELECT supplier_id, name FROM Suppliers`);

    const prodList = [];
    const supList = [];
    for (let i = 0; i < prodRes.rows.length; i++) prodList.push(prodRes.rows.item(i));
    for (let i = 0; i < supRes.rows.length; i++) supList.push(supRes.rows.item(i));

    setProducts(prodList);
    setSuppliers(supList);
  };

  const handleResupply = async () => {
    if (!selectedProductId || !selectedSupplierId || !quantity || !unitCost || !expirationDate || !threshold) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const db = await getDBConnection();

    await db.executeSql(
      `INSERT INTO Resupplied_items (product_id, supplier_id, quantity, unit_cost, resupply_date, expiration_date) 
       VALUES (?, ?, ?, ?, date('now'), ?)`,
      [selectedProductId, selectedSupplierId, parseInt(quantity), parseFloat(unitCost), expirationDate]
    );

    await db.executeSql(
      `INSERT OR IGNORE INTO Inventory (product_id, quantity, expiration_date, threshold) 
       VALUES (?, 0, ?, ?)`,
      [selectedProductId, expirationDate, parseInt(threshold)]
    );

    await db.executeSql(
      `UPDATE Inventory SET quantity = quantity + ? WHERE product_id = ?`,
      [parseInt(quantity), selectedProductId]
    );

    Alert.alert('Success', 'Product resupplied successfully.');
    setQuantity('');
    setUnitCost('');
    setThreshold('');
    setExpirationDate('');
    setSelectedProductId(null);
    setSelectedSupplierId(null);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setExpirationDate(isoDate);
    }
  };

  return (
    <MainLayout userMode={userMode}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>SmartTindahan</Text>
        <Text style={styles.subheader}>Resupply Inventory</Text>
        <Text style={styles.description}>Add new stock to your inventory</Text>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Supplier:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedSupplierId} onValueChange={(v) => setSelectedSupplierId(v)}>
              <Picker.Item label="Select Supplier" value={null} />
              {suppliers.map((sup) => (
                <Picker.Item key={sup.supplier_id} label={sup.name} value={sup.supplier_id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Product:</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedProductId} onValueChange={(v) => setSelectedProductId(v)}>
              <Picker.Item label="Select Product" value={null} />
              {products.map((prod) => (
                <Picker.Item key={prod.product_id} label={prod.name} value={prod.product_id} />
              ))}
            </Picker>
          </View>

          <TextInput placeholder="Quantity" keyboardType="numeric" value={quantity} onChangeText={setQuantity} style={styles.input} />
          <TextInput placeholder="Unit Cost" keyboardType="numeric" value={unitCost} onChangeText={setUnitCost} style={styles.input} />
          <TextInput placeholder="Threshold Quantity" keyboardType="numeric" value={threshold} onChangeText={setThreshold} style={styles.input} />

          <Text style={styles.label}>Expiration Date</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{expirationDate || 'Select Date'}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={expirationDate ? new Date(expirationDate) : new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleResupply}>
            <Text style={styles.submitButtonText}>Submit Resupply</Text>
          </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#374151',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3b82f6', // Changed to blue
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});