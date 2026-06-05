# 04 - Firebase Autentifikacija i Login Forma

> Tema: Izrada mobilne aplikacije s login formom koristeći Firebase Auth

---

## Firebase - Što je i zašto?

**Firebase** je Google-ova platforma za backend usluge.

### Što nudi:
- ✅ **Autentifikacija korisnika** (email/password, Google, itd.)
- ✅ **Realtime baza podataka** (Firestore)
- ✅ **Hosting, Analytics, Storage**

### Zašto Firebase Auth?
- Sigurna i brza autentifikacija
- Prati industrijske sigurnosne standarde
- Nema potrebe za vlastitim backendom

---

## Struktura projekta

```
MyApp/
├── app/                    # Ekrani (Expo Router)
│   ├── index.tsx           # Početni ekran / redirect
│   ├── (auth)/
│   │   ├── login.tsx       # Login ekran
│   │   └── register.tsx    # Registracija
│   └── (tabs)/
│       └── home.tsx        # Glavni ekran (nakon prijave)
├── assets/                 # Slike, fontovi, ikone
├── firebaseConfig.ts       # Firebase konfiguracija
├── node_modules/
└── package.json
```

---

## Postavljanje projekta

### 1. Kreiranje projekta
```bash
npx create-expo-app@latest MyApp
cd MyApp
npx expo start
```

### 2. Instalacija Firebase
```bash
npx expo install firebase
```

### 3. Firebase konfiguracija (`firebaseConfig.ts`)
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

> ⚠️ Firebase config podatke **nikad ne commitati** na GitHub → koristiti `.env` datoteku!

---

## Osnovne React Native komponente

| Komponenta | Namjena |
|---|---|
| `<View>` | Kontejner / struktura layouta |
| `<Text>` | Prikaz teksta |
| `<TextInput>` | Unos teksta (email, password) |
| `<Button>` / `<TouchableOpacity>` | Interakcija korisnika |

---

## useState Hook

```typescript
import { useState } from 'react';

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

- `email` → trenutna vrijednost
- `setEmail` → funkcija za ažuriranje vrijednosti
- Svaka promjena state-a → re-render komponente

---

## Login forma - implementacija

```typescript
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Uspješna prijava → Expo Router automatski preusmjeri
    } catch (err: any) {
      setError('Pogrešan email ili lozinka.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prijava</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button title="Prijavi se" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 8 },
  error: { color: 'red', marginBottom: 10 },
});
```

---

## Logika prijave - flow

```
Korisnik unosi email + lozinka
        ↓
handleLogin() se poziva
        ↓
signInWithEmailAndPassword(auth, email, password)
        ↓
   ┌────────────────┐
   │   Uspjeh?      │
   └────────────────┘
     Da ↓        Ne ↓
  Redirect     Prikaži
  na Home      grešku
```

---

## onAuthStateChanged - praćenje stanja prijave

```typescript
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// U root _layout.tsx
const router = useRouter();

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      router.replace('/(tabs)/home');  // Korisnik prijavljen
    } else {
      router.replace('/(auth)/login'); // Nije prijavljen
    }
  });
  return unsubscribe; // Cleanup
}, []);
```

---

## Ključni zaključci

1. **Firebase Console** → kreirati projekt, omogućiti Email/Password auth
2. **`firebaseConfig.ts`** → inicijalizacija Firebase-a
3. **`signInWithEmailAndPassword`** → prijava korisnika
4. **`createUserWithEmailAndPassword`** → registracija korisnika
5. **`onAuthStateChanged`** → automatski prati je li korisnik prijavljen
6. **`signOut`** → odjava korisnika
