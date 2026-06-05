# 16 - Hardware Funkcije u Explore Tabu

> Tema: GPS, akcelerometar, magnetometar, kamera, galerija i vibracije

---

## Instalacija

```bash
npx expo install expo-location expo-sensors expo-image-picker
# Vibration dolazi iz react-native, nema instalacije
```

---

## Struktura

```
app/(tabs)/explore.tsx       # Zamijeni postojeći sadržaj
components/hardware/
├── HardwareFeatureCard.tsx  # Kartica za svaku funkciju
└── SensorValueRow.tsx       # Redak s labelom i vrijednošću
```

---

## `HardwareFeatureCard.tsx`

```tsx
type HardwareFeatureCardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};
// Kartica s naslovom, opisom i prostorom za kontrole
```

## `SensorValueRow.tsx`

```tsx
type SensorValueRowProps = { label: string; value: number | string; };
// Prikazuje: "x    0.123" u jednom redu
// value.toFixed(3) za zaokruživanje na 3 decimale
```

---

## GPS Lokacija

```tsx
import * as Location from "expo-location";

const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Dozvola odbijena", "...");
    return;
  }
  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude, accuracy } = location.coords;
  setLocationText(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
};
```

---

## Akcelerometar i Magnetometar

```tsx
import { Accelerometer, Magnetometer } from "expo-sensors";

// Pattern isti za oba senzora:
useEffect(() => {
  if (!accelerometerEnabled) return;

  Accelerometer.setUpdateInterval(500);  // ms između update-a
  const subscription = Accelerometer.addListener((data) => {
    setAccelerometerData(data);  // { x, y, z }
  });

  return () => subscription.remove();  // ← Cleanup! Sprječava memory leak
}, [accelerometerEnabled]);
```

> **Uvijek** pozvati `subscription.remove()` u cleanup funkciji!

---

## Kamera i Galerija

```tsx
import * as ImagePicker from "expo-image-picker";

// Kamera
const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") return;
  const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
  if (!result.canceled) setImageUri(result.assets[0].uri);
};

// Galerija
const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") return;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });
  if (!result.canceled) setImageUri(result.assets[0].uri);
};
```

---

## Vibracije

```tsx
import { Vibration } from "react-native";

// Uzorak: vibracija 300ms, pauza 150ms, vibracija 300ms
Vibration.vibrate([300, 150, 300]);
```

---

## app.json dozvole (za iOS)

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Aplikacija koristi lokaciju...",
        "NSCameraUsageDescription": "Aplikacija koristi kameru...",
        "NSPhotoLibraryUsageDescription": "Aplikacija koristi galeriju..."
      }
    }
  }
}
```

---

## Napredne funkcije (zahtijevaju native module)

| Funkcija | Paket | Napomena |
|---|---|---|
| **Bluetooth** | `react-native-ble-plx` | Development build, fizički uređaj |
| **NFC** | `react-native-nfc-manager` | NFC podrška na uređaju |
| **Zvuk/mikrofon** | `expo-av` | Snimanje/reprodukcija |
| **IoT** | MQTT klijent | Broker + senzor |

---

## Što radi na Expo Go, što ne

| Funkcija | Expo Go | Dev Build |
|---|---|---|
| GPS | ✅ | ✅ |
| Akcelerometar | ✅ | ✅ |
| Magnetometar | ✅ | ✅ |
| Kamera | ✅ | ✅ |
| Galerija | ✅ | ✅ |
| Vibracije | ✅ (samo fizički) | ✅ |
| Bluetooth | ❌ | ✅ |
| NFC | ❌ | ✅ |

---

## Napomene za naš projekt

1. **Senzori** → `subscription.remove()` u cleanup → sprječava memory leak
2. **Dozvole** → uvijek tražiti prije korištenja, handle `status !== "granted"`
3. **Simulator** → vibracije i senzori ne rade pouzdano → testirati na fizičkom uređaju
4. **`setUpdateInterval(500)`** → 500ms je dovoljan interval za UI prikaz
5. Kamera/galerija → koristimo `expo-image-picker` (isti paket kao za upload slika u vježbi 10)
