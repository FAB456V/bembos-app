import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { useSocket } from '../../hooks/useSocket';
import { getOrder } from '../../services/ordersService';

const STEPS = [
  { icon: '🍳', label: 'En preparación', status: 'En preparacion' },
  { icon: '✓', label: 'Listo para recoger', status: 'Listo para recoger' },
  { icon: '🛍️', label: 'Entregado', status: 'Entregado' },
];

function getStepIndex(status) {
  if (status === 'En camino') return 1;
  return Math.max(STEPS.findIndex((step) => step.status === status), 0);
}

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const socket = useSocket(orderId);
  const { setStatus } = socket;
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 700, toValue: 1.1, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 700, toValue: 1, useNativeDriver: true }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      setError('');
      setIsLoading(true);

      try {
        const nextOrder = await getOrder(orderId);
        if (active) {
          setOrder(nextOrder);
          setStatus(nextOrder.estado);
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'No se pudo cargar el estado.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadOrder();
    return () => { active = false; };
  }, [orderId, setStatus]);

  const currentStep = getStepIndex(socket.status);

  if (!orderId) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.emptyIconContainer}><Text style={styles.emptyIcon}>🛍️</Text></View>
        <Text style={styles.emptyTitle}>Selecciona un pedido</Text>
        <Text style={styles.emptyText}>Ingresa desde Mis pedidos para revisar cuándo estará listo para recojo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>BEMBOS</Text>
        <Text style={styles.title}>Estado del pedido</Text>
        <Text style={styles.orderId}>Pedido #{orderId.slice(-6).toUpperCase()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <Animated.View style={[styles.statusIconContainer, { transform: [{ scale: pulse }] }]}>
              <Text style={styles.statusIcon}>{STEPS[currentStep].icon}</Text>
            </Animated.View>
            <View style={styles.statusDetails}>
              <Text style={styles.statusCaption}>ESTADO ACTUAL</Text>
              {socket.status ? <OrderStatusBadge status={socket.status} /> : <Text style={styles.pendingStatus}>Consultando estado...</Text>}
            </View>
          </View>
          <View style={styles.connectionRow}>
            <View style={[styles.dot, socket.isConnected ? styles.online : styles.offline]} />
            <Text style={styles.connectionText}>{socket.isConnected ? 'Actualizaciones en vivo' : 'Conectando con la tienda...'}</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Preparación para recojo</Text>
          <View style={styles.stepsRow}>
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isLast = index === STEPS.length - 1;
              return (
                <View key={step.status} style={styles.stepWrapper}>
                  <View style={styles.stepTopRow}>
                    <View style={[styles.stepCircle, isCompleted && styles.stepCircleActive]}><Text style={styles.stepIcon}>{step.icon}</Text></View>
                    {!isLast ? <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} /> : null}
                  </View>
                  <Text style={[styles.stepLabel, isCompleted && styles.stepLabelActive]}>{step.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {isLoading ? <ActivityIndicator color="#1300D0" size="large" style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {socket.connectionError ? <Text style={styles.error}>{socket.connectionError}</Text> : null}

        {order ? (
          <View style={styles.pickupCard}>
            <Text style={styles.sectionTitle}>Punto de recojo</Text>
            <Text style={styles.storeIcon}>⌂</Text>
            <Text style={styles.storeName}>{order.tiendaRecojo || order.direccionEntrega || 'Tienda Bembos'}</Text>
            <Text style={styles.pickupHelp}>Cuando aparezca “Listo para recoger”, presenta el QR en el mostrador.</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F5F5', flex: 1 },
  header: { backgroundColor: '#FFFFFF', borderBottomColor: '#FFC20E', borderBottomWidth: 4, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 52 },
  brand: { color: '#E30613', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#1A1A1A', fontSize: 26, fontWeight: '900', marginTop: 3 },
  orderId: { color: '#666666', fontSize: 13, fontWeight: '700', marginTop: 5 },
  content: { padding: 16, paddingBottom: 28 },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 3, padding: 14 },
  statusTopRow: { alignItems: 'center', flexDirection: 'row' },
  statusIconContainer: { alignItems: 'center', backgroundColor: '#FFF2C2', borderRadius: 30, height: 60, justifyContent: 'center', marginRight: 13, width: 60 },
  statusIcon: { fontSize: 29, fontWeight: '900' },
  statusDetails: { flex: 1 },
  statusCaption: { color: '#888888', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginBottom: 6 },
  pendingStatus: { color: '#666666', fontSize: 13, fontWeight: '600' },
  connectionRow: { alignItems: 'center', borderTopColor: '#EEEEEE', borderTopWidth: 1, flexDirection: 'row', marginTop: 13, paddingTop: 11 },
  dot: { borderRadius: 5, height: 10, marginRight: 7, width: 10 },
  online: { backgroundColor: '#2A9D5B' },
  offline: { backgroundColor: '#999999' },
  connectionText: { color: '#666666', fontSize: 12, fontWeight: '600' },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 2, marginTop: 14, padding: 14 },
  sectionTitle: { color: '#1A1A1A', fontSize: 16, fontWeight: '900', marginBottom: 14 },
  stepsRow: { flexDirection: 'row' },
  stepWrapper: { flex: 1 },
  stepTopRow: { alignItems: 'center', flexDirection: 'row' },
  stepCircle: { alignItems: 'center', backgroundColor: '#EEEEEE', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  stepCircleActive: { backgroundColor: '#FFC20E' },
  stepIcon: { color: '#1A1A1A', fontSize: 20, fontWeight: '900' },
  stepLine: { backgroundColor: '#E0E0E0', flex: 1, height: 4 },
  stepLineActive: { backgroundColor: '#FFC20E' },
  stepLabel: { color: '#888888', fontSize: 10, fontWeight: '700', lineHeight: 14, marginTop: 7, paddingRight: 3 },
  stepLabelActive: { color: '#1A1A1A' },
  loader: { marginVertical: 20 },
  error: { backgroundColor: '#FDE8E9', borderRadius: 10, color: '#E30613', fontSize: 12, fontWeight: '600', marginTop: 12, padding: 10 },
  pickupCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 2, marginTop: 16, padding: 18 },
  storeIcon: { color: '#1300D0', fontSize: 36, fontWeight: '900' },
  storeName: { color: '#1A1A1A', fontSize: 16, fontWeight: '900', marginTop: 6, textAlign: 'center' },
  pickupHelp: { color: '#666666', fontSize: 13, lineHeight: 18, marginTop: 8, textAlign: 'center' },
  emptyScreen: { alignItems: 'center', backgroundColor: '#F5F5F5', flex: 1, justifyContent: 'center', padding: 24 },
  emptyIconContainer: { alignItems: 'center', backgroundColor: '#FFC20E', borderRadius: 40, height: 80, justifyContent: 'center', width: 80 },
  emptyIcon: { fontSize: 38 },
  emptyTitle: { color: '#1A1A1A', fontSize: 21, fontWeight: '900', marginTop: 16 },
  emptyText: { color: '#666666', fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: 'center' },
});
