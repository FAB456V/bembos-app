import { StyleSheet, Text, View } from 'react-native';

const COLORS = {
  'En preparacion': { background: '#FFF2C2', text: '#8A6200' },
  'En camino': { background: '#DCEEFF', text: '#12619B' },
  'Listo para recoger': { background: '#DCEEFF', text: '#12619B' },
  Entregado: { background: '#DDF6E5', text: '#287A43' },
};

const LABELS = {
  'En preparacion': 'En preparación',
};

export default function OrderStatusBadge({ status }) {
  const colors = COLORS[status] || { background: '#EEEEEE', text: '#555555' };

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>{LABELS[status] || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  text: { fontSize: 11, fontWeight: '800' },
});
