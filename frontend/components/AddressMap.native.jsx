import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

export default function AddressMap({ coordinates, onChange }) {
  const coordinate = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };

  return (
    <MapView
      initialRegion={{ ...coordinate, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
      showsUserLocation
      style={styles.map}
    >
      <Marker
        coordinate={coordinate}
        draggable
        onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
        pinColor="#1300D0"
        title="Dirección de entrega"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { height: 170, width: '100%' },
});
