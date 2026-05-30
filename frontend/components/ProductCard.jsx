import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProductCard({ onAdd, product }) {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>B</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.name}>{product.nombre}</Text>
        <Text style={styles.description}>{product.descripcion}</Text>
        <Text style={styles.price}>S/ {product.precioUnitario.toFixed(2)}</Text>
        <Pressable onPress={() => onAdd(product)} style={styles.button}>
          <Text style={styles.buttonText}>Agregar al carrito</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 12, elevation: 2, flexDirection: 'row', marginBottom: 14, padding: 14, shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 6 },
  imagePlaceholder: { alignItems: 'center', backgroundColor: '#f4c542', borderRadius: 10, height: 82, justifyContent: 'center', marginRight: 14, width: 82 },
  imageText: { color: '#d71920', fontSize: 40, fontWeight: '900' },
  details: { flex: 1 },
  name: { color: '#222222', fontSize: 17, fontWeight: '700' },
  description: { color: '#666666', fontSize: 13, marginTop: 3 },
  price: { color: '#d71920', fontSize: 16, fontWeight: '800', marginTop: 8 },
  button: { alignSelf: 'flex-start', backgroundColor: '#d71920', borderRadius: 6, marginTop: 9, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
