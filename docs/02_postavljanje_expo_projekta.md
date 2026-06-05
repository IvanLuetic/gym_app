# 02 - Postavljanje Expo Projekta

> Bazira se na službenom Expo tutorialu (StickerSmash). Pretpostavlja poznavanje **TypeScript-a i React-a**.

---

## 1. Inicijalizacija projekta

```bash
npx create-expo-app@latest NazivProjekta
# odaberi SDK 54
cd NazivProjekta
```

- Koristi **`create-expo-app`** alat
- Odabrati **SDK 54** template
- Template dolazi s: **Expo Router** + osnovne biblioteke + podrška za Expo Go

---

## 2. Struktura projekta nakon inicijalizacije

```
projekt/
├── app/               # Ekrani (file-based routing)
│   ├── index.tsx      # Početni ekran (entry point)
│   └── _layout.tsx    # Root layout
├── assets/
│   └── images/        # Slike i ikonice
├── app-example/       # Primjeri (boilerplate koji se može obrisati)
└── package.json
```

### Reset boilerplate-a
```bash
npm run reset-project
```
- Briše boilerplate, ostavlja samo `index.tsx` i `_layout.tsx`
- Stari folderi (`components/`, `constants/`, `hooks/`) se premještaju u `app-example/`

---

## 3. Pokretanje aplikacije

```bash
npx expo start
```

| Platforma | Kako otvoriti |
|---|---|
| **Android** | Expo Go app → Scan QR code |
| **iOS** | Kamera app → skeniraj QR |
| **Web** | Pritisni `W` u terminalu |

---

## 4. Stiliziranje u React Native

### Razlika od weba
- Nema CSS datoteka — koriste se **JavaScript objekti** (`StyleSheet`)
- Isti koncepti kao CSS, ali JS sintaksa

### Primjer - `app/index.tsx`

```tsx
import { Text, View, StyleSheet } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});
```

### Podržani formati boja
- Hex: `#fff`, `#25292e`
- RGBA: `rgba(0, 0, 0, 0.5)`
- HSL: `hsl(0, 100%, 50%)`
- Named: `red`, `blue`, `papayawhip`...

---

## Ključne napomene za naš projekt

- **Expo Router** se koristi za navigaciju (file-based)
- Svaki fajl u `app/` mapi = jedan ekran/ruta
- `index.tsx` = entry point aplikacije
- Stilove definiramo uvijek kroz `StyleSheet.create({})`, ne inline
- **TypeScript** je obavezan (`.tsx` ekstenzija)
- Promjene se odmah reflektiraju → **Fast Refresh**
