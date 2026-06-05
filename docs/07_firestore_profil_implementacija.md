# 07 - Firestore Profil - Potpuna Implementacija

> Tema: Nadogradnja auth.tsx s Firestore kolekcijom `users` i korisničkim profilom

---

## Cilj

- Dodati Firestore u `firebaseConfig.ts`
- Kreirati `users` kolekciju u Firestore-u
- Nadograditi `auth.tsx` s učitavanjem i spremanjem profila
- Postaviti Security Rules

---

## 1. Ažuriranje `firebaseConfig.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // ← NOVO

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
export const firestore = getFirestore(app);  // ← NOVO
```

---

## 2. Firestore Console setup

1. Firebase Console → **Build → Firestore Database**
2. Klikni **Create database** → odaberi lokaciju
3. Klikni **Start collection** → Collection ID: `users`
4. Document ID = UID korisnika (iz Firebase Auth)
5. Dodaj polja: `name`, `age`, `bio` (string)

### Struktura kolekcije:
```
users/
└── USER_UID (= auth.currentUser.uid)
    ├── name: "Robert"
    ├── age:  "29"
    └── bio:  "Asistent"
```

> 💡 Ne moraš kreirati dokument ručno — `loadProfile` ga automatski kreira ako ne postoji.

---

## 3. Security Rules

Firebase Console → Firestore → **Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Blokiraj sve po defaultu
    match /{document=**} {
      allow read, write: if false;
    }

    // Korisnik može pristupiti samo svom dokumentu
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 4. Potpuni `app/(tabs)/auth.tsx`

```typescript
import { useState } from "react";
import {
  View, Text, TextInput, Pressable,
  StyleSheet, Alert, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../firebaseConfig";

// TypeScript tip za profil
type Profile = {
  name: string;
  age: string;
  bio: string;
};

// Helper za greške Firestore-a
const getFirestoreProfileErrorMessage = (
  error: { code?: string; message?: string },
  operation: "load" | "save"
) => {
  if (error.code === "permission-denied") {
    return `Cannot ${operation} profile because Firestore denied access. Update your Firebase rules.`;
  }
  return error.message ?? `Failed to ${operation} profile.`;
};

export default function AuthScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const emptyProfile: Profile = { name: "", age: "", bio: "" };
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  // Učitaj ili kreiraj profil u Firestore-u
  const loadProfile = async (userId: string): Promise<Profile> => {
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Profile;  // Profil postoji → vrati ga
    }

    // Profil ne postoji → kreiraj prazan
    await setDoc(doc(firestore, "users", userId), emptyProfile);
    return emptyProfile;
  };

  // Prijava + učitavanje profila
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setErrorMsg("");
      setLoggedIn(true);

      try {
        const loadedProfile = await loadProfile(userCredential.user.uid);
        setProfile(loadedProfile);
      } catch (error: any) {
        setProfile(emptyProfile);
        setErrorMsg(getFirestoreProfileErrorMessage(error, "load"));
      }
    } catch (error: any) {
      setLoggedIn(false);
      setErrorMsg(error.message ?? "Failed to sign in.");
    }
  };

  // Spremi profil u Firestore
  const handleSaveProfile = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      await setDoc(doc(firestore, "users", userId), profile);
      setErrorMsg("");
      Alert.alert("Uspjeh", "Podaci su spremljeni u Firestore.");
    } catch (error: any) {
      const message = getFirestoreProfileErrorMessage(error, "save");
      setErrorMsg(message);
      Alert.alert("Greška", message);
    }
  };

  // Odjava + reset stanja
  const handleLogout = async () => {
    await signOut(auth);
    setLoggedIn(false);
    setErrorMsg("");
    setProfile(emptyProfile);
  };

  // --- UI: Profil ekran (prijavljen) ---
  if (loggedIn) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Ionicons name="person-circle-outline" size={72} color="#1f6feb" />
          <Text style={styles.title}>Moj profil</Text>

          <TextInput
            placeholder="Ime"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Dob"
            value={profile.age}
            onChangeText={(text) => setProfile({ ...profile, age: text })}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="O meni"
            value={profile.bio}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
            multiline
            style={[styles.input, styles.textArea]}
          />

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleSaveProfile}>
            <Text style={styles.primaryButtonText}>Spremi profil</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleLogout}>
            <Text style={styles.secondaryButtonText}>Odjavi se</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // --- UI: Login forma (nije prijavljen) ---
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={72} color="#1f6feb" />
        <Text style={styles.title}>Prijava</Text>

        <TextInput
          placeholder="Unesite email adresu"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Unesite lozinku"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Prijava</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#eef3f8",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#eef3f8",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 18,
    color: "#111827",
  },
  input: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d7de",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  error: {
    width: "100%",
    color: "#b42318",
    marginBottom: 12,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#1f6feb",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { color: "#ffffff", fontWeight: "700" },
  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: { color: "#111827", fontWeight: "600" },
});
```

---

## 5. Objašnjenje ključnih funkcija

### `loadProfile(userId)`
```
doc(firestore, "users", userId)  →  otvori users/USER_UID
        ↓
docSnap.exists()?
  DA  → vrati podatke profila
  NE  → setDoc(prazan profil) → vrati emptyProfile
```

### `handleLogin()`
```
signInWithEmailAndPassword(...)
        ↓
setLoggedIn(true)
        ↓
loadProfile(userCredential.user.uid)
        ↓
setProfile(loadedProfile)
```

### `handleSaveProfile()`
```
auth.currentUser?.uid  →  dohvati userId
        ↓
setDoc(doc(firestore, "users", userId), profile)
        ↓
Alert.alert("Uspjeh") ili setErrorMsg(greška)
```

### `handleLogout()`
```
signOut(auth) → setLoggedIn(false) → setProfile(emptyProfile) → setErrorMsg("")
```

---

## 6. Testiranje

1. Pokreni app → prijavi se
2. `loadProfile` automatski kreira prazan `users` dokument ako ne postoji
3. Unesi ime, dob, bio → klikni **Spremi profil**
4. Provjeri u Firebase Console jesu li podaci zapisani
5. Odjavi se → prijavi se ponovo → podaci se moraju učitati

---

## Napomene za naš projekt

- **`{ ...profile, name: text }`** → spread operator za ažuriranje jednog polja bez brisanja ostalih
- **`auth.currentUser?.uid`** → optional chaining jer currentUser može biti null
- `ScrollView` s `contentContainerStyle` → omogućava scroll kad je tipkovnica otvorena
- Isti pattern koristimo za korisnički profil u našoj gym aplikaciji (ime, težina, visina...)
- `permission-denied` error → znači da Security Rules nisu ispravno postavljene
