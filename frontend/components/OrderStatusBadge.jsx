import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  'En preparacion': '#f4a261',
  'En camino': '#277da1',
  Entregado: '#2a9d8f',
};

export default function OrderStatusBadge({ status }) {
  return (
    <View style={[styles.badge, { backgroundColor: COLORS[status] || '#777777' }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  text: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
