# 15 - Bodovanje i Leaderboard za Game One

> Tema: Score sustav u Firestore `users` kolekciji + Leaderboard top 10

---

## Struktura

```
services/ScoreService.ts          # updateUserScore + fetchLeaderboard
types/leaderboard.ts              # LeaderboardUser tip
components/game-one/Leaderboard.tsx
```

---

## Firestore model za bodovanje

Bodovi se čuvaju u **postojećem** `users/{uid}` dokumentu:

```
users/USER_UID
├── name:      "Ana"
├── age:       "22"
├── bio:       "..."
├── username:  "ana@example.com"   ← iz Firebase Auth email
├── score:     15                  ← bodovi
└── updatedAt: Timestamp
```

> Nema nove kolekcije — sve u `users/{uid}`!

---

## Security Rules - Ažurirane

```javascript
match /users/{userId} {
  allow read: if request.auth != null;          // ← Svi prijavljeni mogu čitati (leaderboard)
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false;
}
```

> Promjena: `read` sada dozvoljen svim prijavljenim korisnicima (potrebno za leaderboard)

---

## Važno: `{ merge: true }` u LoggedInView

```tsx
// PRIJE (može obrisati score):
await setDoc(doc(firestore, "users", user.uid), profile);

// NAKON (čuva score i ostala polja):
await setDoc(doc(firestore, "users", user.uid), profile, { merge: true });
```

---

## `types/leaderboard.ts`

```typescript
export type LeaderboardUser = {
  id: string;
  username: string;
  score: number;
};
```

---

## `services/ScoreService.ts`

```typescript
import { collection, doc, getDocs, increment, limit, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { firestore } from "@/firebase";
import type { LeaderboardUser } from "@/types/leaderboard";

const CORRECT_ANSWER_POINTS = 5;
const WRONG_ANSWER_POINTS = -7;

// Ažurira score u users/{uid}
export const updateUserScore = async (user: User, isCorrect: boolean) => {
  const points = isCorrect ? CORRECT_ANSWER_POINTS : WRONG_ANSWER_POINTS;
  await setDoc(
    doc(firestore, "users", user.uid),
    {
      username: user.email ?? "Anonimni korisnik",
      score: increment(points),      // ← Atomarno + ili - bez fetcha
      updatedAt: serverTimestamp(),
    },
    { merge: true }                  // ← Čuva ostala polja (name, bio...)
  );
  return points;
};

// Dohvaća top 10 korisnika sortirano po score
export const fetchLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const q = query(
    collection(firestore, "users"),
    orderBy("score", "desc"),
    limit(10)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      username: typeof data.username === "string" ? data.username : "Korisnik",
      score: typeof data.score === "number" ? data.score : 0,
    };
  });
};
```

---

## `components/game-one/Leaderboard.tsx`

```tsx
export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setLeaderboard)
      .finally(() => setLoading(false));
  }, []);

  return (
    <FlatList
      data={leaderboard}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.rank}>{index + 1}.</Text>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.score}>{item.score} bodova</Text>
        </View>
      )}
    />
  );
}
```

---

## Ažurirani `handleSubmit` u `game-one.tsx`

```tsx
const { user, isLoggedIn } = useAuth();
const [answerSubmitted, setAnswerSubmitted] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);

const handleSubmit = async () => {
  if (answerSubmitted) return;  // Sprječava višestruki submit

  if (!isLoggedIn || !user) {
    setMessage("Za spremanje bodova prvo se prijavite u Auth tabu.");
    return;
  }

  const userSum = parseInt(userInput, 10);
  if (Number.isNaN(userSum)) { setMessage("Unesite brojčani odgovor."); return; }

  const isCorrect = userSum === sum;
  const points = await updateUserScore(user, isCorrect);
  setAnswerSubmitted(true);
  setMessage(isCorrect
    ? `Točan odgovor! Osvojili ste ${points} bodova.`
    : `Netočan odgovor. Izgubili ste ${Math.abs(points)} bodova.`
  );
  setRefreshKey(prev => prev + 1);  // Forsiraj re-render Leaderboard-a
};

// U JSX-u:
<Leaderboard key={refreshKey} />  // key prop forsiraj re-mount = refresh
```

---

## Flow bodovanja

```
handleSubmit()
      ↓
parseInt(userInput) === sum?
  DA: isCorrect = true  →  +5 bodova
  NE: isCorrect = false →  -7 bodova
      ↓
updateUserScore(user, isCorrect)
  → increment(points) u Firestore
  → merge: true (čuva profil)
      ↓
setRefreshKey++ → Leaderboard re-fetch
```

---

## Napomene za naš projekt

1. **`increment(points)`** → atomarna operacija, nema race conditiona
2. **`{ merge: true }`** → obavezno kad pišemo parcijalne podatke u dokument
3. **`key={refreshKey}`** → React trik za forsirani re-mount komponente
4. **`answerSubmitted`** → sprječava višestruko bodovanje
5. Klijentsko bodovanje nije 100% sigurno — za produkciju → Cloud Functions
