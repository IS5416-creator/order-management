import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Searchbar,
  Menu,
  Divider,
  Chip,
  IconButton
} from 'react-native-paper';
import { getOrders, updateOrderStatus, searchOrders } from '../services/api';

export default function Orders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, selectedStatus]);

  const filterOrders = async () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery.trim()) {
      try {
        const searchResults = await searchOrders(searchQuery);
        filtered = searchResults;
      } catch (error) {
        console.error('Search error:', error);
      }
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId || order.id === orderId
            ? { ...order, status }
            : order
        )
      );
      
      setStatusModalVisible(false);
      setSelectedOrder(null);
      
      // Show success message (you can use a toast library)
      alert(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#28a745';
      case 'processing': return '#007bff';
      case 'cancelled': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const renderOrderItem = ({ item }) => (
    <Card style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { orderId: item._id || item.id })}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View>
            <Title style={styles.orderNumber}>
              Order #{item.orderNumber || item._id?.slice(-6)}
            </Title>
            <Paragraph style={styles.customerName}>
              {item.customerName || 'Anonymous'}
            </Paragraph>
          </View>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
          >
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Pending'}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>
              {item.items?.length || 0} item(s)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              ETB {(item.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.orderActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setSelectedOrder(item);
              setNewStatus(item.status);
              setStatusModalVisible(true);
            }}
            style={styles.actionButton}
          >
            Change Status
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('OrderDetail', { orderId: item._id || item.id })}
            style={styles.actionButton}
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.headerTitle}>Orders</Title>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('CreateOrder')}
            >
              New Order
            </Button>
          </View>

          {/* Search and Filter */}
          <View style={styles.filterContainer}>
            <Searchbar
              placeholder="Search orders..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setStatusMenuVisible(true)}
                  icon="filter"
                  style={styles.filterButton}
                >
                  {selectedStatus === 'all' ? 'All Status' : selectedStatus}
                </Button>
              }
            >
              {statusOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setSelectedStatus(option.value);
                    setStatusMenuVisible(false);
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{orders.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>
                {orders.filter(o => o.status === 'pending').length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={styles.statValue}>
                {orders.filter(o => o.status === 'completed').length}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || selectedStatus !== 'all' 
                ? 'No orders match your criteria'
                : 'No orders yet'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateOrder')}
              style={styles.emptyButton}
            >
              Create First Order
            </Button>
          </View>
        }
      />

      {/* Status Change Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title>Change Order Status</Title>
              <Paragraph>
                Order #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}
              </Paragraph>
              
              <View style={styles.statusOptions}>
                {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      newStatus === status && styles.statusOptionSelected,
                      { borderColor: getStatusColor(status) }
                    ]}
                    onPress={() => setNewStatus(status)}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      newStatus === status && styles.statusOptionTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setStatusModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleStatusChange(selectedOrder?._id || selectedOrder?.id, newStatus)}
                  style={styles.modalButton}
                  disabled={!newStatus || newStatus === selectedOrder?.status}
                >
                  Update
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  headerCard: {
    margin: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    minWidth: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  orderCard: {
    marginBottom: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 18,
    marginBottom: 5,
  },
  customerName: {
    color: '#666',
    fontSize: 14,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 10,
  },
  orderDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    color: '#007bff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 20,
  },
  statusOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  statusOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    minWidth: 100,
  },
});