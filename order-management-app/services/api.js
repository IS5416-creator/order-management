const API_BASE_URL = 'http://192.168.1.4:5000/api'; // Update IP as needed

const getAuthHeaders = () => {
  const token = localStorage?.getItem('token') || null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // For React Native, we'll use AsyncStorage instead
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth functions
export const login = async (email, password) => {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    return data;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Login failed. Please check your credentials.'
    };
  }
};

export const register = async (userData) => {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    return data;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Registration failed.'
    };
  }
};

export const logout = () => {
  // AsyncStorage will be cleared in React Native
  return { success: true };
};

// Order functions
export const getOrders = async () => {
  try {
    const data = await apiRequest('/orders');
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const createOrder = async (orderData) => {
  try {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to create order' 
    };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    return await apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to update order status' 
    };
  }
};

export const deleteOrder = async (id) => {
  try {
    return await apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to delete order' 
    };
  }
};

// Product functions
export const getProducts = async () => {
  try {
    const data = await apiRequest('/products');
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (productData) => {
  try {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to create product' 
    };
  }
};

export const updateProduct = async (id, productData) => {
  try {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to update product' 
    };
  }
};

export const deleteProduct = async (productId) => {
  try {
    return await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to delete product' 
    };
  }
};

// Customer functions
export const getCustomers = async () => {
  try {
    const data = await apiRequest('/customers');
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const createCustomer = async (customerData) => {
  try {
    return await apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to create customer' 
    };
  }
};

export const updateCustomer = async (id, customerData) => {
  try {
    return await apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to update customer' 
    };
  }
};

export const deleteCustomer = async (id) => {
  try {
    return await apiRequest(`/customers/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to delete customer' 
    };
  }
};

// Stats
export const getStats = async () => {
  try {
    const data = await apiRequest('/stats');
    return data.success ? data.data : {};
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
};

export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Backend not responding. Status: ${response.status}`);
    }
    return { 
      success: true, 
      message: 'Backend connection successful' 
    };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { 
      success: false, 
      error: 'Cannot connect to backend. Make sure Express server is running.' 
    };
  }
};