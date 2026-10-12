import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const ZOOM_LEVEL = 15;
const ANIMATION_DURATION = 2000;

export default function App() {
  const [userLocation, setUserLocation] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const mapRef = useRef(null);

  const animateTo = (coordinate) => {
    mapRef.current?.animateCamera(
      { center: coordinate, zoom: ZOOM_LEVEL },
      { duration: ANIMATION_DURATION },
    );
  };

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Permission to access location was denied");
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        const coordinate = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setUserLocation(coordinate);
        animateTo(coordinate);
      } catch (error) {
        setLocationError("Permission to access location was denied");
      }
    }

    getCurrentLocation();
  }, []);

  const handleAddMarker = async () => {
    try {
      const results = await Location.geocodeAsync(address.trim());
      if (!results || results.length === 0) {
        setAddressError("Address not found");
        return;
      }

      const coordinate = {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
      setAddressError(null);
      setMarker(coordinate);
      animateTo(coordinate);
    } catch (error) {
      setAddressError("Address not found");
    }
  };

  const handleCenterMarker = () => {
    animateTo(marker);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsMyLocationButton
          showsUserLocation
        >
          {marker ? <Marker coordinate={marker} /> : null}
          {marker && userLocation ? (
            <Polyline
              coordinates={[userLocation, marker]}
              strokeColor="#1e90ff"
              strokeWidth={3}
            />
          ) : null}
        </MapView>
      </View>
      {locationError ? <Text style={styles.error}>{locationError}</Text> : null}
      {addressError ? <Text style={styles.error}>{addressError}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Enter the address"
        value={address}
        onChangeText={setAddress}
      />
      <View style={styles.buttonContainer}>
        <Button title="Add marker" onPress={handleAddMarker} />
        {marker ? (
          <Button title="Center the marker" onPress={handleCenterMarker} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 60,
  },
  mapContainer: {
    flex: 1,
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 5,
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});
