// screens/CreateOrderScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator
} from 'react-native';
import * as api from '../services/api';

export default function CreateOrderScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [notes, setNotes] = useState('');
  
  // Modals
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchQuery))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const loadInitialData = async () => {
    try {
      const [customersData, productsData] = await Promise.all([
        api.getCustomers(),
        api.getProducts()
      ]);
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    const existingItem = orderItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setOrderItems(prev =>
        prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * product.price }
            : item
        )
      );
    } else {
      setOrderItems(prev => [
        ...prev,
        {
          product,
          quantity: 1,
          price: product.price,
          total: product.price
        }
      ]);
    }
    setProductModalVisible(false);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    setOrderItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setOrderItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const validateOrder = () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return false;
    }
    
    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one product to the order');
      return false;
    }
    
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateOrder()) return;
    
    setIsSubmitting(true);
    
    const orderData = {
      customerId: selectedCustomer.id,
      items: orderItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price
      })),
      notes: notes.trim(),
      status: 'pending',
      subtotal: parseFloat(calculateTotals().subtotal),
      tax: parseFloat(calculateTotals().tax),
      total: parseFloat(calculateTotals().total)
    };
    
    try {
      const result = await api.createOrder(orderData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Order created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to create order');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => {
        setSelectedCustomer(item);
        setCustomerModalVisible(false);
        setSearchQuery('');
      }}
    >
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerEmail}>{item.email}</Text>
      </View>
      {item.phone && (
        <Text style={styles.customerPhone}>{item.phone}</Text>
      )}
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productItem,
        item.stock < 1 && styles.outOfStockItem
      ]}
      onPress={() => {
        if (item.stock < 1) {
          Alert.alert('Out of Stock', 'This product is currently out of stock.');
          return;
        }
        handleAddProduct(item);
      }}
      disabled={item.stock < 1}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>ETB{parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.productMeta}>
        <Text style={styles.productCategory}>{item.category || 'Uncategorized'}</Text>
        <Text style={[
          styles.stockBadge,
          { backgroundColor: item.stock > 10 ? '#d4edda' : item.stock > 0 ? '#fff3cd' : '#f8d7da' }
        ]}>
          Stock: {item.stock || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <Text style={styles.orderItemName}>{item.product.name}</Text>
        <TouchableOpacity
          onPress={() => handleRemoveItem(item.product.id)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderItemDetails}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
          >
            <Text style={[
              styles.quantityButtonText,
              item.quantity >= item.product.stock && styles.disabledButton
            ]}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceInfo}>
          <Text style={styles.unitPrice}>ETB{parseFloat(item.price).toFixed(2)} each</Text>
          <Text style={styles.itemTotal}>ETB{item.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  const totals = calculateTotals();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Order</Text>
      </View>

      {/* Customer Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <TouchableOpacity
          style={styles.customerSelector}
          onPress={() => setCustomerModalVisible(true)}
        >
          {selectedCustomer ? (
            <View style={styles.selectedCustomer}>
              <Text style={styles.selectedCustomerName}>{selectedCustomer.name}</Text>
              <Text style={styles.selectedCustomerEmail}>{selectedCustomer.email}</Text>
            </View>
          ) : (
            <Text style={styles.selectorPlaceholder}>Select a customer...</Text>
          )}
          <Text style={styles.selectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setProductModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>

        {orderItems.length === 0 ? (
          <View style={styles.emptyItems}>
            <Text style={styles.emptyText}>No items added yet</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setProductModalVisible(true)}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orderItems}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.product.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder=""
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>ETB{totals.subtotal}</Text>
        </View>
        
        
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>ETB{totals.total}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleCreateOrder}
          disabled={isSubmitting || orderItems.length === 0 || !selectedCustomer}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Create Order</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Customer Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customerModalVisible}
        onRequestClose={() => {
          setCustomerModalVisible(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity
                onPress={() => {
                  setCustomerModalVisible(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder=""
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>

            <FlatList
              data={filteredCustomers}
              renderItem={renderCustomerItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>
                    {searchQuery ? 'No customers found' : 'No customers available'}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={productModalVisible}
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity
                onPress={() => setProductModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.emptyModal}>
                  <Text style={styles.emptyModalText}>No products available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d'
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dee2e6'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 10
  },
  customerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da'
  },
  selectedCustomer: {
    flex: 1
  },
  selectedCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  selectedCustomerEmail: {
    fontSize: 14,
    color: '#6c757d'
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1
  },
  selectorArrow: {
    fontSize: 12,
    color: '#6c757d'
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  emptyItems: {
    alignItems: 'center',
    padding: 30
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 15
  },
  addFirstButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  addFirstButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  orderItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8d7da',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButtonText: {
    color: '#721c24',
    fontSize: 20,
    lineHeight: 20
  },
  orderItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#495057'
  },
  disabledButton: {
    color: '#adb5bd'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center'
  },
  priceInfo: {
    alignItems: 'flex-end'
  },
  unitPrice: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745'
  },
  notesInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100
  },
  summarySection: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#dee2e6'
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 15
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6c757d'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745'
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
    marginRight: 10,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600'
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6c757d'
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6'
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    fontSize: 16
  },
  customerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  customerInfo: {
    marginBottom: 5
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  customerEmail: {
    fontSize: 14,
    color: '#6c757d'
  },
  customerPhone: {
    fontSize: 14,
    color: '#495057'
  },
  productItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  outOfStockItem: {
    opacity: 0.5
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745'
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productCategory: {
    fontSize: 14,
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  stockBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: '500'
  },
  emptyModal: {
    padding: 30,
    alignItems: 'center'
  },
  emptyModalText: {
    fontSize: 16,
    color: '#6c757d'
  }
});