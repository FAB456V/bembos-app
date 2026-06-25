import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { getOrder } from '../services/ordersService';

export default function OrderConfirmationScreen() {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const openedFromOrders = params.from === 'orders';
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId) {
        setError('No se encontro el pedido confirmado.');
        return;
      }

      try {
        const nextOrder = await getOrder(orderId);
        if (active) setOrder(nextOrder);
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'No se pudo cargar el codigo QR.');
        }
      }
    }

    loadOrder();
    return () => { active = false; };
  }, [orderId]);

  if (!order && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1300D0" size="large" />
        <Text style={styles.loadingText}>Generando tu codigo QR...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.title}>{openedFromOrders ? 'QR del pedido' : 'Pedido confirmado'}</Text>
      <Text style={styles.subtitle}>Presenta este QR en el mostrador para validar tu recojo.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {order ? (
        <>
          <View style={styles.qrCard}>
            <Text style={styles.orderLabel}>PEDIDO #{order._id.slice(-6).toUpperCase()}</Text>
            <View style={styles.qrContainer}>
              <QRCode
                backgroundColor="#FFFFFF"
                color="#1A1A1A"
                quietZone={12}
                size={230}
                value={order.qrPayload}
              />
            </View>
            <Text style={styles.qrHelp}>El codigo identifica este pedido de forma unica.</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <OrderStatusBadge status={order.estado} />
            </View>
            {order.productos.map((product) => (
              <View key={product.productId} style={styles.productRow}>
                <Text style={styles.productName}>{product.cantidad} x {product.nombre}</Text>
                <Text style={styles.productPrice}>S/ {(product.cantidad * product.precioUnitario).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>S/ {order.total.toFixed(2)}</Text>
            </View>
            <Text style={styles.addressLabel}>Tienda de recojo</Text>
            <Text style={styles.address}>{order.tiendaRecojo || order.direccionEntrega || 'Tienda Bembos'}</Text>
          </View>

          <Pressable
            onPress={() => router.replace('/(tabs)/orders')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Ver mis pedidos</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Volver al menu</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', backgroundColor: '#F5F5F5', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#666666', fontSize: 14, fontWeight: '600', marginTop: 12 },
  container: { alignItems: 'center', backgroundColor: '#F5F5F5', flexGrow: 1, paddingBottom: 32, paddingHorizontal: 18, paddingTop: 54 },
  successIcon: { alignItems: 'center', backgroundColor: '#FFC20E', borderRadius: 34, height: 68, justifyContent: 'center', width: 68 },
  successIconText: { color: '#1A1A1A', fontSize: 34, fontWeight: '900' },
  title: { color: '#1A1A1A', fontSize: 27, fontWeight: '900', marginTop: 14 },
  subtitle: { color: '#666666', fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 330, textAlign: 'center' },
  error: { backgroundColor: '#FDE8E9', borderRadius: 10, color: '#E30613', fontSize: 13, fontWeight: '600', marginTop: 20, padding: 12, width: '100%' },
  qrCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, elevation: 3, marginTop: 22, padding: 18, width: '100%' },
  orderLabel: { color: '#1300D0', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  qrContainer: { borderColor: '#FFC20E', borderRadius: 14, borderWidth: 3, marginTop: 14, padding: 8 },
  qrHelp: { color: '#777777', fontSize: 12, marginTop: 12, textAlign: 'center' },
  summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 14, padding: 16, width: '100%' },
  summaryHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryTitle: { color: '#1A1A1A', fontSize: 18, fontWeight: '900' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  productName: { color: '#555555', flex: 1, fontSize: 13 },
  productPrice: { color: '#1A1A1A', fontSize: 13, fontWeight: '700' },
  divider: { backgroundColor: '#E5E5E5', height: 1, marginVertical: 7 },
  totalRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { color: '#1A1A1A', fontSize: 16, fontWeight: '800' },
  total: { color: '#1300D0', fontSize: 21, fontWeight: '900' },
  addressLabel: { color: '#888888', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginTop: 15 },
  address: { color: '#555555', fontSize: 13, lineHeight: 18, marginTop: 4 },
  primaryButton: { alignItems: 'center', backgroundColor: '#1300D0', borderRadius: 13, justifyContent: 'center', marginTop: 18, minHeight: 52, width: '100%' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: { alignItems: 'center', borderColor: '#1300D0', borderRadius: 13, borderWidth: 1.5, justifyContent: 'center', marginTop: 10, minHeight: 48, width: '100%' },
  secondaryButtonText: { color: '#1300D0', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.78 },
});
