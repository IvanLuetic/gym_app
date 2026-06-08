# Sprint Backlog - GymTracker 

**Cilj 1. Sprinta:** Postavljanje projekta, integracija Firebase baze (Auth i Firestore) te izrada korisničkog sučelja za autentifikaciju i upravljanje treninzima.

| Naziv Zadatka | Opis | Odgovorni član | Rok |
| :--- | :--- | :--- | :--- |
| **1. Inicijalizacija projekta** | Kreiranje novog React Native (Expo) projekta, postavljanje strukture mapa i instalacija osnovnih paketa (Expo Router). | dogovoreni članovi | Petak |
| **2. Firebase konfiguracija** | Kreiranje novog Firebase projekta, omogućavanje Email/Password autentifikacije i dodavanje `firebaseConfig.ts` u projekt. | dogovoreni članovi | Petak |
| **3. Ekran za registraciju (UI)** | Izrada osnovnog sučelja za registraciju korisnika (polja za email, lozinku, potvrdu lozinke i gumb "Registriraj se"). | dogovoreni članovi | Petak |
| **4. Ekran za prijavu (UI)** | Izrada osnovnog sučelja za prijavu (polja za email i lozinku te gumb "Prijavi se"). | dogovoreni članovi | Petak |
| **5. Logika autentifikacije** | Implementacija `createUserWithEmailAndPassword` i `signInWithEmailAndPassword` metoda na izgrađenim ekranima. | dogovoreni članovi | Petak |
| **6. Upravljanje stanjem korisnika** | Dodavanje listenera (`onAuthStateChanged`) za provjeru je li korisnik prijavljen i usmjeravanje (routing) na početni ekran ili ekran za prijavu. | dogovoreni članovi | Petak |
| **7. Osnovni početni ekran (UI)** | Izrada jednostavnog početnog ekrana (Dashboard) s opcijom "Odjava" (Sign out) kako bi se zaokružio cijeli *flow* prijave i odjave. | dogovoreni članovi | Petak |
| **8. Refaktoriranje autentifikacije** | Uvođenje `AuthContext` komponente radi čišćeg koda i boljeg globalnog upravljanja prijavom. | dogovoreni članovi | Petak |
| **9. Prikaz treninga (Firestore)** | Izrada `WorkoutCard` komponente i integracija s Firestore bazom za dohvaćanje i prikaz liste treninga na glavnom ekranu. | dogovoreni članovi | Petak |
| **10. Unos novih treninga** | Implementacija `AddWorkoutModal` forme za dodavanje novih treninga i pohranu unosa direktno u Firestore. | dogovoreni članovi | Petak |
