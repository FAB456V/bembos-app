import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const PRODUCTS = [
  { productId: 'clasica', nombre: 'Bembos Clasica', descripcion: 'Carne, queso, lechuga y tomate.', precioUnitario: 18.9 },
  { productId: 'royal', nombre: 'Bembos Royal', descripcion: 'Carne, queso, jamon y huevo.', precioUnitario: 22.9 },
  { productId: 'tocino', nombre: 'Bembos Tocino', descripcion: 'Carne, queso y tocino crocante.', precioUnitario: 23.9 },
  { productId: 'papas', nombre: 'Papas Fritas', descripcion: 'Papas doradas tamano regular.', precioUnitario: 8.9 },
];

const PRODUCT_SECTIONS = [
  { title: 'Hamburguesas 🍔', data: PRODUCTS.filter((product) => product.productId !== 'papas') },
  { title: 'Papas 🍟', data: PRODUCTS.filter((product) => product.productId === 'papas') },
];

export default function MenuScreen() {
  const { signOut, user } = useAuth();
  const { addItem, items } = useCart();
  const [message, setMessage] = useState('');
  const cartCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  function handleAdd(product) {
    addItem(product);
    setMessage(`${product.nombre} agregado al carrito.`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Image source={require('../assents/Bembos.png')} style={styles.headerLogo} />
          <View>
            <Text style={styles.brand}>BEMBOS</Text>
            <Text style={styles.headerTitle}>Nuestro Menú 🍔</Text>
            <Text style={styles.greeting}>Hola, {user?.nombre || 'cliente'}</Text>
          </View>
        </View>
        <Pressable onPress={signOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
          <Text style={styles.signOut}>Salir</Text>
        </Pressable>
      </View>

      <SectionList
        contentContainerStyle={styles.list}
        sections={PRODUCT_SECTIONS}
        keyExtractor={(product) => product.productId}
        ListHeaderComponent={message ? <Text style={styles.message}>✓ {message}</Text> : null}
        renderItem={({ item }) => <ProductCard onAdd={handleAdd} product={item} />}
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        stickySectionHeadersEnabled={false}
      />

      <Pressable
        onPress={() => router.push('/(tabs)/cart')}
        style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
      >
        <Text style={styles.cartButtonText}>🛒  Ver carrito ({cartCount})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F5F5', flex: 1 },
  header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#FFC20E', borderBottomWidth: 4, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 22, paddingHorizontal: 20, paddingTop: 52 },
  heading: { alignItems: 'center', flexDirection: 'row' },
  headerLogo: { height: 52, marginRight: 10, resizeMode: 'contain', width: 52 },
  brand: { color: '#E30613', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  headerTitle: { color: '#1A1A1A', fontSize: 26, fontWeight: '900', marginTop: 3 },
  greeting: { color: '#666666', fontSize: 14, fontWeight: '600', marginTop: 4, opacity: 0.92 },
  signOutButton: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  signOut: { color: '#1300D0', fontSize: 13, fontWeight: '800' },
  list: { paddingBottom: 104, paddingHorizontal: 18, paddingTop: 16 },
  message: { backgroundColor: '#E6F6E9', borderRadius: 10, color: '#287A43', fontSize: 13, fontWeight: '700', marginBottom: 4, padding: 11 },
  sectionTitle: { color: '#1A1A1A', fontSize: 21, fontWeight: '900', marginBottom: 10, marginTop: 16 },
  cartButton: { alignItems: 'center', backgroundColor: '#1300D0', borderRadius: 26, bottom: 20, elevation: 5, left: 22, minHeight: 54, justifyContent: 'center', position: 'absolute', right: 22, shadowColor: '#000000', shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.2, shadowRadius: 6 },
  cartButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.82 },
});
