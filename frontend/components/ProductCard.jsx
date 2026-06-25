import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PRODUCT_IMAGES } from '../constants/productImages';

export default function ProductCard({ onAdd, product }) {
  return (
    <View style={styles.card}>
      <Image source={PRODUCT_IMAGES[product.productId]} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{product.nombre}</Text>
        <Text style={styles.description}>{product.descripcion}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>S/ {product.precioUnitario.toFixed(2)}</Text>
          <Pressable
            accessibilityLabel={`Agregar ${product.nombre} al carrito`}
            onPress={() => onAdd(product)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 3, flexDirection: 'row', marginBottom: 13, padding: 12, shadowColor: '#000000', shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.1, shadowRadius: 6 },
  image: { backgroundColor: '#FFF7D6', borderRadius: 12, height: 92, marginRight: 13, resizeMode: 'cover', width: 92 },
  details: { flex: 1, justifyContent: 'space-between' },
  name: { color: '#1A1A1A', fontSize: 16, fontWeight: '800' },
  description: { color: '#666666', fontSize: 12, lineHeight: 17, marginTop: 3 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  price: { color: '#1300D0', fontSize: 17, fontWeight: '900' },
  button: { alignItems: 'center', backgroundColor: '#FFC20E', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  buttonPressed: { opacity: 0.72 },
  buttonText: { color: '#1A1A1A', fontSize: 25, fontWeight: '900', lineHeight: 28 },
});
