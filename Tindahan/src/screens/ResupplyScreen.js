import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function ResupplyScreen() {
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
      const isoDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      setExpirationDate(isoDate);
    }
  };

  return (
    <MainLayout>
      <ScrollView className="bg-white px-4 py-6 flex-1">
        <Text className="text-lg font-bold mb-4">Resupply Inventory</Text>

        <Text>Supplier:</Text>
        <Picker selectedValue={selectedSupplierId} onValueChange={(v) => setSelectedSupplierId(v)}>
          <Picker.Item label="Select Supplier" value={null} />
          {suppliers.map((sup) => (
            <Picker.Item key={sup.supplier_id} label={sup.name} value={sup.supplier_id} />
          ))}
        </Picker>

        <Text>Product:</Text>
        <Picker selectedValue={selectedProductId} onValueChange={(v) => setSelectedProductId(v)}>
          <Picker.Item label="Select Product" value={null} />
          {products.map((prod) => (
            <Picker.Item key={prod.product_id} label={prod.name} value={prod.product_id} />
          ))}
        </Picker>

        <TextInput
          placeholder="Quantity"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          className="border p-2 mt-4 rounded"
        />

        <TextInput
          placeholder="Unit Cost"
          keyboardType="numeric"
          value={unitCost}
          onChangeText={setUnitCost}
          className="border p-2 mt-2 rounded"
        />

        <TextInput
          placeholder="Threshold Quantity"
          keyboardType="numeric"
          value={threshold}
          onChangeText={setThreshold}
          className="border p-2 mt-2 rounded"
        />

        <Text className="mt-3 mb-1">Expiration Date</Text>
        <Button title={expirationDate || 'Select Date'} onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={expirationDate ? new Date(expirationDate) : new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <Button title="Submit Resupply" onPress={handleResupply} className="mt-4" />
      </ScrollView>
    </MainLayout>
  );
}
