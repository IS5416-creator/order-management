import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

// Import API functions
import {
  login as apiLogin,
  logout as apiLogout,
  getProducts,
  getOrders,
  getCustomers,
  getNotifications,
  markAllNotificationsAsRead,
} from './src/api/api';

// ============================================
// LOGIN SCREEN COMPONENT
// ============================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    
    try {
      const result = await apiLogin(email, password);
      
      if (result.success) {
        onLogin(result.user);
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={styles.loginTitle}>📦 Order Management</Text>
        <Text style={styles.loginSubtitle}>Sign in to continue</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.demoText}>
          Demo: admin@example.com / admin123
        </Text>
      </View>
    </View>
  );
}

// ============================================
// PRODUCTS SCREEN COMPONENT
// ============================================
function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>ETB{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.productDetails}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={[
          styles.productStock,
          item.stock < 10 && styles.lowStock
        ]}>
          Stock: {item.stock}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// ORDERS SCREEN COMPONENT
// ============================================
function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const result = await getOrders();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.customerName}>{item.customerName}</Text>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderDate}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
        <Text style={styles.orderTotal}>ETB{item.total?.toFixed(2) || '0.00'}</Text>
      </View>
      
      <Text style={styles.itemsCount}>
        {item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// CUSTOMERS SCREEN COMPONENT
// ============================================
function CustomersScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      const result = await getCustomers();
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const renderCustomerItem = ({ item }) => (
    <View style={styles.customerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0)?.toUpperCase() || 'C'}
        </Text>
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerEmail}>{item.email}</Text>
        <Text style={styles.customerPhone}>{item.phone}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// NOTIFICATIONS SCREEN COMPONENT
// ============================================
function NotificationsScreen({ notifications: propNotifications, onMarkAsRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications(propNotifications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map(notif => 
      notif._id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    if (onMarkAsRead) onMarkAsRead(updatedNotifications);
  };

  const clearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to mark all as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await markAllNotificationsAsRead();
              const cleared = notifications.map(notif => ({ ...notif, read: true }));
              setNotifications(cleared);
              if (onMarkAsRead) onMarkAsRead(cleared);
            } catch (error) {
              const cleared = notifications.map(notif => ({ ...notif, read: true }));
              setNotifications(cleared);
              if (onMarkAsRead) onMarkAsRead(cleared);
            }
          }
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleMarkAsRead(item._id)}
    >
      <Text style={styles.notificationIcon}>
        {item.type === 'order' ? '🛒' : item.type === 'stock' ? '📦' : '🔔'}
      </Text>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>{item.time || 'Just now'}</Text>
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        {!item.read && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.screenContainer}>
      <View style={styles.notificationsHeader}>
        <Text style={styles.notificationsTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
      />
    </View>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('products');
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(null);
    setCurrentScreen('login');
    setDrawerOpen(false);
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    setDrawerOpen(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'products':
        return <ProductsScreen />;
      case 'orders':
        return <OrdersScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'notifications':
        return <NotificationsScreen 
          notifications={notifications} 
          onMarkAsRead={setNotifications} 
        />;
      default:
        return <ProductsScreen />;
    }
  };

  // Side Drawer Component
  const Drawer = () => {
    if (!drawerOpen || currentScreen === 'login') return null;

    const menuItems = [
      { id: 'products', icon: '📦', label: 'Products', screen: 'products' },
      { id: 'orders', icon: '📋', label: 'Orders', screen: 'orders' },
      { id: 'customers', icon: '👥', label: 'Customers', screen: 'customers' },
      { id: 'notifications', icon: '🔔', label: 'Notifications', screen: 'notifications' },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
      <>
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
        />
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Order Management</Text>
            <Text style={styles.drawerSubtitle}>
              {user?.name || 'Admin Panel'}
            </Text>
          </View>

          <ScrollView style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  currentScreen === item.screen && styles.activeMenuItem,
                ]}
                onPress={() => navigateTo(item.screen)}
              >
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <View style={styles.menuItemContent}>
                  <Text style={[
                    styles.menuItemLabel,
                    currentScreen === item.screen && styles.activeMenuItemLabel,
                  ]}>
                    {item.label}
                  </Text>
                  {item.screen === 'notifications' && unreadCount > 0 && (
                    <View style={styles.drawerBadge}>
                      <Text style={styles.drawerBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // Header Component
  const Header = () => {
    if (currentScreen === 'login') return null;

    const screenTitles = {
      products: 'Products',
      orders: 'Orders',
      customers: 'Customers',
      notifications: 'Notifications',
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setDrawerOpen(true)}
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {screenTitles[currentScreen] || 'Order Management'}
        </Text>

        <View style={styles.headerRight}>
          {currentScreen === 'notifications' ? null : (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigateTo('notifications')}
            >
              <Text style={styles.headerNotificationIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      {renderScreen()}
      <Drawer />
    </View>
  );
}

// ============================================
// STYLES
// ============================================
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
  // Login Styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loginCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 14,
  },
  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  // Product Card
  productCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCategory: {
    color: '#666',
    fontSize: 14,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  lowStock: {
    color: 'red',
    fontWeight: '600',
  },
  // Order Card
  orderCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  orderDate: {
    color: '#888',
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemsCount: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  // Customer Card
  customerCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  // Notification Card
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  unreadTitle: {
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 8,
  },
  // Header Styles
  header: {
    height: 60,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerNotificationIcon: {
    fontSize: 20,
    color: 'white',
  },
  headerBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Drawer Styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  drawerHeader: {
    backgroundColor: '#007AFF',
    padding: 25,
    paddingTop: 40,
    paddingBottom: 20,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  menuItems: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeMenuItem: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  activeMenuItemLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  drawerBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  drawerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff8f8',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});