import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { getHistory } from '../../services/ordersService';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadOrders() {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError('');

        try {
          const history = await getHistory(user.id);
          if (active) setOrders(history);
        } catch (requestError) {
          if (active) setError(requestError.response?.data?.message || 'No se pudo cargar el historial.');
        } finally {
          if (active) setIsLoading(false);
        }
      }

      loadOrders();
      return () => { active = false; };
    }, [user?.id])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis pedidos</Text>
      {isLoading ? <ActivityIndicator size="large" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoading ? (
        <FlatList
          data={orders}
          keyExtractor={(order) => order._id}
          ListEmptyComponent={<Text style={styles.empty}>Aun no tienes pedidos.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.orderId}>Pedido #{item._id.slice(-6)}</Text>
              <OrderStatusBadge status={item.estado} />
              <Text style={styles.total}>Total: S/ {item.total.toFixed(2)}</Text>
              <Text style={styles.address}>{item.direccionEntrega}</Text>
              <Pressable
                onPress={() => router.push({ pathname: '/(tabs)/tracking', params: { orderId: item._id } })}
                style={styles.trackingButton}
              >
                <Text style={styles.trackingText}>Ver seguimiento</Text>
              </Pressable>
            </View>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 18, paddingTop: 50 },
  title: { color: '#222222', fontSize: 25, fontWeight: '800', marginBottom: 16 },
  error: { color: '#b00020', marginBottom: 12 },
  empty: { color: '#666666', marginTop: 20, textAlign: 'center' },
  card: { backgroundColor: '#ffffff', borderRadius: 10, marginBottom: 12, padding: 14 },
  orderId: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  total: { fontWeight: '700', marginTop: 10 },
  address: { color: '#666666', marginTop: 5 },
  trackingButton: { alignSelf: 'flex-start', borderColor: '#d71920', borderRadius: 6, borderWidth: 1, marginTop: 12, paddingHorizontal: 11, paddingVertical: 7 },
  trackingText: { color: '#d71920', fontSize: 12, fontWeight: '700' },
});
