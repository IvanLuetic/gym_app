# 06 - Firebase Firestore i NoSQL

> Tema: Firebase NoSQL Firestore baza podataka u React Native aplikacijama

---

## Firebase komponente

| Komponenta | Namjena |
|---|---|
| **Firestore** | Fleksibilna NoSQL baza podataka (koristimo u projektu) |
| **Realtime Database** | Oblačna baza, stariji pristup |
| **Firebase Hosting** | Hosting web aplikacija |
| **Cloud Messaging** | Push notifikacije |
| **Analytics** | Analitika ponašanja korisnika |

---

## NoSQL vs Relacijske baze

| | **Relacijske (SQL)** | **NoSQL (Firestore)** |
|---|---|---|
| Struktura | Tablice, fiksne sheme | Dokumenti, fleksibilno |
| Upiti | Složeni JOIN upiti | Jednostavni upiti, bez JOIN-a |
| Skalabilnost | Vertikalna | Horizontalna |
| Primjena | Financije, legacy | Mobilne app, IoT, real-time |

### Vrste NoSQL baza
- **Dokumentne** → Firestore ✅ (koristimo)
- **Ključ-vrijednost** → Redis
- **Graf** → Neo4j
- **Kolonske** → Cassandra

---

## Firestore struktura podataka

```
Firestore
└── Kolekcija: "korisnici"
    └── Dokument: "userId_123"
        ├── ime: "Ivan"
        ├── prezime: "Horvat"
        ├── email: "ivan@example.com"
        └── Podkolekcija: "narudzbe"
            └── Dokument: "order_001"
                ├── proizvod: "Tenisice"
                └── cijena: 120
```

### Ključni koncepti:
- **Kolekcija** = tablica (ali bez fiksne sheme)
- **Dokument** = redak/zapis (JSON objekt)
- **Polje** = ključ-vrijednost par
- **Podkolekcija** = ugniježđena kolekcija unutar dokumenta

---

## Instalacija i postavljanje

```bash
# Instalacija Firebase SDK (Expo managed workflow)
npx expo install firebase

# NIJE @react-native-firebase/app — to je za bare workflow!
```

### `firebaseConfig.ts`
```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
export const db = getFirestore(app);  // ← Firestore instanca
```

---

## CRUD operacije

### Create — Dodavanje dokumenta

```typescript
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Auto-generiran ID
await addDoc(collection(db, "korisnici"), {
  ime: "Ivan",
  prezime: "Horvat",
  email: "ivan@example.com",
});

// Vlastiti ID (npr. userId od Firebase Auth)
await setDoc(doc(db, "korisnici", userId), {
  ime: "Ivan",
  email: "ivan@example.com",
});
```

### Read — Dohvaćanje podataka

```typescript
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// Svi dokumenti iz kolekcije
const querySnapshot = await getDocs(collection(db, "korisnici"));
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});

// Jedan dokument po ID-u
const docRef = doc(db, "korisnici", userId);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  console.log(docSnap.data());
}
```

### Update — Ažuriranje dokumenta

```typescript
import { doc, updateDoc } from "firebase/firestore";

await updateDoc(doc(db, "korisnici", userId), {
  ime: "Novo Ime",
});
```

### Delete — Brisanje dokumenta

```typescript
import { doc, deleteDoc } from "firebase/firestore";

await deleteDoc(doc(db, "korisnici", userId));
```

### Real-time listener (live sinkronizacija)

```typescript
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

const [korisnici, setKorisnici] = useState([]);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "korisnici"), (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setKorisnici(data);
  });

  return unsubscribe; // cleanup
}, []);
```

---

## Firestore Security Rules

U Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Korisnik može čitati/pisati samo svoje podatke
    match /korisnici/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

> ⚠️ Nikad ne ostavljati `allow read, write: if true;` u produkciji!

---

## Offline podrška

Firestore automatski podržava rad bez interneta:
- Čita i piše podatke lokalno
- Sinkronizira promjene kada se internet vrati
- Nema potrebe za dodatnom konfiguracijom u Expo projektu

---

## Ključne napomene za naš projekt

1. Koristimo **`firebase`** paket (ne `@react-native-firebase`) — Expo managed workflow
2. **`db`** se exporta iz `firebaseConfig.ts` i uvozi gdje treba
3. Za korisničke podatke (profil, itd.) → `doc(db, "users", auth.currentUser.uid)`
4. **`onSnapshot`** za real-time prikaz podataka (treninzi, vježbe...)
5. **`getDocs`** za jednokratno dohvaćanje (npr. pri učitavanju ekrana)
6. Security rules → samo prijavljeni korisnik smije čitati/pisati svoje podatke
