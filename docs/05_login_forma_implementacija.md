# 05 - Login Forma s Firebase i TypeScript

> Detaljna implementacija login ekrana u Expo Router projektu

---

## 1. Kreiranje projekta

```bash
npx create-expo-app@latest MojaPrvaAplikacija
cd MojaPrvaAplikacija
npx expo start
```

---

## 2. Instalacija Firebase

```bash
npm install firebase
```

---

## 3. Struktura projekta

```
MyFirebaseAuthApp/
├── app/
│   ├── _layout.tsx              # Root layout + auth listener
│   ├── modal.tsx
│   └── (tabs)/
│       ├── _layout.tsx          # Tab navigacija
│       ├── index.tsx            # Home tab
│       ├── explore.tsx          # Explore tab
│       └── auth.tsx             # Auth tab (login/logout)
├── assets/
├── firebaseConfig.ts            # Firebase inicijalizacija
├── package.json
└── tsconfig.json
```

---

## 4. Firebase konzola - setup

1. Idi na https://console.firebase.google.com/
2. **Create project** → dovrši kreiranje
3. **Security → Authentication → Get started**
4. **Sign-in method** → uključi **Email/Password**
5. **Project settings** → dodaj **Web aplikaciju**
6. Kopiraj konfiguracijske podatke

---

## 5. `firebaseConfig.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
```

> ⚠️ **Izbrisati analytics dio** koji Firebase konzola automatski generira!  
> ⚠️ Nikad ne commitati ove podatke — staviti u `.env` datoteku

---

## 6. Tab navigacija - `app/(tabs)/_layout.tsx`

```typescript
import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="auth"
        options={{
          title: 'Auth',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Dodati `person.fill` u icon mapping (`components/ui/icon-symbol.tsx`)

```typescript
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.fill': 'person',   // ← dodati ovo
} as IconMapping;
```

---

## 7. Auth ekran - `app/(tabs)/auth.tsx`

```typescript
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export default function AuthScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  // Ako je korisnik prijavljen - prikaži welcome screen
  if (loggedIn) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Dobrodošli u aplikaciju!</Text>
          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Odjavi se</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Ako nije prijavljen - prikaži login formu
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#6B7280"
        />
        <TextInput
          placeholder="Lozinka"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#6B7280"
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Prijava</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 10,
    marginBottom: 18,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    color: "#111827",
  },
  error: {
    width: "100%",
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "left",
  },
  button: {
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

---

## 8. Objašnjenje ključnih dijelova

| Kod | Opis |
|---|---|
| `useState<string>("")` | State za email, lozinku, grešku (TypeScript tipovi) |
| `useState<boolean>(false)` | State koji prati je li korisnik prijavljen |
| `signInWithEmailAndPassword(auth, email, password)` | Firebase prijava |
| `signOut(auth)` | Firebase odjava |
| `import { auth } from "@/firebaseConfig"` | Uvoz Firebase instance |
| `if (loggedIn) { return ... }` | Uvjetni render — welcome screen ili login forma |
| `Pressable` | Stilizirani gumb (bolji od `Button` komponente) |
| `secureTextEntry` | Sakriva unos lozinke |
| `autoCapitalize="none"` | Isključuje auto-uppercase za email |

---

## 9. Flow aplikacije

```
Korisnik otvori Auth tab
         ↓
   loggedIn === false?
         ↓
   Prikaži Login formu
         ↓
  Unos email + password
         ↓
     handleLogin()
         ↓
  signInWithEmailAndPassword
    ↙              ↘
 Uspjeh          Greška
   ↓                ↓
setLoggedIn(true)  setErrorMessage
   ↓
Welcome screen + "Odjavi se"
   ↓
handleLogout() → setLoggedIn(false)
```

---

## Napomene za naš projekt

- Koristimo **`Pressable`** umjesto `Button` — omogućava custom stiliziranje
- **TypeScript tipovi** na state (`useState<string>`, `useState<boolean>`)
- `@/firebaseConfig` → alijasirani import (definiran u `tsconfig.json`)
- U našem projektu login nije tab nego **zasebni ekran** s Expo Router rutama
- `onAuthStateChanged` u `_layout.tsx` je bolji pristup od lokalnog `loggedIn` state-a
