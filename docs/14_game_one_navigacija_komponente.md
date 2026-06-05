# 14 - Game One: Route, Navigacija i Komponente

> Tema: Zasebni Stack screen za igricu, route polje u Firestore, UI komponente

---

## Struktura projekta

```
app/
├── _layout.tsx          # Dodati Stack.Screen za "game-one"
├── game-one.tsx         # Zasebni ekran igrice
└── (tabs)/games.tsx     # Navigacija via router.push(item.route)

components/game-one/
├── GameActionButton.tsx
├── NumberDisplay.tsx
└── SumAnswerInput.tsx

types/game.ts            # Dodan "route" field
```

---

## `types/game.ts` - Dodan `route`

```typescript
export type Game = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  route: string;           // ← NOVO
};
```

---

## `app/_layout.tsx` - Dodati game-one screen

```tsx
<Stack>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="game-one" options={{ title: "Game One" }} />   {/* ← NOVO */}
  <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
</Stack>
```

---

## Firestore dokument za Game One

```
games/AUTO_ID
├── title:       "Game One"
├── description: "Zapamti brojeve i unesi njihov zbroj."
├── imageUrl:    "https://..."
└── route:       "/game-one"   ← ključno polje
```

---

## Navigacija klikom na karticu - `games.tsx`

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

<FlatList
  renderItem={({ item }) => (
    <Pressable onPress={() => router.push(item.route as any)}>
      <GameCard game={item} />
    </Pressable>
  )}
/>
```

---

## Game One UI komponente

### `NumberDisplay.tsx`
```tsx
export default function NumberDisplay({ value }: { value: number }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.number}>{value}</Text>
    </View>
  );
}
// Prikazuje veliki broj (96px) na sredini ekrana
```

### `SumAnswerInput.tsx`
```tsx
// TextInput (numeric) + checkmark gumb u redu
type SumAnswerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};
```

### `GameActionButton.tsx`
```tsx
// Podržava dvije varijante:
type GameActionButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "start" | "restart";  // start=zeleni, restart=plavi
};
```

---

## `app/game-one.tsx` - Logika igrice

```tsx
export default function GameOneScreen() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sum, setSum] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Generira 10 nasumičnih brojeva (bez uzastopnog ponavljanja)
  const generateRandomNumbers = () => {
    const nums: number[] = [];
    let previousNum: number | null = null;
    for (let i = 0; i < 10; i++) {
      let newNum: number;
      do { newNum = Math.floor(Math.random() * 10); }
      while (newNum === previousNum);
      nums.push(newNum);
      previousNum = newNum;
    }
    setNumbers(nums);
    setSum(nums.reduce((acc, num) => acc + num, 0));
    setCurrentIndex(0);
    setShowInput(false);
  };

  // Prikazuje brojeve jedan po jedan svakih 800ms
  useEffect(() => {
    if (!gameStarted || numbers.length === 0 || showInput) return;
    const timer = setTimeout(() => {
      if (currentIndex < numbers.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setShowInput(true);  // Svi prikazani → pokaži input
      }
    }, 800);
    return () => clearTimeout(timer);  // cleanup
  }, [gameStarted, numbers, currentIndex, showInput]);
}
```

### Flow igrice
```
"Započni igricu"
      ↓
generateRandomNumbers()
      ↓
useEffect → prikazuje broj svakih 800ms
      ↓
Zadnji broj → showInput = true
      ↓
SumAnswerInput → korisnik unosi zbroj
      ↓
handleSubmit → poruka točno/netočno
      ↓
"Restart" → generateRandomNumbers()
```

---

## Napomene za naš projekt

1. `router.push(item.route as any)` → dinamička navigacija na temelju Firestore `route` polja
2. Game One **nije tab** — zasebni Stack screen, otvara se iznad tabs navigacije
3. Svaka nova igrica = nova `route` vrijednost u Firestore + nova datoteka u `app/`
4. `clearTimeout` u useEffect cleanup → sprječava memory leak
