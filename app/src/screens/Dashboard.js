import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { getOrders, getStats, getProducts } from '../services/api';

export default function Dashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const loadData = async () => {
    try {
      const [ordersData, statsData, productsData] = await Promise.all([
        getOrders(),
        getStats(),
        getProducts(),
      ]);

      setRecentOrders(ordersData.slice(0, 5)); // Show last 5 orders
      setStats(statsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>Total Orders</Title>
            <Paragraph style={styles.statNumber}>
              {stats.totalOrders || 0}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title>Total Products</Title>
            <Paragraph style={styles.statNumber}>
              {stats.totalProducts || products.length}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title>Revenue</Title>
            <Paragraph style={styles.statNumber}>
              ETB {(stats.totalRevenue || 0).toFixed(2)}
            </Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('CreateOrder')}
              style={styles.actionButton}
            >
              New Order
            </Button>
            <Button
              mode="outlined"
              icon="package-variant"
              onPress={() => navigation.navigate('CreateProduct')}
              style={styles.actionButton}
            >
              Add Product
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Orders */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title>Recent Orders</Title>
            <IconButton
              icon="arrow-right"
              onPress={() => navigation.navigate('Orders')}
            />
          </View>
          
          {recentOrders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            recentOrders.map((order) => (
              <TouchableOpacity 
                key={order._id || order.id}
                style={styles.orderItem}
                onPress={() => navigation.navigate('Orders')}
              >
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>
                    Order #{order.orderNumber || order.id?.slice(-6)}
                  </Text>
                  <Text style={styles.orderCustomer}>
                    {order.customerName || 'Anonymous'}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderAmount}>
                    ETB {(order.total || 0).toFixed(2)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Low Stock Products */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title>Low Stock</Title>
            <IconButton
              icon="arrow-right"
              onPress={() => navigation.navigate('Products')}
            />
          </View>
          
          {products.filter(p => p.stock < 10).length === 0 ? (
            <Text style={styles.emptyText}>All products are well-stocked</Text>
          ) : (
            products
              .filter(p => p.stock < 10)
              .slice(0, 3)
              .map((product) => (
                <TouchableOpacity 
                  key={product._id || product.id}
                  style={styles.productItem}
                  onPress={() => navigation.navigate('Products')}
                >
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockText}>
                      Stock: {product.stock}
                    </Text>
                    {product.stock === 0 && (
                      <Text style={styles.outOfStock}>OUT OF STOCK</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return '#28a745';
    case 'processing':
      return '#007bff';
    case 'cancelled':
      return '#dc3545';
    default:
      return '#ffc107';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  actionsCard: {
    marginBottom: 15,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionCard: {
    marginBottom: 15,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  stockInfo: {
    alignItems: 'flex-end',
  },
  stockText: {
    fontSize: 14,
    color: '#666',
  },
  outOfStock: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});