import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import { getDBConnection } from '../db/db';
import MainLayout from '../components/MainLayout';

export default function ReportsScreen({ userMode }) {
  const [report, setReport] = useState([]);
  const [mode] = useState(userMode || 'client'); // default client if not passed

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const db = await getDBConnection();
    const res = await db.executeSql(
      `SELECT Sales.sales_date, Products.name, Sale_items.quantity, Sale_items.amount
       FROM Sale_items
       JOIN Sales ON Sales.sales_id = Sale_items.sales_id
       JOIN Products ON Products.product_id = Sale_items.product_id
       ORDER BY Sales.sales_date DESC`
    );
    setReport(res[0].rows.raw());
  };

  return (
    <MainLayout userMode={mode.toLowerCase()}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>SmartTindahan</Text>
        
        <Text style={styles.subheader}>Sales Reports</Text>
        <Text style={styles.description}>Track your sales performance and analytics</Text>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>₱0.00</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={styles.metricSubLabel}>Today</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>₱0.00</Text>
            <Text style={styles.metricLabel}>Avg. Transaction</Text>
            <Text style={styles.metricSubLabel}>Today</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Recent Sales</Text>
          {report.length === 0 ? (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>No sales in selected period</Text>
              <Text style={styles.placeholderSubText}>Sales data will appear here once you start making transactions</Text>
            </View>
          ) : (
            <FlatList
              data={report}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.reportItem}>
                  <Text style={styles.reportDate}>{item.sales_date}</Text>
                  <Text style={styles.reportName}>{item.name}</Text>
                  <Text style={styles.reportDetails}>Qty: {item.quantity}, ₱{item.amount}</Text>
                </View>
              )}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Top Selling Products</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>No sales data available</Text>
            <Text style={styles.placeholderSubText}>Top selling products will appear here</Text>
          </View>
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
    marginBottom: 16,
    color: '#6b7280',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  metricSubLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#374151',
  },
  reportItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  reportName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  reportDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  placeholderCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  placeholderSubText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});