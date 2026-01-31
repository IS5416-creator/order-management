import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Searchbar,
  Menu,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  Portal
} from 'react-native-paper';
import { getProducts, deleteProduct } from '../services/api';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 25;

export default function Products({ navigation }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState(['all']);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Price (Low to High)', value: 'price-low' },
    { label: 'Price (High to Low)', value: 'price-high' },
    { label: 'Stock (Low to High)', value: 'stock-low' },
    { label: 'Stock (High to Low)', value: 'stock-high' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchQuery, selectedCategory, sortBy, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(productsData
        .map(p => p.category)
        .filter(Boolean)
        .sort())];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'stock-low':
          return (a.stock || 0) - (b.stock || 0);
        case 'stock-high':
          return (b.stock || 0) - (a.stock || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredProducts(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete._id || productToDelete.id);
      
      // Update local state
      setProducts(prev => 
        prev.filter(p => p._id !== productToDelete._id && p.id !== productToDelete.id)
      );
      
      setDeleteDialogVisible(false);
      setProductToDelete(null);
      
      alert(`"${productToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: '#dc3545', bgColor: '#f8d7da' };
    if (stock < 5) return { label: 'Low Stock', color: '#ffc107', bgColor: '#fff3cd' };
    if (stock < 20) return { label: 'In Stock', color: '#28a745', bgColor: '#d4edda' };
    return { label: 'High Stock', color: '#17a2b8', bgColor: '#d1ecf1' };
  };

  const renderProductCard = ({ item }) => {
    const status = getStockStatus(item.stock);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id || item.id })}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Avatar.Text 
                size={40} 
                label={item.name?.charAt(0) || 'P'} 
                style={{ backgroundColor: '#007bff' }}
              />
              <View style={styles.stockBadge}>
                <Text style={[styles.stockBadgeText, { color: status.color }]}>
                  {item.stock}
                </Text>
              </View>
            </View>
            
            <Title style={styles.productName} numberOfLines={2}>
              {item.name}
            </Title>
            
            {item.category && (
              <Chip 
                mode="outlined" 
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {item.category}
              </Chip>
            )}
            
            <Paragraph style={styles.price} numberOfLines={1}>
              ETB {(item.price || 0).toFixed(2)}
            </Paragraph>
            
            {item.description && (
              <Paragraph style={styles.description} numberOfLines={2}>
                {item.description}
              </Paragraph>
            )}
            
            <View style={[styles.statusIndicator, { backgroundColor: status.bgColor }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
            
            <View style={styles.cardActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => navigation.navigate('EditProduct', { productId: item._id || item.id })}
                style={styles.actionIcon}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  setProductToDelete(item);
                  setDeleteDialogVisible(true);
                }}
                style={styles.actionIcon}
                color="#dc3545"
              />
              <IconButton
                icon="cart-plus"
                size={20}
                onPress={() => navigation.navigate('CreateOrder', { productId: item._id || item.id })}
                style={styles.actionIcon}
                color="#28a745"
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Title style={styles.headerTitle}>Products</Title>
              <Text style={styles.productCount}>
                {products.length} products in inventory
              </Text>
            </View>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('CreateProduct')}
            >
              Add Product
            </Button>
          </View>

          {/* Search */}
          <Searchbar
            placeholder="Search products..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          {/* Filters */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChipFilter,
                  selectedCategory === category && styles.categoryChipFilterSelected
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipFilterText,
                  selectedCategory === category && styles.categoryChipFilterTextSelected
                ]}>
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Menu */}
          <View style={styles.sortContainer}>
            <Menu
              visible={false} // We'll implement this properly
              onDismiss={() => {}}
              anchor={
                <Button
                  mode="outlined"
                  icon="sort"
                  onPress={() => {}}
                  style={styles.sortButton}
                >
                  Sort: {sortOptions.find(o => o.value === sortBy)?.label || 'Name'}
                </Button>
              }
            >
              {sortOptions.map(option => (
                <Menu.Item
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  title={option.label}
                />
              ))}
            </Menu>
            
            <Button
              mode="outlined"
              icon="refresh"
              onPress={onRefresh}
              loading={refreshing}
            >
              Refresh
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try changing your search or filter'
                : 'Add your first product to get started'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateProduct')}
              style={styles.emptyButton}
            >
              Add First Product
            </Button>
          </View>
        }
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Product</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{productToDelete?.name}"?
            </Paragraph>
            <Paragraph style={{ color: '#dc3545', marginTop: 10 }}>
              This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteProduct} textColor="#dc3545">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  productCount: {
    color: '#666',
    fontSize: 14,
  },
  searchBar: {
    marginBottom: 15,
  },
  categoryScroll: {
    marginBottom: 15,
  },
  categoryChipFilter: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipFilterSelected: {
    backgroundColor: '#007bff',
  },
  categoryChipFilterText: {
    color: '#333',
    fontSize: 14,
  },
  categoryChipFilterTextSelected: {
    color: 'white',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    minWidth: 150,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    width: cardWidth,
    marginBottom: 15,
  },
  card: {
    height: 280,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stockBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  stockBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
    height: 45,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryChipText: {
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#666',
    height: 35,
    marginBottom: 10,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionIcon: {
    margin: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    marginTop: 10,
  },
});