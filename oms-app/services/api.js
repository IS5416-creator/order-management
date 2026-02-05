// services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.4:5000/api';

/* =====================
   Helpers
===================== */

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiRequest = async (endpoint, options = {}) => {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
};

/* =====================
   Auth
===================== */

export const login = async (email, password) => {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const register = async (userData) => {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('token');
  return !!token;
};

export const getCurrentUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/* =====================
   Orders
===================== */

export const getOrders = async () => {
  try {
    const data = await apiRequest('/orders');
    return data.data || [];
  } catch {
    return [];
  }
};

export const getOrder = async (id) => {
  try {
    const data = await apiRequest(`/orders/${id}`);
    return data.data;
  } catch {
    return null;
  }
};

export const createOrder = async (orderData) => {
  try {
    return await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    return await apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteOrder = async (id) => {
  try {
    return await apiRequest(`/orders/${id}`, { method: 'DELETE' });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

/* =====================
   Products
===================== */

export const getProducts = async () => {
  try {
    const data = await apiRequest('/products');
    return data.data || [];
  } catch {
    return [];
  }
};

export const getProduct = async (id) => {
  try {
    const data = await apiRequest(`/products/${id}`);
    return data.data;
  } catch {
    return null;
  }
};

export const createProduct = async (productData) => {
  try {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateProduct = async (id, productData) => {
  try {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    return { success: false, message: error.message };
  }
};

