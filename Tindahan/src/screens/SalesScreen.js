import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, StyleSheet } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function SalesScreen() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const db = await getDBConnection();
    const result = await db.executeSql(
      `SELECT p.product_id, p.name, p.unit_price, i.quantity as stock, p.sku
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

  const addItemByBarcode = () => {
    if (!barcodeInput) return;
    
    const product = products.find(p => p.sku === barcodeInput);
    if (product) {
      addItem(product);
      setBarcodeInput('');
    } else {
      setMessage('Product not found with this barcode');
    }
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
    setBarcodeInput('');
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  return (
    <MainLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>SmartTindahan</Text>
        
        <Text style={styles.subheader}>BORNOK Store</Text>
        <Text style={styles.description}>Scan items and process customer transactions</Text>

        {/* Barcode Scanner Section */}
        <View style={styles.barcodeSection}>
          <Text style={styles.sectionHeader}>[ ] Barcode Scanner</Text>
          <Text style={styles.scannerLabel}>Scan or Enter Barcode</Text>
          
          <TextInput
            style={styles.barcodeInput}
            placeholder="Scan barcode here..."
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={addItemByBarcode}
          />
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.searchButtonText}>Search Products...</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionHeader}>Quick Add Products</Text>
          <Text style={styles.instructionText}>
            Use the barcode scanner above or scan products directly with a barcode scanner device.
          </Text>
        </View>

        {/* Current Order Section */}
        <View style={styles.orderSection}>
          <Text style={styles.sectionHeader}>Current Order</Text>
          
          {selectedItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Cart is empty</Text>
              <Text style={styles.emptyCartSubText}>Scan items to add them to the cart</Text>
            </View>
          ) : (
            <FlatList
              data={selectedItems}
              keyExtractor={(item) => item.product_id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.orderItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemPrice}>₱{item.unit_price.toFixed(2)}</Text>
                    <Text style={styles.itemStock}>Stock: {item.stock}</Text>
                  </View>
                  <View style={styles.quantitySection}>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity.toString()}
                      onChangeText={(text) =>
                        updateQuantity(item.product_id, parseInt(text) || 0)
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.itemSubtotal}>
                      ₱{(item.quantity * item.unit_price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* Grand Total */}
        {selectedItems.length > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalText}>Total: ₱{totalAmount.toFixed(2)}</Text>
          </View>
        )}

        {/* Buttons */}
        {selectedItems.length > 0 && (
          <TouchableOpacity
            onPress={handleSale}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Process Payment</Text>
          </TouchableOpacity>
        )}

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        {/* Modal for Product Selection */}
        <Modal visible={showModal} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Select Product</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.product_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => addItem(item)}
                  style={styles.productItem}
                >
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDetails}>
                    ₱{item.unit_price.toFixed(2)} • Stock: {item.stock} • SKU: {item.sku}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
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
    marginBottom: 20,
    color: '#6b7280',
  },
  barcodeSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  scannerLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  barcodeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  quickAddSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  orderSection: {
    marginBottom: 20,
  },
  emptyCart: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyCartSubText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  orderItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: '#374151',
  },
  itemStock: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    padding: 8,
    width: 60,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    textAlign: 'center',
    color: '#16a34a',
    fontSize: 14,
    marginBottom: 16,
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
  productItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  productDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  closeButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});