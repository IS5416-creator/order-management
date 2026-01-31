import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  List,
  Divider,
  Chip,
  IconButton,
  RadioButton,
  Modal,
  Portal,
  Dialog,
  PortalProvider
} from 'react-native-paper';
import { getProducts, getCustomers, createOrder } from '../services/api';

export default function CreateOrder({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Form state
  const [customerType, setCustomerType] = useState('existing'); // 'existing' or 'new'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [orderItems, setOrderItems] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, customersData] = await Promise.all([
        getProducts(),
        getCustomers(),
      ]);
      
      setProducts(productsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products and customers');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate customer
    if (customerType === 'existing' && !selectedCustomer) {
      newErrors.customer = 'Please select a customer';
    }
    if (customerType === 'new' && !newCustomer.name.trim()) {
      newErrors.customer = 'Please enter customer name';
    }

    // Validate order items
    if (orderItems.length === 0) {
      newErrors.items = 'Please add at least one product';
    }

    // Validate each item
    orderItems.forEach((item, index) => {
      if (!item.product) {
        newErrors[`item_${index}`] = 'Product is required';
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
      }
      if (item.product && item.quantity > item.product.stock) {
        newErrors[`item_${index}_stock`] = `Only ${item.product.stock} available`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateItemTotal = (price, quantity) => {
    return (parseFloat(price) || 0) * (parseInt(quantity) || 0);
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      const qty = item.quantity || 0;
      return total + (price * qty);
    }, 0);
  };

  const addProductToOrder = () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product');
      return;
    }

    const qty = parseInt(quantity) || 1;
    
    if (qty < 1) {
      Alert.alert('Error', 'Quantity must be at least 1');
      return;
    }

    if (qty > selectedProduct.stock) {
      Alert.alert('Error', `Only ${selectedProduct.stock} units available`);
      return;
    }

    // Check if product already in order
    const existingIndex = orderItems.findIndex(
      item => item.product?._id === selectedProduct._id || 
              item.product?.id === selectedProduct.id
    );

    if (existingIndex > -1) {
      // Update quantity of existing item
      const updatedItems = [...orderItems];
      updatedItems[existingIndex].quantity += qty;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          product: selectedProduct,
          quantity: qty,
        }
      ]);
    }

    // Reset selection
    setSelectedProduct(null);
    setQuantity('1');
    setShowProductModal(false);
  };

  const removeItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = newQuantity;
    setOrderItems(updatedItems);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customerName: customerType === 'existing' 
          ? selectedCustomer.name 
          : newCustomer.name,
        customerEmail: customerType === 'existing'
          ? selectedCustomer.email
          : newCustomer.email || undefined,
        customerPhone: customerType === 'existing'
          ? selectedCustomer.phone
          : newCustomer.phone || undefined,
        items: orderItems.map(item => ({
          productId: item.product._id || item.product.id,
          quantity: item.quantity,
          productName: item.product.name,
        })),
        total: calculateOrderTotal(),
      };

      console.log('Submitting order:', orderData);

      const result = await createOrder(orderData);

      if (result.success) {
        Alert.alert(
          'Success',
          result.message || 'Order created successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setSelectedCustomer(null);
                setNewCustomer({ name: '', email: '', phone: '' });
                setOrderItems([]);
                navigation.navigate('Orders');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title style={styles.headerTitle}>Create New Order</Title>
              <IconButton
                icon="close"
                onPress={() => navigation.goBack()}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Customer Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>1. Customer Information</Title>
            
            <RadioButton.Group
              onValueChange={value => setCustomerType(value)}
              value={customerType}
            >
              <View style={styles.radioRow}>
                <RadioButton value="existing" />
                <Text style={styles.radioLabel}>Existing Customer</Text>
              </View>
              
              {customerType === 'existing' && (
                <View style={styles.customerSelect}>
                  <TextInput
                    label="Select Customer"
                    value={selectedCustomer?.name || ''}
                    mode="outlined"
                    readOnly
                    right={
                      <TextInput.Icon 
                        icon="menu-down" 
                        onPress={() => {}} // Will implement dropdown
                      />
                    }
                    error={!!errors.customer}
                  />
                  {errors.customer && (
                    <Text style={styles.errorText}>{errors.customer}</Text>
                  )}
                  
                  <ScrollView horizontal style={styles.customersScroll}>
                    {customers.map(customer => (
                      <TouchableOpacity
                        key={customer._id || customer.id}
                        style={[
                          styles.customerChip,
                          selectedCustomer?._id === customer._id && styles.customerChipSelected
                        ]}
                        onPress={() => setSelectedCustomer(customer)}
                      >
                        <Text style={styles.customerChipText}>{customer.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.radioRow}>
                <RadioButton value="new" />
                <Text style={styles.radioLabel}>New Customer</Text>
              </View>
              
              {customerType === 'new' && (
                <View style={styles.newCustomerForm}>
                  <TextInput
                    label="Customer Name *"
                    value={newCustomer.name}
                    onChangeText={text => setNewCustomer({...newCustomer, name: text})}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.customer}
                  />
                  
                  <TextInput
                    label="Email"
                    value={newCustomer.email}
                    onChangeText={text => setNewCustomer({...newCustomer, email: text})}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="email-address"
                  />
                  
                  <TextInput
                    label="Phone"
                    value={newCustomer.phone}
                    onChangeText={text => setNewCustomer({...newCustomer, phone: text})}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Products Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>2. Order Items</Title>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setShowProductModal(true)}
              >
                Add Product
              </Button>
            </View>
            
            {errors.items && (
              <Text style={styles.errorText}>{errors.items}</Text>
            )}

            {orderItems.length === 0 ? (
              <View style={styles.emptyItems}>
                <Text style={styles.emptyItemsText}>No items added yet</Text>
                <Text style={styles.emptyItemsSubtext}>
                  Click "Add Product" to start adding items
                </Text>
              </View>
            ) : (
              orderItems.map((item, index) => (
                <View key={index} style={styles.orderItemCard}>
                  <View style={styles.orderItemHeader}>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.productName}>
                        {item.product?.name || 'Unknown Product'}
                      </Text>
                      <Text style={styles.productPrice}>
                        ETB {(item.product?.price || 0).toFixed(2)} each
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => removeItem(index)}
                    />
                  </View>
                  
                  <View style={styles.orderItemDetails}>
                    <View style={styles.quantityControl}>
                      <IconButton
                        icon="minus"
                        size={20}
                        onPress={() => updateItemQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      />
                      <TextInput
                        value={item.quantity.toString()}
                        onChangeText={(text) => updateItemQuantity(index, parseInt(text) || 1)}
                        style={styles.quantityInput}
                        keyboardType="numeric"
                      />
                      <IconButton
                        icon="plus"
                        size={20}
                        onPress={() => updateItemQuantity(index, item.quantity + 1)}
                      />
                    </View>
                    
                    <View style={styles.itemTotal}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalAmount}>
                        ETB {calculateItemTotal(item.product?.price, item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  
                  {item.product?.stock < 10 && (
                    <View style={styles.stockWarning}>
                      <Text style={styles.stockWarningText}>
                        ⚠️ Only {item.product.stock} in stock
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Order Summary */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>3. Order Summary</Title>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer:</Text>
              <Text style={styles.summaryValue}>
                {customerType === 'existing' 
                  ? selectedCustomer?.name || 'Not selected'
                  : newCustomer.name || 'Not entered'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items:</Text>
              <Text style={styles.summaryValue}>
                {orderItems.length} item(s)
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                ETB {calculateOrderTotal().toFixed(2)}
              </Text>
            </View>
            
            <Divider style={styles.summaryDivider} />
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                ETB {calculateOrderTotal().toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting || orderItems.length === 0}
              style={styles.submitButton}
              icon="check"
            >
              {submitting ? 'Creating Order...' : 'Create Order'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Product Selection Modal */}
      <Portal>
        <Modal
          visible={showProductModal}
          onDismiss={() => setShowProductModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Title>Select Product</Title>
                <IconButton
                  icon="close"
                  onPress={() => setShowProductModal(false)}
                />
              </View>
              
              <TextInput
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={styles.modalInput}
              />
              
              <ScrollView style={styles.productsList}>
                {products.map(product => (
                  <TouchableOpacity
                    key={product._id || product.id}
                    style={[
                      styles.productOption,
                      selectedProduct?._id === product._id && styles.productOptionSelected
                    ]}
                    onPress={() => setSelectedProduct(product)}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productDetails}>
                        ETB {product.price.toFixed(2)} • {product.stock} in stock • {product.category}
                      </Text>
                    </View>
                    {selectedProduct?._id === product._id && (
                      <IconButton icon="check" size={20} color="#007bff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Button
                mode="contained"
                onPress={addProductToOrder}
                disabled={!selectedProduct}
                style={styles.modalButton}
              >
                Add to Order
              </Button>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  customerSelect: {
    marginTop: 10,
  },
  customersScroll: {
    marginTop: 10,
    flexGrow: 0,
  },
  customerChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  customerChipSelected: {
    backgroundColor: '#007bff',
  },
  customerChipText: {
    color: '#333',
    fontSize: 14,
  },
  newCustomerForm: {
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
  },
  emptyItems: {
    alignItems: 'center',
    padding: 30,
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  orderItemCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderItemInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  orderItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    height: 40,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  stockWarning: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
  },
  stockWarningText: {
    color: '#856404',
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 16,
  },
  summaryValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  summaryDivider: {
    marginVertical: 15,
  },
  totalRow: {
    marginTop: 10,
  },
  submitButton: {
    paddingVertical: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalInput: {
    marginBottom: 15,
  },
  productsList: {
    maxHeight: 300,
  },
  productOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productOptionSelected: {
    backgroundColor: '#f0f8ff',
  },
  productInfo: {
    flex: 1,
  },
  productDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modalButton: {
    marginTop: 15,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
  },
});