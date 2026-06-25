import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { getHistory } from '../../services/ordersService';

function formatDate(date) {
  if (!date) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

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
      <View style={styles.header}>
        <Text style={styles.brand}>BEMBOS</Text>
        <Text style={styles.title}>Mis pedidos 🍔</Text>
        <Text style={styles.headerCaption}>Consulta tus pedidos y revisa su avance</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#1300D0" size="large" />
          <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={orders}
          keyExtractor={(order) => order._id}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyTitle}>Aún no tienes pedidos</Text>
              <Text style={styles.empty}>Cuando confirmes uno, podrás revisar cuándo estará listo aquí.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderLabel}>NÚMERO DE PEDIDO</Text>
                  <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
                </View>
                <OrderStatusBadge status={item.estado} />
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>◷</Text>
                <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>⌖</Text>
                <Text style={styles.address} numberOfLines={2}>{item.tiendaRecojo || item.direccionEntrega || 'Tienda Bembos'}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.total}>S/ {item.total.toFixed(2)}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/order-confirmation', params: { orderId: item._id, from: 'orders' } })}
                    style={({ pressed }) => [styles.qrButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.qrText}>Ver QR</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push({ pathname: '/(tabs)/tracking', params: { orderId: item._id } })}
                    style={({ pressed }) => [styles.trackingButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.trackingText}>Ver estado</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F5F5', flex: 1 },
  header: { backgroundColor: '#FFFFFF', borderBottomColor: '#FFC20E', borderBottomWidth: 4, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 52 },
  brand: { color: '#E30613', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#1A1A1A', fontSize: 27, fontWeight: '900', marginTop: 3 },
  headerCaption: { color: '#666666', fontSize: 13, fontWeight: '600', marginTop: 4, opacity: 0.92 },
  loadingContainer: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#666666', fontSize: 14, fontWeight: '600', marginTop: 10 },
  error: { backgroundColor: '#FDE8E9', borderRadius: 10, color: '#E30613', fontSize: 13, fontWeight: '600', marginHorizontal: 18, marginTop: 16, padding: 11 },
  list: { flexGrow: 1, paddingBottom: 22, paddingHorizontal: 18, paddingTop: 16 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 2, marginTop: 14, padding: 24, shadowColor: '#000000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.08, shadowRadius: 5 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#1A1A1A', fontSize: 17, fontWeight: '800', marginTop: 8 },
  empty: { color: '#666666', fontSize: 13, lineHeight: 18, marginTop: 5, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 3, marginBottom: 13, padding: 14, shadowColor: '#000000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.1, shadowRadius: 6 },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  orderLabel: { color: '#888888', fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  orderId: { color: '#1A1A1A', fontSize: 17, fontWeight: '900', marginTop: 2 },
  divider: { backgroundColor: '#E8E8E8', height: 1, marginVertical: 12 },
  detailRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 7 },
  detailIcon: { color: '#1300D0', fontSize: 18, fontWeight: '900', marginRight: 8, width: 18 },
  detailText: { color: '#666666', fontSize: 13 },
  address: { color: '#666666', flex: 1, fontSize: 13, lineHeight: 18 },
  cardFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  totalLabel: { color: '#777777', fontSize: 11, fontWeight: '700' },
  total: { color: '#1A1A1A', fontSize: 19, fontWeight: '900', marginTop: 2 },
  actions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  qrButton: { backgroundColor: '#1300D0', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 10 },
  qrText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  trackingButton: { borderColor: '#1300D0', borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 13, paddingVertical: 9 },
  trackingText: { color: '#1300D0', fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
