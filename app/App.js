import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StyleSheet, View, Text } from 'react-native';

// Import screens
import Dashboard from './src/screens/Dashboard';
import Orders from './src/screens/Orders';
import CreateOrder from './src/screens/CreateOrder';
import Products from './src/screens/Products';
import CreateProduct from './src/screens/CreateProduct';
import Notifications from './src/screens/Notifications';

const Stack = createStackNavigator();

// Splash screen component
const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <Text style={styles.splashTitle}>Order Management</Text>
    <Text style={styles.splashSubtitle}>Loading...</Text>
  </View>
);

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007bff',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Dashboard" 
            component={Dashboard}
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen 
            name="Orders" 
            component={Orders}
            options={{ title: 'Orders' }}
          />
          <Stack.Screen 
            name="CreateOrder" 
            component={CreateOrder}
            options={{ title: 'Create Order' }}
          />
          <Stack.Screen 
            name="Products" 
            component={Products}
            options={{ title: 'Products' }}
          />
          <Stack.Screen 
            name="CreateProduct" 
            component={CreateProduct}
            options={{ title: 'Add Product' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={Notifications}
            options={{ title: 'Notifications' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  splashSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});