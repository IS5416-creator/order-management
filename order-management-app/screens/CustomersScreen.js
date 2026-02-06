import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCustomers, deleteCustomer } from '../services/api'; 

export default function CustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCustomers();
  }, [loadCustomers]);

  const handleDeleteCustomer = (id) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCustomer(id);
            if (result.success) {
              Alert.alert('Success', 'Customer deleted successfully');
              loadCustomers();
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const renderCustomerItem = ({ item }) => (
    <View style={styles.customerCard}>
      <View style={styles.customerInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        
        <View style={styles.customerDetails}>
          <Text style={styles.customerName}>{item.name || 'Unknown'}</Text>
          <Text style={styles.customerEmail}>{item.email || 'No email'}</Text>
          <Text style={styles.customerPhone}>{item.phone || 'No phone'}</Text>
        </View>
      </View>
      
      <View style={styles.customerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.orderCount || 0}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${item.totalSpent?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCustomer(item.id)}
        >
          <MaterialIcons name="delete" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Info', 'Add customer functionality to be implemented')}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people" size={60} color="#4A90E2" />
            <Text style={styles.emptyText}>No customers yet</Text>
            <Text style={styles.emptySubText}>Customers will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A192F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#0A192F',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  customerCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#888888',
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2D4F8B',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
  },
});