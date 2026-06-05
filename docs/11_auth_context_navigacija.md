# 11 - AuthContext i Navigacija u Expo Routeru

> Tema: Context API za auth stanje + objašnjenje Stack/Tab/Drawer navigacije

---

## Struktura projekta

```
app/
├── _layout.tsx              # Root Stack + AuthProvider
├── modal.tsx
└── (tabs)/
    ├── _layout.tsx          # Tab navigacija
    ├── index.tsx
    ├── explore.tsx
    └── auth.tsx             # Samo konzumira context

components/
└── auth/
    ├── AuthButton.tsx
    ├── AuthInput.tsx
    ├── ErrorMessage.tsx
    ├── LoggedInView.tsx     # Firestore profil logika ovdje
    └── LoggedOutView.tsx    # Login forma ovdje

contexts/
└── AuthContext.tsx          # Globalno auth stanje

firebase.ts
```

---

## AuthContext - `contexts/AuthContext.tsx`

```tsx
import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, type User,
} from "firebase/auth";
import { auth } from "@/firebase";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  authReady: boolean;           // Firebase još provjerava sesiju?
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);  // Firebase je provjerio sesiju
    });
    return unsubscribe;  // cleanup
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // useMemo - sprječava nepotrebne re-rendere
  const value = useMemo(
    () => ({ user, isLoggedIn: !!user, authReady, login, logout }),
    [user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
```

### Što svako polje znači

| Polje | Tip | Opis |
|---|---|---|
| `user` | `User \| null` | Firebase User objekt (uid, email...) |
| `isLoggedIn` | `boolean` | `!!user` — da/ne |
| `authReady` | `boolean` | Firebase završio provjeru sesije |
| `login` | `fn` | `signInWithEmailAndPassword` |
| `logout` | `fn` | `signOut` |

---

## Root Layout - `app/_layout.tsx`

```tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>          {/* ← Obavija sve rute */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

> `AuthProvider` u root layoutu → dostupan svim ekranima u aplikaciji

---

## Auth Tab - `app/(tabs)/auth.tsx`

```tsx
import { ActivityIndicator, View, StyleSheet } from "react-native";
import LoggedInView from "@/components/auth/LoggedInView";
import LoggedOutView from "@/components/auth/LoggedOutView";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthScreen() {
  const { isLoggedIn, authReady } = useAuth();

  // Čekaj dok Firebase provjeri sesiju
  if (!authReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return isLoggedIn ? <LoggedInView /> : <LoggedOutView />;
}

const styles = StyleSheet.create({
  centered: { flex: 1, backgroundColor: "#EEF3F8", justifyContent: "center", alignItems: "center" },
});
```

---

## LoggedOutView - koristi `login` iz contexta

```tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoggedOutView() {
  const { login } = useAuth();  // ← iz contexta
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);  // context funkcija
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error.message ?? "Prijava nije uspjela.");
    }
  };
  // ... UI
}
```

## LoggedInView - Firestore + `user` i `logout` iz contexta

```tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/firebase";

export default function LoggedInView() {
  const { user, logout } = useAuth();  // ← iz contexta
  const [profile, setProfile] = useState(emptyProfile);

  useEffect(() => {
    if (!user) return;
    // Dohvati profil pri montiranju komponente
    const fetchProfile = async () => {
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);
      setProfile(docSnap.exists() ? docSnap.data() as Profile : emptyProfile);
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    await logout();  // context funkcija
    setProfile(emptyProfile);
  };
  // ... UI
}
```

---

## Navigacija - kako funkcionira u ovoj strukturi

### Stack (Root)
```
app/_layout.tsx → Stack
├── (tabs)          ← cijela tabs grupa
└── modal           ← prikazuje se IZNAD svega
```

### Tabs
```
app/(tabs)/_layout.tsx → Tabs (donji tab bar)
├── index.tsx    → Home tab
├── explore.tsx  → Explore tab
└── auth.tsx     → Auth tab
```

### Drawer (trenutno nije aktivan, ali bi izgledao ovako)
```
app/(drawer)/_layout.tsx → Drawer (bočni meni)
├── (tabs)/      → Tabs unutar Drawera
└── settings.tsx → Zasebna sekcija
```

| Navigacija | Kada koristiti |
|---|---|
| **Stack** | Linearne rute, modali, detalji |
| **Tabs** | Glavne sekcije (2-5 ravnopravnih) |
| **Drawer** | Mnogo sekcija, admin, postavke |

### Drawer — primjer ako aplikacija naraste

```bash
npx expo install @react-navigation/drawer
```

```tsx
// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: "Početne sekcije" }} />
      <Drawer.Screen name="settings" options={{ drawerLabel: "Postavke" }} />
    </Drawer>
  );
}
```

---

## Napomene za naš projekt

1. **`AuthContext`** → koristi se za `user`, `isLoggedIn`, `login`, `logout`
2. **`authReady`** → uvijek provjeriti prije renderiranja auth-ovisnog sadržaja
3. **`useEffect` + `onAuthStateChanged`** → automatski prati promjene prijave
4. **`useMemo`** na context value → sprječava nepotrebne re-rendere
5. Drawer dodajemo **samo ako aplikacija preraste** 4-5 tabova
6. Firestore logika ostaje u **feature komponentama** (`LoggedInView`), ne u contextu
