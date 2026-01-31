// Same API as your web app, but adjusted for React Native
const API_BASE_URL = 'http://192.168.1.3:5000/api'; // Replace X with your computer's IP
// OR use your localhost IP
// const API_BASE_URL = 'http://10.0.2.2:5000/api'; // For Android emulator
// const API_BASE_URL = 'http://localhost:5000/api'; // For iOS simulator

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

// ORDERS
export const getOrders = async () => {
  try {
    const data = await apiRequest('/orders');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrder = async (id) => {
  try {
    const data = await apiRequest(`/orders/${id}`);
    return data.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const createOrder = async (orderData) => {
  try {
    const data = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const data = await apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const data = await apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// PRODUCTS
export const getProducts = async () => {
  try {
    const data = await apiRequest('/products');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (productData) => {
  try {
    const data = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const data = await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// CUSTOMERS
export const getCustomers = async () => {
  try {
    const data = await apiRequest('/customers');
    return data.data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// SEARCH
export const searchOrders = async (query) => {
  try {
    const data = await apiRequest(`/orders/search?q=${encodeURIComponent(query)}`);
    return data.data || [];
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
};

// STATISTICS
export const getStats = async () => {
  try {
    const data = await apiRequest('/stats');
    return data.data || {};
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
};

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    return { success: true, message: 'Connected to backend' };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { 
      success: false, 
      error: 'Cannot connect to backend. Make sure: 1. Backend is running, 2. Correct IP address, 3. Same WiFi network' 
    };
  }
};

export default {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getProducts,
  createProduct,
  deleteProduct,
  getCustomers,
  searchOrders,
  getStats,
  testBackendConnection,
};