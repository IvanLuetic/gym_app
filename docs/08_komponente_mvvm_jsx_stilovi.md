# 08 - Komponente, MVVM, JSX i Stiliziranje

> Tema: Arhitektura, JSX sintaksa, komponente i stiliziranje u React Native-u

---

## MVVM Arhitektura

### Što je MVVM?
**Model-View-ViewModel** — obrazac za organizaciju koda koji razdvaja poslovnu logiku od prikaza.

### MVVM vs MVC

| | **MVC** | **MVVM** |
|---|---|---|
| Kontroler | Controller | ViewModel |
| Povezivanje | Manualano | Data binding |
| Primjena | Web razvoj | UI-heavy aplikacije |
| State | U controlleru | U ViewModelu |

### MVVM u React Native

| Sloj | Što radi | Primjeri |
|---|---|---|
| **Model** | Podaci i poslovna logika | Firestore, Firebase Auth, API |
| **View** | Sučelje (UI) | React komponente, JSX |
| **ViewModel** | Posrednik između M i V | `useState`, `useEffect`, custom hooks |

```
Model (Firestore) ←→ ViewModel (hooks/state) ←→ View (komponente)
```

> U praksi: naše **custom hooks** (`useAuth`, `useWorkout`...) su ViewModel sloj.

---

## JSX

### Što je JSX?
- **JavaScript XML** — XML-like sintaksa unutar JavaScript/TypeScript koda
- Zamjena za `React.createElement()`
- Kompajlira se u JavaScript pri buildu

### JSX pravila

```tsx
// ✅ Svaki element mora biti zatvoren
<TextInput placeholder="Email" />

// ✅ JavaScript izrazi idu u vitičaste zagrade {}
<Text>{korisnik.ime}</Text>
<Text>{2 + 2}</Text>
<Text>{loggedIn ? "Prijavljen" : "Nije prijavljen"}</Text>

// ✅ Komponente počinju velikim slovom
<MyComponent />   // custom komponenta
<View />          // React Native komponenta

// ✅ Jedan root element (ili Fragment)
return (
  <View>
    <Text>Naslov</Text>
    <Text>Opis</Text>
  </View>
);

// ✅ Fragment ako ne treba wrapper
return (
  <>
    <Text>Naslov</Text>
    <Text>Opis</Text>
  </>
);
```

---

## React Native Komponente

### Funkcijske komponente (koristimo uvijek)

```tsx
// Jednostavna funkcijska komponenta
const Welcome = () => (
  <View>
    <Text>Dobrodošli u React Native!</Text>
  </View>
);

// S props-ima i TypeScript tipovima
type Props = {
  ime: string;
  godine: number;
};

const KorisnikCard = ({ ime, godine }: Props) => (
  <View>
    <Text>{ime}</Text>
    <Text>{godine} godina</Text>
  </View>
);
```

### Klasne komponente (zastarjele, ne koristimo)

```tsx
// ❌ Stari pristup — ne koristiti
class Welcome extends React.Component {
  render() {
    return <Text>Hello</Text>;
  }
}
```

### Organizacija komponenti

```
components/
├── ui/                    # Generičke UI komponente
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── workout/               # Domenski specifične
│   ├── WorkoutCard.tsx
│   └── ExerciseList.tsx
└── profile/
    └── ProfileHeader.tsx
```

| Tip | Opis | Primjer |
|---|---|---|
| **Presentational** | Samo UI, prima props | `WorkoutCard`, `Button` |
| **Container** | Logika + state + data | `WorkoutScreen`, `AuthScreen` |

---

## Stiliziranje

### StyleSheet

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});

// Primjena
<View style={styles.container}>
  <Text style={styles.title}>Naslov</Text>
</View>
```

### Inline stilovi (samo za uvjetne stilove)

```tsx
<Text style={{ color: 'blue', fontSize: 16 }}>Pozdrav!</Text>

// Kombiniranje StyleSheet + inline
<View style={[styles.card, { backgroundColor: isActive ? '#blue' : '#gray' }]} />
```

---

## Flexbox u React Native

> Defaultno je **`flexDirection: 'column'`** (suprotno od weba gdje je `row`)

```tsx
const styles = StyleSheet.create({
  // Elementi jedan ispod drugog (default)
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  // Elementi jedan pored drugog
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Zauzmi sav slobodni prostor
  fullWidth: {
    flex: 1,
    width: '100%',
  },
});
```

### Najčešće Flexbox properties

| Property | Vrijednosti | Opis |
|---|---|---|
| `flexDirection` | `column`, `row` | Smjer rasporeda |
| `justifyContent` | `center`, `space-between`, `flex-start` | Raspored po glavnoj osi |
| `alignItems` | `center`, `stretch`, `flex-start` | Raspored po sporednoj osi |
| `flex` | broj | Koliko prostora zauzeti |
| `gap` | broj | Razmak između elemenata |

---

## Stiliziranje prema platformi

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontSize: Platform.OS === 'ios' ? 20 : 18,
  },
  shadow: {
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 4,
  },
});

// Ili platforma-specifičan kod
if (Platform.OS === 'android') {
  // samo za Android
}
```

---

## Napomene za naš projekt

1. **Uvijek** koristiti `StyleSheet.create()` — ne ad-hoc inline objekte
2. **Funkcijske komponente** + hooks — klasne ne koristiti
3. **MVVM** → naše `useAuth`, `useProfile` hooks su ViewModel sloj
4. **`flex: 1`** na root containeru → zauzima cijeli ekran
5. **`Platform.OS`** → ako trebamo razliku između iOS i Android prikaza
6. Zajednički stilovi → u `constants/styles.ts` ili `constants/theme.ts`
7. Komponente dijeliti na **Presentational** (u `components/`) i **Container** (u `app/`)
