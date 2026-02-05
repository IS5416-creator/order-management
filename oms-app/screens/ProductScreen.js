
// screens/ProductsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as api from '../services/api';

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock?.toString() || '',
      category: product.category || ''
    });
    setSelectedProduct(product);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const result = await api.deleteProduct(productId);
              if (result.success) {
                Alert.alert('Success', 'Product deleted successfully');
                fetchProducts();
                setModalVisible(false);
              } else {
                Alert.alert('Error', result.message || 'Failed to delete product');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!productForm.name.trim()) errors.name = 'Product name is required';
    if (!productForm.price.trim()) errors.price = 'Price is required';
    if (isNaN(parseFloat(productForm.price))) errors.price = 'Price must be a number';
    if (productForm.stock && isNaN(parseInt(productForm.stock))) errors.stock = 'Stock must be a number';
    return errors;
  };

  const handleSaveProduct = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const productData = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price),
      stock: productForm.stock ? parseInt(productForm.stock) : 0,
      category: productForm.category.trim()
    };

    try {
      let result;
      if (isEditing && selectedProduct) {
        result = await api.updateProduct(selectedProduct.id, productData);
      } else {
        result = await api.createProduct(productData);
      }

      if (result.success) {
        Alert.alert('Success', `Product ${isEditing ? 'updated' : 'created'} successfully`);
        fetchProducts();
        resetForm();
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} product`);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: ''
    });
    setFormErrors({});
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleViewProduct(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>ETB{parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <View style={styles.productMeta}>
        <Text style={styles.productCategory}>{item.category || 'Uncategorized'}</Text>
        <Text style={[
          styles.stock,
          { color: item.stock > 10 ? '#4caf50' : item.stock > 0 ? '#ff9800' : '#f44336' }
        ]}>
          Stock: {item.stock || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder=""
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
           keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No products match your search' : 'No products found'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Product' : selectedProduct ? 'Product Details' : 'Add New Product'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {selectedProduct && !isEditing ? (
                // View mode
                <View style={styles.viewMode}>
                  <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
                  <Text style={styles.detailPrice}>${parseFloat(selectedProduct.price).toFixed(2)}</Text>
                  
                  {selectedProduct.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.detailText}>{selectedProduct.description}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Category</Text>
                      <Text style={styles.detailText}>{selectedProduct.category || 'Uncategorized'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Stock</Text>
                      <Text style={styles.detailText}>{selectedProduct.stock || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailText}>
                      {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditProduct(selectedProduct)}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteProduct(selectedProduct.id)}
                      disabled={isDeleting}
                    >
                      <Text style={styles.actionButtonText}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Edit/Create mode
                <View style={styles.editMode}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Product Name *</Text>
                    <TextInput
                      style={[styles.input, formErrors.name && styles.inputError]}
                      value={productForm.name}
                      onChangeText={(text) => setProductForm({...productForm, name: text})}
                      placeholder="Enter product name"
                    />
                    {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={productForm.description}
                      onChangeText={(text) => setProductForm({...productForm, description: text})}
                      placeholder="Enter description"
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Price ($) *</Text>
                      <TextInput
                        style={[styles.input, formErrors.price && styles.inputError]}
                        value={productForm.price}
                        onChangeText={(text) => setProductForm({...productForm, price: text})}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                      />
                      {formErrors.price && <Text style={styles.errorText}>{formErrors.price}</Text>}
                    </View>

                    <View style={[styles.formGroup, styles.halfWidth]}>
                      <Text style={styles.label}>Stock</Text>
                      <TextInput
                        style={[styles.input, formErrors.stock && styles.inputError]}
                        value={productForm.stock}
                        onChangeText={(text) => setProductForm({...productForm, stock: text})}
                        placeholder="0"
                        keyboardType="number-pad"
                      />
                      {formErrors.stock && <Text style={styles.errorText}>{formErrors.stock}</Text>}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Category</Text>
                    <TextInput
                      style={styles.input}
                      value={productForm.category}
                      onChangeText={(text) => setProductForm({...productForm, category: text})}
                      placeholder="e.g., Electronics, Stationary"
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProduct}
                  >
                    <Text style={styles.saveButtonText}>
                      {isEditing ? 'Update Product' : 'Create Product'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white'
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  productItem: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 15,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
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
    flex: 1,
    marginRight: 10
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff'
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
    paddingVertical: 2,
    borderRadius: 4
  },
  stock: {
    fontSize: 14,
    fontWeight: '500'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d'
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  fabText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 30
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalScrollView: {
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
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
  viewMode: {
    paddingBottom: 20
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5
  },
  detailPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20
  },
  detailSection: {
    marginBottom: 20
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
    fontWeight: '500'
  },
  detailText: {
    fontSize: 16,
    color: '#212529'
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  detailItem: {
    flex: 1,
    marginRight: 10
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5
  },
  editButton: {
    backgroundColor: '#28a745'
  },
  deleteButton: {
    backgroundColor: '#dc3545'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  editMode: {
    paddingBottom: 30
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#495057'
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  inputError: {
    borderColor: '#dc3545'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfWidth: {
    flex: 1,
    marginRight: 10
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});