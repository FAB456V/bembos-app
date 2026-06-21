import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PRODUCT_IMAGES } from '../../constants/productImages';
import { useCart } from '../../hooks/useCart';
import { usePushToken } from '../../hooks/usePushToken';
import { createOrder } from '../../services/ordersService';

const PICKUP_STORES = [
  { id: 'principal', name: 'Bembos - Tienda principal', detail: 'Recojo directo en el mostrador' },
];

export default function CartScreen() {

  const { expoPushToken } = usePushToken();
  const [selectedStore, setSelectedStore] = useState(PICKUP_STORES[0]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    if (items.length === 0 || !selectedStore) {
      setError('Agrega productos y selecciona una tienda de recojo.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const order = await createOrder({
        productos: items,
        expoPushToken,
      });
      clearCart();
      router.replace({ pathname: '/order-confirmation', params: { orderId: order._id } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo confirmar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>BEMBOS</Text>
        <Text style={styles.title}>Tu pedido 🛒</Text>
        <Text style={styles.headerCaption}>Confirma tus productos para recogerlos en tienda</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => item.productId}
        ListEmptyComponent={<View style={styles.emptyCard}><Text style={styles.emptyIcon}>🍔</Text><Text style={styles.emptyTitle}>Tu carrito está vacío</Text><Text style={styles.empty}>Agrega tus favoritos desde nuestro menú.</Text></View>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={PRODUCT_IMAGES[item.productId]} style={styles.itemImage} />
            <View style={styles.itemDetails}><Text style={styles.itemName}>{item.nombre}</Text><Text style={styles.itemUnitPrice}>S/ {item.precioUnitario.toFixed(2)} c/u</Text><Text style={styles.itemPrice}>S/ {(item.precioUnitario * item.cantidad).toFixed(2)}</Text></View>
            <View style={styles.quantity}>
              <Pressable onPress={() => changeQuantity(item.productId, item.cantidad - 1)} style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}><Text style={styles.quantityButtonText}>−</Text></Pressable>
              <Text style={styles.quantityText}>{item.cantidad}</Text>
              <Pressable onPress={() => changeQuantity(item.productId, item.cantidad + 1)} style={({ pressed }) => [styles.quantityButton, styles.quantityAddButton, pressed && styles.pressed]}><Text style={styles.quantityAddText}>+</Text></Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.summaryCard}>
        <Text style={styles.pickupLabel}>Tienda de recojo</Text>
        {PICKUP_STORES.map((store) => {
          const selected = selectedStore?.id === store.id;
          return (
            <Pressable key={store.id} onPress={() => setSelectedStore(store)} style={[styles.storeCard, selected && styles.storeCardSelected]}>
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
              <View style={styles.storeDetails}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeDetail}>{store.detail}</Text>
              </View>
              <Text style={styles.storeIcon}>⌂</Text>
            </Pressable>
          );
        })}
        <Text style={styles.pickupHelp}>Te avisaremos cuando el pedido esté listo. Presenta el QR en el mostrador.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.divider} />
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.total}>S/ {total.toFixed(2)}</Text></View>
        <Pressable disabled={isSubmitting} onPress={handleConfirm} style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed, isSubmitting && styles.disabled]}><Text style={styles.confirmText}>{isSubmitting ? 'Confirmando...' : 'Confirmar para recojo'}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F5F5', flex: 1 },
  header: { backgroundColor: '#FFFFFF', borderBottomColor: '#FFC20E', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderBottomWidth: 4, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 52 },
  brand: { color: '#E30613', fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#1A1A1A', fontSize: 27, fontWeight: '900', marginTop: 3 },
  headerCaption: { color: '#666666', fontSize: 13, fontWeight: '600', marginTop: 4 },
  list: { flexGrow: 1, padding: 16 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#1A1A1A', fontSize: 17, fontWeight: '800', marginTop: 8 },
  empty: { color: '#666666', fontSize: 13, marginTop: 5 },
  item: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, elevation: 2, flexDirection: 'row', marginBottom: 11, padding: 11 },
  itemImage: { borderRadius: 10, height: 62, marginRight: 11, width: 62 },
  itemDetails: { flex: 1 },
  itemName: { color: '#1A1A1A', fontSize: 15, fontWeight: '800' },
  itemUnitPrice: { color: '#777777', fontSize: 11, marginTop: 3 },
  itemPrice: { color: '#1300D0', fontSize: 15, fontWeight: '900', marginTop: 4 },
  quantity: { alignItems: 'center', flexDirection: 'row' },
  quantityButton: { alignItems: 'center', backgroundColor: '#EEEEEE', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  quantityAddButton: { backgroundColor: '#FFC20E' },
  quantityButtonText: { color: '#1A1A1A', fontSize: 22, fontWeight: '700' },
  quantityAddText: { color: '#1A1A1A', fontSize: 21, fontWeight: '900' },
  quantityText: { fontWeight: '800', marginHorizontal: 9 },
  summaryCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, elevation: 8, padding: 16 },
  pickupLabel: { color: '#1A1A1A', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  storeCard: { alignItems: 'center', borderColor: '#D8D8D8', borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', padding: 12 },
  storeCardSelected: { backgroundColor: '#FFF9E6', borderColor: '#FFC20E' },
  radio: { alignItems: 'center', borderColor: '#999999', borderRadius: 10, borderWidth: 2, height: 20, justifyContent: 'center', width: 20 },
  radioSelected: { borderColor: '#1300D0' },
  radioDot: { backgroundColor: '#1300D0', borderRadius: 5, height: 10, width: 10 },
  storeDetails: { flex: 1, marginLeft: 10 },
  storeName: { color: '#1A1A1A', fontSize: 14, fontWeight: '800' },
  storeDetail: { color: '#666666', fontSize: 12, marginTop: 3 },
  storeIcon: { color: '#1300D0', fontSize: 25, fontWeight: '900' },
  pickupHelp: { color: '#666666', fontSize: 12, lineHeight: 17, marginTop: 9 },
  error: { color: '#E30613', fontSize: 12, fontWeight: '600', marginTop: 7 },
  divider: { backgroundColor: '#E5E5E5', height: 1, marginVertical: 11 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 },
  totalLabel: { fontSize: 18, fontWeight: '800' },
  total: { fontSize: 23, fontWeight: '900' },
  confirmButton: { alignItems: 'center', backgroundColor: '#1300D0', borderRadius: 12, justifyContent: 'center', minHeight: 50 },
  confirmText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.65 },
});
