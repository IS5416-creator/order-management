const API_BASE_URL = 'https://order-management-1-9jl1.onrender.com/api';


const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

export const login = async (email, password) => {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

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

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Registration failed.'
    };
  }
};

export const getProfile = async () => {
  try {
    return await apiRequest('/auth/profile');
  } catch (error) {
    return { 
      success: false, 
      message: error.message || 'Failed to fetch profile.'
    };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getOrders = async () => {
  try {
    const data = await apiRequest('/orders');
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrder = async (id) => {
  try {
    const data = await apiRequest(`/orders/${id}`);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
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

export const getProducts = async () => {
  try {
    const data = await apiRequest('/products');
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProduct = async (id) => {
  try {
    const data = await apiRequest(`/products/${id}`);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
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

export const getCustomers = async () => {
  try {
    const data = await apiRequest('/customers');
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const getCustomer = async (id) => {
  try {
    const data = await apiRequest(`/customers/${id}`);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
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

export const searchOrders = async (query) => {
  try {
    const data = await apiRequest(`/orders/search?q=${encodeURIComponent(query)}`);
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    const data = await apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
    return data.success ? data.data || [] : [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

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
      error: 'Cannot connect to backend. Make sure Express server is running on port 5000.' 
    };
  }
};


export const resetPassword = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text(); 

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid response');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Password reset failed');
  }

  return data;
};