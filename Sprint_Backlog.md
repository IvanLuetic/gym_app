# Sprint Backlog - GymTracker 

---

## 1. Sprint
**Cilj 1. Sprinta:** Postavljanje projekta, integracija Firebase baze (Auth) te izrada korisničkog sučelja za autentifikaciju.

| Naziv Zadatka | Opis | Odgovorni član | Rok |
| :--- | :--- | :--- | :--- |
| **1. Inicijalizacija projekta** | Kreiranje novog React Native (Expo) projekta i instalacija osnovnih paketa. | Kristijan | Završeno |
| **2. Firebase konfiguracija** | Kreiranje Firebase projekta, omogućavanje Email/Password autentifikacije. | Kristijan | Završeno |
| **3. Ekran za registraciju (UI)** | Izrada osnovnog sučelja za registraciju korisnika. | Kristijan | Završeno |
| **4. Ekran za prijavu (UI)** | Izrada osnovnog sučelja za prijavu. | Kristijan | Završeno |
| **5. Logika autentifikacije** | Implementacija metoda za registraciju i prijavu korisnika. | Kristijan | Završeno |
| **6. Upravljanje stanjem korisnika** | Usmjeravanje (routing) na početni ekran ili ekran za prijavu ovisno o stanju. | Kristijan | Završeno |
| **7. Osnovni početni ekran (UI)** | Izrada jednostavnog početnog ekrana s opcijom "Odjava". | Kristijan | Završeno |
| **8. Refaktoriranje autentifikacije** | Uvođenje `AuthContext` komponente radi boljeg upravljanja prijavom. | Kristijan | Završeno |

---

## 2. Sprint
**Cilj 2. Sprinta:** Pohrana podataka, pregled i manipulacija podacima u bazi te testiranje komunikacije s bazom (Firestore).

| Naziv Zadatka | Opis | Odgovorni član | Rok |
| :--- | :--- | :--- | :--- |
| **1. Prikaz treninga** | Izrada komponente i dohvaćanje podataka treninga iz Firestore baze. | Kristijan | Završeno |
| **2. Unos novih treninga** | Forma za dodavanje novih treninga i pohranu unosa direktno u Firestore. | Kristijan | Završeno |
| **3. Biblioteka vježbi** | Prikaz, pregled i kreiranje novih vježbi u bazi. | Kristijan | Završeno |
| **4. Trening Splitovi** | Manipulacija i izrada custom splitova te spremanje u bazu. | Kristijan | Završeno |
| **5. Aktivna Trening Sesija** | Spremanje i ažuriranje podataka serija u realnom vremenu u bazi. | Kristijan | Završeno |
| **6. Napredna Statistika** | Pregled i analitika podataka dohvaćenih iz baze. | Ivan Luetić | Završeno |
| **7. Kalendar treninga** | Dohvaćanje i kalendarski pregled odrađenih treninga iz baze. | Ivan Luetić | Završeno |
| **8. Korisnički profil i postavke** | Unos korisničkih podataka i izračun makronutrijenata, uz lokalno spremanje. | Kristijan | Završeno |

---

## 3. Sprint
**Cilj 3. Sprinta:** Upload datoteka, pregled i organizacija datoteka te optimizacija spremanja u oblaku.

| Naziv Zadatka | Opis | Odgovorni član | Rok |
| :--- | :--- | :--- | :--- |
| **1. Konfiguracija Storage-a** | Postavljanje Supabase Storage okruženja za pohranu datoteka u oblaku. | Ivan Luetić | U tijeku |
| **2. Upload profilne slike** | Implementacija *image pickera* i funkcionalnosti za upload datoteka na Supabase. | Ivan Luetić | U tijeku |
| **3. Prikaz datoteka** | Dohvaćanje i pregled slika/datoteka iz oblaka unutar aplikacije. | Ivan Luetić | Nije započeto |
| **4. Organizacija datoteka** | Optimizacija i strukturiranje datoteka u oblaku prema korisnicima. | Ivan Luetić | Nije započeto |

---

## 4. Sprint
**Cilj 4. Sprinta:** Integracija senzora, prikaz podataka senzora i značajke temeljene na podacima senzora.

| Naziv Zadatka | Opis | Odgovorni član | Rok |
| :--- | :--- | :--- | :--- |
| **1. Integracija senzora** | Postavljanje i konfiguracija paketa za pedometar i praćenje koraka. | Ivan Luetić | Završeno |
| **2. Ekran za praćenje koraka** | Prikaz značajki temeljenih na senzoru (trenutni koraci i kalorije). | Ivan Luetić | Završeno |
| **3. Vizualizacija podataka senzora** | Prikaz povijesti podataka sa senzora (zadnjih 7 dana) na grafikonu. | Ivan Luetić | Završeno |
| **4. Dijeljenje treninga (QR kod)** | Prijenos splitova između korisnika putem generiranja i skeniranja QR koda. | Kristijan | Završeno |
| **5. QA Testiranje** | Detaljno testiranje senzora, uploadanja i komunikacije s bazom na uređajima. | Frano Vranjković | U tijeku |
