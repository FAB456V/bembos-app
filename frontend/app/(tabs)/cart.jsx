import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCart } from '../../hooks/useCart';
import { createOrder } from '../../services/ordersService';

export default function CartScreen() {
  const { changeQuantity, clearCart, items, total } = useCart();
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (items.length === 0 || !direccionEntrega.trim()) {
      setError('Agrega productos e ingresa una direccion de entrega.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await createOrder({ productos: items, direccionEntrega: direccionEntrega.trim() });
      clearCart();
      setDireccionEntrega('');
      router.replace('/(tabs)/orders');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo confirmar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu carrito</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        ListEmptyComponent={<Text style={styles.empty}>Aun no agregaste productos.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text>S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</Text>
            </View>
            <View style={styles.quantity}>
              <Pressable onPress={() => changeQuantity(item.productId, item.cantidad - 1)} style={styles.quantityButton}><Text>-</Text></Pressable>
              <Text style={styles.quantityText}>{item.cantidad}</Text>
              <Pressable onPress={() => changeQuantity(item.productId, item.cantidad + 1)} style={styles.quantityButton}><Text>+</Text></Pressable>
            </View>
          </View>
        )}
      />
      <TextInput
        onChangeText={setDireccionEntrega}
        placeholder="Direccion de entrega"
        style={styles.input}
        value={direccionEntrega}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.total}>Total: S/ {total.toFixed(2)}</Text>
      <Pressable disabled={isSubmitting} onPress={handleConfirm} style={styles.confirmButton}>
        <Text style={styles.confirmText}>{isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 18, paddingTop: 50 },
  title: { color: '#222222', fontSize: 25, fontWeight: '800', marginBottom: 16 },
  empty: { color: '#666666', marginTop: 20, textAlign: 'center' },
  item: { alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 14 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  quantity: { alignItems: 'center', flexDirection: 'row' },
  quantityButton: { alignItems: 'center', backgroundColor: '#eeeeee', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  quantityText: { marginHorizontal: 12 },
  input: { backgroundColor: '#ffffff', borderColor: '#dddddd', borderRadius: 8, borderWidth: 1, marginTop: 12, padding: 14 },
  error: { color: '#b00020', marginTop: 10 },
  total: { fontSize: 19, fontWeight: '800', marginVertical: 14 },
  confirmButton: { alignItems: 'center', backgroundColor: '#d71920', borderRadius: 8, padding: 15 },
  confirmText: { color: '#ffffff', fontWeight: '800' },
});
