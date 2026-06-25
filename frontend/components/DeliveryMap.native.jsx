import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export default function DeliveryMap({ location }) {
  const coordinate = {
    latitude: location.lat,
    longitude: location.lng,
  };

  return (
    <MapView
      region={{ ...coordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
      style={styles.map}
    >
      <Marker coordinate={coordinate} pinColor="#1300D0" title="Tu delivery" />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 320, width: '100%' },
});
