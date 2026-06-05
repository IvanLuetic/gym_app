# 01 - Uvod u Programiranje Mobilnih Aplikacija

**Kolegij:** Programiranje aplikacija za mobilne uređaje  
**Predavač:** doc. dr. sc. Daniel Vasić

---

## Vrednovanje

| Komponenta | Udio |
|---|---|
| Projekt | 70% |
| Dolazak na nastavu | 15% |
| Aktivnost na satu | 15% |

> **Napomena:** Bodovi s nastave ne mogu se nadoknaditi na integralnom ispitu.

---

## Što je React Native?

- Okruženje za razvoj mobilnih aplikacija pomoću **JavaScript-a i React-a**
- Jedna baza koda → radi na **Android i iOS**
- Iste React principe kao za web
- Podržava **hot-reloading** (brzi razvoj)
- Integracija s native komponentama

---

## Vrste mobilnih aplikacija

| Tip | Opis |
|---|---|
| **Nativne** | Razvijene posebno za Android (Kotlin/Java) ili iOS (Swift) |
| **Hibridne** | Jedna baza koda za obje platforme (React Native, Flutter) |
| **Web aplikacije** | Pokretanje u mobilnom browseru |

> Kolegij koristi **hibridni pristup** → React Native (Expo)

---

## Alati i ekosustav

### IDE-ovi i editori
- **Android Studio** – IDE za Android
- **Xcode** – IDE za iOS
- **Visual Studio Code** – preporučeni editor za React Native

### React Native alati
- **Node.js** – izvršavanje JavaScript-a
- **React Native CLI** – osnovni CLI alat
- **Metro Bundler** – bundling i live-reload
- **Fast Refresh** – brze promjene bez gubitka stanja
- **Expo CLI** – alat za razvoj i testiranje (koristi se na kolegiju)

---

## Expo Framework

### Što je Expo?
Expo je idealan za brze prototipe i timove koji žele efikasno razvijati cross-platformske aplikacije.

### Prednosti Expo-a vs React Native CLI

| | **Expo** | **React Native CLI** |
|---|---|---|
| Postavljanje | Jednostavno | Kompleksno |
| Nativni moduli | Nisu potrebni za start | Potrebna konfiguracija |
| Android Studio / Xcode | Nije obavezno | Obavezno |
| Fleksibilnost | Manja | Veća |

---

## Upravljanje projektom

- **npm / yarn** – upravljanje paketima
- **.babelrc / metro.config.js** – konfiguracija
- **.env datoteke** – varijable okruženja (API ključevi itd.)

---

## Alati za debugiranje

| Alat | Namjena |
|---|---|
| **React DevTools** | Vizualni pregled React komponenti |
| **Flipper** | Debugiranje React Native aplikacija |
| **Redux DevTools** | Praćenje stanja u Redux aplikacijama |

---

## Ključne napomene za projekt

- Koristimo **Expo** (ne React Native CLI)
- Editor: **Visual Studio Code**
- Projekt čini **70% ocjene** → treba biti kvalitetan
- Razvijamo za **Android i iOS** istovremeno
