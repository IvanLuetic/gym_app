# 09 - Refaktoriranje u Komponente + .env Konfiguracija

> Tema: Izdvajanje auth.tsx u UI komponente + sigurna Firebase konfiguracija

---

## Cilj

Refaktorirati `auth.tsx` bez promjene funkcionalnosti:
- **Container** komponenta (`auth.tsx`) → samo logika i state
- **Presentational** komponente → samo UI, primaju props

---

## Nova struktura projekta

```
app/
└── (tabs)/
    └── auth.tsx                  # Container - logika, state, Firebase

components/
├── auth/
│   ├── LoggedInView.tsx          # Profil ekran (prijavljen)
│   └── LoggedOutView.tsx         # Login forma (nije prijavljen)
└── ui/
    ├── AuthInput.tsx             # Generički input
    ├── AuthButton.tsx            # Generički gumb (primary/secondary)
    └── ErrorMessage.tsx          # Prikaz greške

firebaseConfig.ts
.env                              # Firebase credentials (gitignore!)
```

---

## Sloj odgovornosti

| Komponenta | Tip | Što radi |
|---|---|---|
| `auth.tsx` | **Container** | state, Firebase pozivi, handleri |
| `LoggedInView` | **Screen** | Profil forma, prima handlere kao props |
| `LoggedOutView` | **Screen** | Login forma, prima handlere kao props |
| `AuthInput` | **UI** | Jedan TextInput s defaultnim stilom |
| `AuthButton` | **UI** | Gumb, primary ili secondary varijanta |
| `ErrorMessage` | **UI** | Prikazuje grešku ili `null` |

---

## UI Komponente

### `components/ui/AuthInput.tsx`

```tsx
import { StyleSheet, TextInput, TextInputProps } from "react-native";

type AuthInputProps = TextInputProps;

export default function AuthInput(props: AuthInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={props.placeholderTextColor ?? "#6B7280"}
      style={[
        styles.input,
        props.multiline && styles.textArea,
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
```

### `components/ui/AuthButton.tsx`

```tsx
import { Pressable, StyleSheet, Text } from "react-native";

type AuthButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export default function AuthButton({ title, onPress, variant = "primary" }: AuthButtonProps) {
  return (
    <Pressable
      style={[styles.button, variant === "primary" ? styles.primaryButton : styles.secondaryButton]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryButtonText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButton: { backgroundColor: "#2563EB" },
  secondaryButton: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#CBD5E1" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  secondaryButtonText: { color: "#111827" },
});
```

### `components/ui/ErrorMessage.tsx`

```tsx
import { StyleSheet, Text } from "react-native";

type ErrorMessageProps = { message: string };

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;  // Ništa ne prikazuje ako nema greške

  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    width: "100%",
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "left",
  },
});
```

---

## Screen Komponente

### `components/auth/LoggedOutView.tsx`

```tsx
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthButton from "@/components/ui/AuthButton";
import AuthInput from "@/components/ui/AuthInput";
import ErrorMessage from "@/components/ui/ErrorMessage";

type LoggedOutViewProps = {
  email: string;
  password: string;
  errorMessage: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onLogin: () => void;
};

export default function LoggedOutView({
  email, password, errorMessage, setEmail, setPassword, onLogin,
}: LoggedOutViewProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={72} color="#2563EB" />
        <Text style={styles.title}>Prijava</Text>

        <AuthInput
          placeholder="Unesite email adresu"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AuthInput
          placeholder="Unesite lozinku"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <ErrorMessage message={errorMessage} />
        <AuthButton title="Prijava" onPress={onLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", padding: 20,
  },
  card: {
    width: "100%", maxWidth: 380, backgroundColor: "#FFFFFF",
    borderRadius: 18, padding: 24, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#111827", marginTop: 10, marginBottom: 18 },
});
```

### `components/auth/LoggedInView.tsx`

```tsx
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AuthButton from "@/components/ui/AuthButton";
import AuthInput from "@/components/ui/AuthInput";
import ErrorMessage from "@/components/ui/ErrorMessage";

type Profile = { name: string; age: string; bio: string };

type LoggedInViewProps = {
  profile: Profile;
  errorMessage: string;
  onChangeName: (value: string) => void;
  onChangeAge: (value: string) => void;
  onChangeBio: (value: string) => void;
  onSaveProfile: () => void;
  onLogout: () => void;
};

export default function LoggedInView({
  profile, errorMessage, onChangeName, onChangeAge,
  onChangeBio, onSaveProfile, onLogout,
}: LoggedInViewProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={72} color="#2563EB" />
        <Text style={styles.title}>Moj profil</Text>

        <AuthInput placeholder="Ime" value={profile.name} onChangeText={onChangeName} />
        <AuthInput placeholder="Dob" value={profile.age} onChangeText={onChangeAge} keyboardType="numeric" />
        <AuthInput placeholder="O meni" value={profile.bio} onChangeText={onChangeBio} multiline />

        <ErrorMessage message={errorMessage} />
        <AuthButton title="Spremi profil" onPress={onSaveProfile} />
        <AuthButton title="Odjavi se" onPress={onLogout} variant="secondary" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: "center", alignItems: "center",
    padding: 20, backgroundColor: "#EEF3F8",
  },
  card: {
    width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF",
    borderRadius: 18, padding: 22, alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginTop: 8, marginBottom: 18 },
});
```

---

## Container: `app/(tabs)/auth.tsx`

```tsx
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import LoggedInView from "@/components/auth/LoggedInView";
import LoggedOutView from "@/components/auth/LoggedOutView";
import { auth, firestore } from "@/firebaseConfig";

type Profile = { name: string; age: string; bio: string };

const getFirestoreProfileErrorMessage = (
  error: { code?: string; message?: string },
  operation: "load" | "save"
) => {
  if (error.code === "permission-denied")
    return `Cannot ${operation} profile because Firestore denied access.`;
  return error.message ?? `Failed to ${operation} profile.`;
};

export default function AuthScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const emptyProfile: Profile = { name: "", age: "", bio: "" };
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  const loadProfile = async (userId: string) => {
    const docRef = doc(firestore, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data() as Profile;
    await setDoc(doc(firestore, "users", userId), emptyProfile);
    return emptyProfile;
  };

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

  const handleSaveProfile = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      await setDoc(doc(firestore, "users", userId), profile);
      setErrorMsg("");
      alert("Podaci su spremljeni u Firestore.");
    } catch (error: any) {
      setErrorMsg(getFirestoreProfileErrorMessage(error, "save"));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setLoggedIn(false);
    setErrorMsg("");
    setProfile(emptyProfile);
  };

  if (loggedIn) {
    return (
      <LoggedInView
        profile={profile}
        errorMessage={errorMsg}
        onChangeName={(value) => setProfile({ ...profile, name: value })}
        onChangeAge={(value) => setProfile({ ...profile, age: value })}
        onChangeBio={(value) => setProfile({ ...profile, bio: value })}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <LoggedOutView
      email={email}
      password={password}
      errorMessage={errorMsg}
      setEmail={setEmail}
      setPassword={setPassword}
      onLogin={handleLogin}
    />
  );
}
```

---

## Firebase `.env` konfiguracija

### `.env` (root direktorij projekta)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

> ⚠️ Dodati `.env` u `.gitignore`!

### `firebaseConfig.ts` s `.env` varijablama

```typescript
import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseOptions: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicijaliziraj samo jednom (sprječava višestruku inicijalizaciju)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
```

> `EXPO_PUBLIC_` prefix → Expo automatski umeće varijable u bundle  
> Prava zaštita podataka = **Firebase Auth + Security Rules**, ne env varijable

---

## Napomene za naš projekt

1. **Ista struktura** — `components/auth/` i `components/ui/` koristimo za GymTracker
2. **`AuthInput`, `AuthButton`, `ErrorMessage`** → reusable na svim ekranima (login, registracija, profil...)
3. **`getApps().length > 0 ? getApp() : initializeApp()`** → sprječava crash kod hot reload-a
4. Novi ekrani (registracija, reset lozinke) → novi `View` komponente, iste UI komponente
5. **`.env`** → obavezno za projekt, ne commitati Firebase podatke
