// ============================================
// API CONFIGURATION
// ============================================
const BASE_URL = 'http://192.168.1.2:5000'; // Change to your backend IP
let userToken = null;

// ============================================
// MOCK DATA (Fallback when backend is unavailable)
// ============================================
const MOCK_DATA = {
  products: [
    { _id: '1', name: 'Laptop', price: 40000, category: 'Electronics', stock: 50 },
    { _id: '2', name: 'Mouse', price: 299.9, category: 'Electronics', stock: 20 },
    { _id: '3', name: 'Keyboard', price: 899.9, category: 'Electronics', stock: 15 },
    { _id: '4', name: 'Notebook', price: 1200.99, category: 'Stationery', stock: 30 },
    { _id: '5', name: 'Pen', price: 50, category: 'Stationery', stock: 50 },
  ],
  
  orders: [
    { 
      _id: '1', 
      orderNumber: 1001, 
      customerName: 'Israel Alazar', 
      total: 40500, 
      status: 'pending',
      items: [{ productName: 'Laptop', quantity: 1, price: 40000 }],
      createdAt: '2024-01-15',
    },
    { 
      _id: '2', 
      orderNumber: 1002, 
      customerName: 'Mesay Mesay', 
      total: 899.9, 
      status: 'completed',
      items: [{ productName: 'Keyboard', quantity: 1, price: 899.9 }],
      createdAt: '2024-01-14',
    },
  ],
  
  customers: [
    { _id: '1', name: 'Israel Alazar', email: 'israel@example.com', phone: '0934565435' },
    { _id: '2', name: 'Mesay Mesay', email: 'mesi@example.com', phone: '0987786556' },
    { _id: '3', name: 'Yirdaw Fetari', email: 'tenaw@example.com', phone: '0937365210' },
  ],
  
  notifications: [
    { 
      _id: '1', 
      title: 'New Order', 
      message: 'Order #1001 has been placed', 
      type: 'order',
      read: false,
      time: '5 min ago',
    },
    { 
      _id: '2', 
      title: 'Low Stock Alert', 
      message: 'Mouse is running low (5 items left)', 
      type: 'stock',
      read: false,
      time: '2 hours ago',
    },
  ],
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
const isAuthenticated = () => !!userToken;

// ============================================
// AUTHENTICATION API
// ============================================
export const login = async (email, password) => {
  try {
    // Try real backend first
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      userToken = data.token;
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.log('Backend unavailable, using mock login');
    
    // Fallback to mock login
    await simulateDelay(1000);
    
    if (email === 'is5416@gmail.com' && password === 'israelisrael') {
      userToken = 'mock-jwt-token-12345';
      return {
        success: true,
        message: 'Login successful (mock)',
        token: userToken,
        user: { _id: '1', name: 'israel', email: 'is5416@gmail.com' }
      };
    }
    
    return {
      success: false,
      message: 'Invalid credentials'
    };
  }
};

export const logout = async () => {
  userToken = null;
  return { success: true, message: 'Logged out' };
};

// ============================================
// PRODUCTS API
// ============================================
export const getProducts = async () => {
  try {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/products`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Using mock products data');
    await simulateDelay(800);
    return { success: true, data: MOCK_DATA.products };
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(productData),
    });
    
    return response.json();
  } catch (error) {
    console.log('Using mock product creation');
    await simulateDelay(800);
    
    const newProduct = {
      _id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
    };
    
    MOCK_DATA.products.push(newProduct);
    
    return {
      success: true,
      message: 'Product created (mock)',
      data: newProduct
    };
  }
};

// ============================================
// ORDERS API
// ============================================
export const getOrders = async () => {
  try {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Using mock orders data');
    await simulateDelay(800);
    return { success: true, data: MOCK_DATA.orders };
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(orderData),
    });
    
    return response.json();
  } catch (error) {
    console.log('Using mock order creation');
    await simulateDelay(1000);
    
    const lastOrderNumber = MOCK_DATA.orders.length > 0 
      ? Math.max(...MOCK_DATA.orders.map(o => o.orderNumber))
      : 1000;
    
    const newOrder = {
      _id: Date.now().toString(),
      orderNumber: lastOrderNumber + 1,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    MOCK_DATA.orders.unshift(newOrder);
    
    return {
      success: true,
      message: 'Order created (mock)',
      data: newOrder
    };
  }
};

// ============================================
// CUSTOMERS API
// ============================================
export const getCustomers = async () => {
  try {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/customers`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Using mock customers data');
    await simulateDelay(800);
    return { success: true, data: MOCK_DATA.customers };
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(customerData),
    });
    
    return response.json();
  } catch (error) {
    console.log('Using mock customer creation');
    await simulateDelay(800);
    
    const newCustomer = {
      _id: Date.now().toString(),
      ...customerData,
      createdAt: new Date().toISOString(),
    };
    
    MOCK_DATA.customers.push(newCustomer);
    
    return {
      success: true,
      message: 'Customer created (mock)',
      data: newCustomer
    };
  }
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const getNotifications = async () => {
  try {
    if (!isAuthenticated()) throw new Error('Not authenticated');
    
    const response = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Using mock notifications data');
    await simulateDelay(600);
    return { success: true, data: MOCK_DATA.notifications };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    
    return response.json();
  } catch (error) {
    console.log('Using mock mark as read');
    await simulateDelay(300);
    
    MOCK_DATA.notifications.forEach(notif => {
      notif.read = true;
    });
    
    return {
      success: true,
      message: 'All notifications marked as read (mock)'
    };
  }
};