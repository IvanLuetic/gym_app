# 10 - State Management i Navigacija

> Tema: Context API, Redux, React Navigation (Stack, Tab, Drawer)

---

## State Management

### Lokalno vs Globalno stanje

| | **Lokalno stanje** | **Globalno stanje** |
|---|---|---|
| Alat | `useState` | Context API, Redux |
| Gdje živi | Unutar jedne komponente | Dostupno svuda u app |
| Kada koristiti | Forma, toggle, lokalni UI | Auth, tema, košarica, itd. |

---

## Context API

Dijeljenje podataka kroz hijerarhiju komponenti **bez prop drilinga**.

```tsx
// 1. Kreiranje konteksta
import { createContext, useContext, useState } from "react";

type AuthContextType = {
  user: string | null;
  setUser: (user: string | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// 2. Provider - omotava cijelu aplikaciju
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook za konzumiranje
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth mora biti unutar AuthProvider-a");
  return context;
}

// 4. Korištenje u komponenti
function ProfileScreen() {
  const { user } = useAuth();
  return <Text>{user}</Text>;
}
```

### Context API: prednosti i nedostaci

| ✅ Prednosti | ❌ Nedostaci |
|---|---|
| Jednostavan, ugrađen u React | Može uzrokovati nepotrebne re-rendere |
| Dobar za manje/srednje aplikacije | Nije optimalan za česte promjene stanja |
| Nema dodatnih paketa | Za kompleksne scenarije bolje Redux |

---

## Redux

Za **složene projekte** s centraliziranim stanjem.

### Ključni pojmovi

| Pojam | Opis |
|---|---|
| **Store** | Centralni kontejner za sve podatke |
| **Action** | Objekt koji opisuje što treba promijeniti |
| **Reducer** | Funkcija koja ažurira stanje na temelju akcije |
| **Dispatch** | Slanje akcije u store |
| **Selector** | Čitanje podataka iz storea |

```tsx
// Primjer Redux Toolkit (moderni Redux)
import { createSlice, configureStore } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

const store = configureStore({ reducer: { counter: counterSlice.reducer } });
```

> Za naš projekt → **Context API je dovoljan** (auth stanje, profil korisnika)

---

## Navigacija u Expo Routeru

> Koristimo **Expo Router** (file-based routing) — ne instaliramo React Navigation posebno.  
> Expo Router interno koristi React Navigation, ali automatski generira rute iz strukture foldera.

### Vrste navigacija

| Tip | React Navigation | Expo Router ekvivalent |
|---|---|---|
| **Stack** | `createStackNavigator` | Defaultno u `app/` |
| **Tab** | `createBottomTabNavigator` | `app/(tabs)/` folder |
| **Drawer** | `createDrawerNavigator` | `app/(drawer)/` folder |

---

## Stack Navigacija

Linearni tok — svaki ekran se "gura" na stack.

```
Ekran A → Ekran B → Ekran C
              ↑
          (back = pop)
```

### Expo Router Stack

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Početna" }} />
      <Stack.Screen name="details" options={{ title: "Detalji" }} />
    </Stack>
  );
}

// Navigacija između ekrana
import { useRouter } from "expo-router";

const router = useRouter();
router.push("/details");     // Idi naprijed
router.back();               // Idi nazad
router.replace("/home");     // Zamijeni (bez back opcije)
```

---

## Tab Navigacija

Više sekcija aplikacije — tab bar na dnu ekrana.

```
┌─────────────────────┐
│                     │
│      SADRŽAJ        │
│                     │
├──────┬──────┬───────┤
│ Home │  +   │ Profil│  ← Tab bar
└──────┴──────┴───────┘
```

### Expo Router Tabs

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Početna",
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <Icon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

## Drawer Navigacija

Bočni meni koji se otvara sa strane — za aplikacije s više sekcija.

```tsx
// app/(drawer)/_layout.tsx
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="index" options={{ title: "Početna" }} />
      <Drawer.Screen name="settings" options={{ title: "Postavke" }} />
    </Drawer>
  );
}
```

---

## Kombiniranje navigacija (Nested)

Najčešći pattern u složenim aplikacijama:

```
Drawer
└── Tabs (Tab navigacija unutar Drawera)
    ├── Tab 1: Stack (Stack unutar Taba)
    │   ├── Lista
    │   └── Detalji
    └── Tab 2: Profil
```

### Expo Router struktura za kombiniranje

```
app/
├── _layout.tsx              # Root Stack
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/                  # Tab navigacija (samo za prijavljene)
    ├── _layout.tsx
    ├── index.tsx            # Home
    ├── workout.tsx          # Treninzi
    └── profile.tsx          # Profil
```

---

## Navigacija s parametrima

```tsx
// Slanje parametra
router.push({ pathname: "/workout/[id]", params: { id: "123" } });

// Primanje parametra
import { useLocalSearchParams } from "expo-router";

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams();
  return <Text>Workout ID: {id}</Text>;
}
```

---

## Napomene za naš projekt

1. **Expo Router** → koristimo, ne React Navigation direktno
2. **`(tabs)/`** folder → tab navigacija za glavni dio aplikacije
3. **`(auth)/`** folder → zasebni ekrani za login/register bez tab bara
4. **`_layout.tsx`** s `onAuthStateChanged` → redirect na login ako nije prijavljen
5. **Context API** → dovoljan za naš projekt (auth stanje, tema)
6. **Redux** → prevelik overhead za ovaj projekt, ne trebamo
7. **Stack parametri** → korisni za detalje treninga (`/workout/[id]`)
