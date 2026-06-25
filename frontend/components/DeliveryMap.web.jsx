import { StyleSheet, Text, View } from 'react-native';

export default function DeliveryMap({ location }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.icon}>⌖</Text>
      <Text style={styles.title}>Mapa disponible en Android y iOS</Text>
      <Text style={styles.coordinate}>Latitud: {location.lat.toFixed(6)}</Text>
      <Text style={styles.coordinate}>Longitud: {location.lng.toFixed(6)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', backgroundColor: '#FFF2C2', height: 260, justifyContent: 'center', padding: 20, width: '100%' },
  icon: { color: '#1300D0', fontSize: 38, fontWeight: '900' },
  title: { color: '#1A1A1A', fontSize: 15, fontWeight: '800', marginBottom: 8, marginTop: 4 },
  coordinate: { color: '#666666', fontSize: 13, marginTop: 2 },
});
