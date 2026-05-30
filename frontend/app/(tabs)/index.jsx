import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const PRODUCTS = [
  { productId: 'clasica', nombre: 'Bembos Clasica', descripcion: 'Carne, queso, lechuga y tomate.', precioUnitario: 18.9 },
  { productId: 'royal', nombre: 'Bembos Royal', descripcion: 'Carne, queso, jamon y huevo.', precioUnitario: 22.9 },
  { productId: 'tocino', nombre: 'Bembos Tocino', descripcion: 'Carne, queso y tocino crocante.', precioUnitario: 23.9 },
  { productId: 'papas', nombre: 'Papas Fritas', descripcion: 'Papas doradas tamano regular.', precioUnitario: 8.9 },
];

export default function MenuScreen() {
  const { signOut, user } = useAuth();
  const { addItem, items } = useCart();
  const [message, setMessage] = useState('');

  function handleAdd(product) {
    addItem(product);
    setMessage(`${product.nombre} agregado al carrito.`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>BEMBOS</Text>
          <Text style={styles.greeting}>Hola, {user?.nombre || 'cliente'}</Text>
        </View>
        <Pressable onPress={signOut}>
          <Text style={styles.signOut}>Salir</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>Elige tu pedido</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <FlatList
        contentContainerStyle={styles.list}
        data={PRODUCTS}
        keyExtractor={(product) => product.productId}
        renderItem={({ item }) => <ProductCard onAdd={handleAdd} product={item} />}
      />
      <Text style={styles.cartSummary}>{items.length} producto(s) distintos en el carrito</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 18, paddingTop: 46 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { color: '#d71920', fontSize: 28, fontWeight: '900' },
  greeting: { color: '#555555', marginTop: 3 },
  signOut: { color: '#d71920', fontWeight: '700' },
  title: { color: '#222222', fontSize: 23, fontWeight: '800', marginBottom: 12, marginTop: 24 },
  message: { color: '#287a43', marginBottom: 10 },
  list: { paddingBottom: 74 },
  cartSummary: { backgroundColor: '#ffffff', bottom: 0, color: '#444444', left: 0, padding: 14, position: 'absolute', right: 0, textAlign: 'center' },
});
