import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Picker,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createOrder, getProducts, getCustomers } from '../services/api'; 

export default function CreateOrderScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'pending',
    notes: '',
  });

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
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleAddProduct = (product) => {
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  const handleRemoveProduct = (index) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const handleQuantityChange = (index, quantity) => {
    const newProducts = [...selectedProducts];
    newProducts[index].quantity = quantity;
    setSelectedProducts(newProducts);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!formData.customerId) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert('Error', 'Please add at least one product');
      return;
    }

    const orderData = {
      ...formData,
      products: selectedProducts.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: calculateTotal(),
    };

    setLoading(true);
    try {
      const result = await createOrder(orderData);
      if (result.success) {
        Alert.alert('Success', 'Order created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Customer</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.customerId}
              style={styles.picker}
              onValueChange={(value) => setFormData({...formData, customerId: value})}
            >
              <Picker.Item label="Select a customer..." value="" />
              {customers.map((customer) => (
                <Picker.Item 
                  key={customer.id} 
                  label={customer.name} 
                  value={customer.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Order Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              style={styles.picker}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="Processing" value="processing" />
              <Picker.Item label="Shipped" value="shipped" />
              <Picker.Item label="Delivered" value="delivered" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any notes about this order..."
            placeholderTextColor="#888"
            value={formData.notes}
            onChangeText={(text) => setFormData({...formData, notes: text})}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Products</Text>
        
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productItem}
            onPress={() => handleAddProduct(product)}
          >
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            </View>
            <MaterialIcons name="add-circle" size={24} color="#4A90E2" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected Products</Text>
        
        {selectedProducts.length === 0 ? (
          <Text style={styles.emptyText}>No products added yet</Text>
        ) : (
          selectedProducts.map((item, index) => (
            <View key={index} style={styles.selectedProduct}>
              <View style={styles.selectedProductInfo}>
                <Text style={styles.selectedProductName}>{item.name}</Text>
                <Text style={styles.selectedProductPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.selectedProductActions}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                >
                  <MaterialIcons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(index, item.quantity + 1)}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveProduct(index)}
                >
                  <MaterialIcons name="delete" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {selectedProducts.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Create Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  section: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#0A192F',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#0A192F',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2D4F8B',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#4A90E2',
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  selectedProduct: {
    backgroundColor: '#2D4F8B',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedProductInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedProductName: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  selectedProductActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#4A90E2',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#4A90E2',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#2D4F8B',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});