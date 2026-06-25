import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#1300D0" size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1300D0',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#FFC20E', borderTopWidth: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Menú', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="restaurant-outline" size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Carrito', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="cart-outline" size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="receipt-outline" size={size} /> }} />
      <Tabs.Screen name="tracking" options={{ title: 'Estado', tabBarIcon: ({ color, size }) => <Ionicons color={color} name="time-outline" size={size} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
