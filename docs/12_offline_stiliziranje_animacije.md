# 12 - Offline Podrška, Stiliziranje i Animacije

> Tema: Offline rad s Firestore-om, UI dizajn, CSS-in-JS i animacije

---

## Offline Podrška

### Zašto offline podrška?
- Bolje korisničko iskustvo u područjima s lošom mrežom
- Brži pristup podacima (iz cache-a)
- Manji trošak podataka

### Firestore offline podrška (automatska)
Firestore ima **ugrađenu offline podršku** — nema potrebe za posebnom konfiguracijom u Expo:
- Čita lokalno predmemorirane podatke kad nema interneta
- Piše lokalno, sinkronizira automatski kad se veza vrati
- Rukuje konfliktima automatski

---

## Alati za lokalnu pohranu

| Alat | Tip | Kada koristiti |
|---|---|---|
| **AsyncStorage** | Ključ-vrijednost | Mali podaci: token, postavke, tema |
| **SQLite** (`expo-sqlite`) | Relacijska baza | Složeni strukturirani podaci |
| **Realm** | Objektna baza | Velike količine, reaktivno praćenje |
| **WatermelonDB** | Offline-first | Napredne offline aplikacije |

### AsyncStorage — primjer

```bash
npx expo install @react-native-async-storage/async-storage
```

```tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

// Spremi
await AsyncStorage.setItem("theme", "dark");

// Čitaj
const theme = await AsyncStorage.getItem("theme");

// Briši
await AsyncStorage.removeItem("theme");
```

> Za naš projekt: **AsyncStorage** za temu i korisničke preference, **Firestore** za podatke

---

## UI Dizajn i Stiliziranje

### StyleSheet (koristimo uvijek)

```tsx
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF3F8",
    padding: 20,
  },
});
```

### Styled Components (CSS-in-JS alternativa)

```bash
npm install styled-components
npm install @types/styled-components-react-native
```

```tsx
import styled from "styled-components/native";

const Container = styled.View`
  flex: 1;
  background-color: #eef3f8;
  padding: 20px;
`;

const Title = styled.Text<{ active: boolean }>`
  font-size: 24px;
  color: ${({ active }) => active ? '#2563EB' : '#111827'};
`;

// Korištenje
<Container>
  <Title active={true}>Naslov</Title>
</Container>
```

### Prednosti Styled Components

| ✅ Prednosti | ❌ Nedostaci |
|---|---|
| CSS-like sintaksa | Dodatan paket |
| Uvjetni stilovi elegantni | Može biti sporije |
| Teme (dark/light) | Manje uobičajeno u RN ekosustavu |
| Stilovi uz komponentu | Kompleksnije za debugiranje |

> Za naš projekt: **StyleSheet** je dovoljan i brži — koristimo ga

---

## Animacije u React Native

### 1. Animated API (ugrađeno, osnovno)

```tsx
import { Animated, Easing } from "react-native";
import { useRef, useEffect } from "react";

export default function FadeInView({ children }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,  // ← uvijek true za performanse
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}
```

### Vrste Animated animacija

```tsx
// Fade
Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true })

// Spring (bounce efekt)
Animated.spring(value, { toValue: 1, bounciness: 10, useNativeDriver: true })

// Sekvenca
Animated.sequence([animation1, animation2]).start()

// Paralelno
Animated.parallel([animation1, animation2]).start()
```

### 2. Reanimated (napredne animacije)

```bash
npx expo install react-native-reanimated
```

```tsx
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";

export default function AnimatedButton() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPressIn={() => (scale.value = withSpring(0.95))}
                 onPressOut={() => (scale.value = withSpring(1))}>
        <Text>Klikni me</Text>
      </Pressable>
    </Animated.View>
  );
}
```

### 3. Gesture Handler

```bash
npx expo install react-native-gesture-handler
```

```tsx
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const swipeGesture = Gesture.Pan().onUpdate((e) => {
  // e.translationX, e.translationY
});

<GestureDetector gesture={swipeGesture}>
  <View>...</View>
</GestureDetector>
```

### Usporedba alata za animacije

| Alat | Složenost | Kada koristiti |
|---|---|---|
| **Animated API** | Niska | Fade, slide, scale — jednostavno |
| **Reanimated** | Srednja | Kompleksne, geste, shared values |
| **Gesture Handler** | Srednja | Swipe, drag, pinch-zoom |

---

## Teme (Light/Dark mode)

```tsx
import { useColorScheme } from "react-native";

const colors = {
  light: { background: "#FFFFFF", text: "#111827", primary: "#2563EB" },
  dark: { background: "#111827", text: "#F9FAFB", primary: "#60A5FA" },
};

export default function ThemedComponent() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const theme = colors[scheme ?? "light"];

  return (
    <View style={{ backgroundColor: theme.background }}>
      <Text style={{ color: theme.text }}>Tekst</Text>
    </View>
  );
}
```

---

## Napomene za naš projekt

1. **Offline** → Firestore automatski radi offline; nema dodatne konfiguracije
2. **AsyncStorage** → za lokalne postavke (ne za korisničke podatke — to je Firestore)
3. **StyleSheet** → koristimo, ne Styled Components
4. **Animated API** → za jednostavne animacije (fade ekrana, loading...)
5. **Reanimated** je već instaliran u Expo SDK 54 — možemo koristiti
6. **Tema** → `useColorScheme` za light/dark mode podršku
