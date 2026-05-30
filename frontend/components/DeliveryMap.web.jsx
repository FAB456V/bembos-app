import { StyleSheet, Text, View } from 'react-native';

export default function DeliveryMap({ location }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>Mapa disponible en Android y iOS</Text>
      <Text>Latitud: {location.lat.toFixed(6)}</Text>
      <Text>Longitud: {location.lng.toFixed(6)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', backgroundColor: '#e8eef2', height: 260, justifyContent: 'center', padding: 20, width: '100%' },
  title: { fontWeight: '700', marginBottom: 8 },
});
