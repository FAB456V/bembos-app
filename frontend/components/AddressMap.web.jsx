import { StyleSheet, Text, View } from 'react-native';

export default function AddressMap({ coordinates }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.title}>Vista previa disponible en Android y iOS</Text>
      <Text style={styles.coordinate}>{coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', backgroundColor: '#EAF3FF', height: 130, justifyContent: 'center', padding: 16, width: '100%' },
  title: { color: '#1A1A1A', fontSize: 13, fontWeight: '800' },
  coordinate: { color: '#666666', fontSize: 12, marginTop: 5 },
});
