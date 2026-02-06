import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createProduct } from '../services/api'; 

export default function CreateProductScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    stock: '',
    category: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    
    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      Alert.alert('Error', 'Stock must be a non-negative number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: formData.stock ? parseInt(formData.stock) : 0,
    };

    setLoading(true);
    try {
      const result = await createProduct(productData);
      if (result.success) {
        Alert.alert('Success', 'Product created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor="#888"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            placeholderTextColor="#888"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#888"
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Stock</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#888"
              value={formData.stock}
              onChangeText={(text) => handleInputChange('stock', text)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>SKU</Text>
            <TextInput
              style={styles.input}
              placeholder="Product SKU"
              placeholderTextColor="#888"
              value={formData.sku}
              onChangeText={(text) => handleInputChange('sku', text)}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Product category"
              placeholderTextColor="#888"
              value={formData.category}
              onChangeText={(text) => handleInputChange('category', text)}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Product</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
  },
  formContainer: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 5,
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
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
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