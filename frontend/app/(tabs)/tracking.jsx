import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import DeliveryMap from '../../components/DeliveryMap';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { useSocket } from '../../hooks/useSocket';
import { getLatestLocation, getOrder } from '../../services/ordersService';

function normalizeLocation(location) {
  if (!location) return null;

  if (location.coordenadas) {
    return {
      lat: location.coordenadas.lat,
      lng: location.coordenadas.lng,
      timestamp: location.timestamp,
    };
  }

  return location;
}

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  const socket = useSocket(orderId);
  const { setLocation, setStatus } = socket;
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(orderId));

  useEffect(() => {
    let active = true;

    async function loadTracking() {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      setError('');
      setIsLoading(true);

      try {
        const order = await getOrder(orderId);
        if (active) setStatus(order.estado);

        try {
          const latestLocation = await getLatestLocation(orderId);
          if (active) setLocation(normalizeLocation(latestLocation));
        } catch (requestError) {
          if (requestError.response?.status !== 404) throw requestError;
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'No se pudo cargar el seguimiento.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTracking();
    return () => { active = false; };
  }, [orderId, setLocation, setStatus]);

  const location = normalizeLocation(socket.location);

  if (!orderId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Seguimiento</Text>
        <Text>Selecciona un pedido desde la pestana Pedidos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seguimiento en tiempo real</Text>
      <Text style={styles.orderId}>Pedido #{orderId.slice(-6)}</Text>
      <View style={styles.connectionRow}>
        <View style={[styles.dot, socket.isConnected ? styles.online : styles.offline]} />
        <Text>{socket.isConnected ? 'Actualizaciones en vivo' : 'Conectando...'}</Text>
      </View>
      {socket.status ? <OrderStatusBadge status={socket.status} /> : null}
      {isLoading ? <ActivityIndicator size="large" style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {socket.connectionError ? <Text style={styles.error}>{socket.connectionError}</Text> : null}
      {location ? (
        <View style={styles.mapContainer}>
          <DeliveryMap location={location} />
          <Text style={styles.coordinates}>Ultima ubicacion: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</Text>
        </View>
      ) : !isLoading ? (
        <Text style={styles.pending}>La ubicacion aparecera cuando el delivery inicie su recorrido.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 18, paddingTop: 50 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#222222', fontSize: 24, fontWeight: '800', marginBottom: 5 },
  orderId: { color: '#666666', marginBottom: 12 },
  connectionRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  dot: { borderRadius: 5, height: 10, marginRight: 7, width: 10 },
  online: { backgroundColor: '#2a9d8f' },
  offline: { backgroundColor: '#999999' },
  loader: { marginTop: 30 },
  error: { color: '#b00020', marginTop: 12 },
  mapContainer: { borderRadius: 10, marginTop: 18, overflow: 'hidden' },
  coordinates: { backgroundColor: '#ffffff', color: '#555555', padding: 12 },
  pending: { color: '#666666', marginTop: 24, textAlign: 'center' },
});
