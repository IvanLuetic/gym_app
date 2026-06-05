# 13 - Games Tab: Lista i Dodavanje u Firestore

> Tema: Novi tab s FlatList prikazom iz Firestore-a i modalnim dodavanjem

---

## Struktura

```
app/(tabs)/games.tsx
components/games/GameCard.tsx
components/games/AddGameModal.tsx
types/game.ts
```

## TypeScript tip - `types/game.ts`

```typescript
export type Game = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};
```

## Firestore Security Rules

```javascript
match /games/{gameId} {
  allow read: if true;                    // Svi mogu čitati
  allow create: if request.auth != null;  // Samo prijavljeni mogu dodati
  allow update, delete: if false;
}
```

## GameCard - Presentational

```tsx
import { Image, StyleSheet, Text, View } from "react-native";
import type { Game } from "@/types/game";

export default function GameCard({ game }: { game: Game }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: game.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.description}>{game.description}</Text>
      </View>
    </View>
  );
}
```

> Samo prikazuje podatke — navigacija se ne radi unutar nje

## AddGameModal

```tsx
// Modal SAMO prikuplja podatke i poziva onSubmit iz parent komponente
// Ne sprema ništa direktno u Firestore
type AddGameModalProps = {
  visible: boolean;
  title: string; description: string; imageUrl: string;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeImageUrl: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};
```

## Games Screen - Container

```tsx
export default function GamesScreen() {
  const { isLoggedIn } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Dohvati igre pri učitavanju
  useEffect(() => {
    const fetchGames = async () => {
      const snapshot = await getDocs(collection(firestore, "games"));
      const gamesList = snapshot.docs.map((doc) => ({
        id: doc.id, ...(doc.data() as Omit<Game, "id">),
      }));
      setGames(gamesList);
    };
    fetchGames();
  }, []);

  const handleAddGame = async () => {
    if (!isLoggedIn) {
      Alert.alert("Prijava je potrebna", "Prijavite se u Auth tabu.");
      return;
    }
    const newGame = { title: gameTitle, description: gameDescription, imageUrl: gameImageUrl };
    const docRef = await addDoc(collection(firestore, "games"), newGame);
    setGames((prev) => [...prev, { id: docRef.id, ...newGame }]); // Optimistički update
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} />}
      />
      <AddGameModal visible={modalVisible} onSubmit={handleAddGame} ... />
    </View>
  );
}
```

## Dodavanje u `_layout.tsx`

```tsx
<Tabs.Screen
  name="games"
  options={{
    title: "Games",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="game-controller-outline" size={size} color={color} />
    ),
  }}
/>
```

## Napomene za naš projekt

1. **`FlatList`** → uvijek koristiti za liste, ne `map` u ScrollView-u
2. **Optimistički update** → odmah dodaj u lokalni state bez refetcha
3. **Modal nije ruta** → lokalni UI element unutar ekrana
4. **`getDocs`** → jednokratno pri mount-u; za real-time koristiti `onSnapshot`
5. **`isLoggedIn`** provjera → iz `useAuth()` contexta
