// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  ActivityIndicator, 
  View, 
  Text, 
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext'; 

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProductsScreen from './screens/ProductScreen';
import CreateOrderScreen from './screens/CreateOrderScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app
function MainTabNavigator() {
  const { handleLogout } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'OrdersTab') {
            iconName = focused ? 'list-circle' : 'list-circle-outline';
          } else if (route.name === 'ProductsTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'CustomersTab') {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersStackNavigator}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen 
        name="ProductsTab" 
        component={ProductsScreen}
        options={{ title: 'Products' }}
      />
      
    </Tab.Navigator>
  );
}

// Stack Navigator for Orders section
function OrdersStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007bff' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="OrdersList" 
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{ title: 'Order Details' }}
      />
      <Stack.Screen 
        name="CreateOrder" 
        component={CreateOrderScreen}
        options={{ title: 'New Order' }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, checkAuthentication } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkAuthentication();
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>
          Loading app...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#007bff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : (
          // Main app with bottom tabs
          <Stack.Screen
            name="MainApp"
            component={MainTabNavigator}
            options={{ 
              headerShown: false
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  }
});

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}