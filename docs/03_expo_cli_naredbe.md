# 03 - Expo CLI - Pregled naredbi

> Izvor: https://docs.expo.dev/more/expo-cli/  
> Expo CLI je primarno sučelje između developera i Expo alata.

---

## Instalacija

Expo CLI je uključen u `expo` paket — ne treba posebna instalacija ako je `expo` u projektu.

```bash
# Pregled svih dostupnih naredbi
npx expo -h

# Help za specifičnu naredbu
npx expo login -h
```

---

## Razvoj (Development)

### Pokretanje dev servera

```bash
npx expo start
```

- Pokreće server na `http://localhost:8081`
- Prikazuje QR kod u terminalu
- Ako je instaliran `expo-dev-client` → otvara development build
- Inače → otvara **Expo Go**

### Korisni flagovi

| Flag | Opis |
|---|---|
| `--localhost` | Samo localhost, bez LAN-a |
| `--tunnel` | Javni URL putem ngrok-a (za problematične mreže) |
| `--offline` | Bez mrežnih zahtjeva |
| `--port <broj>` | Odabir porta (default: 8081) |
| `--dev-client` | Uvijek otvori u development buildu |
| `--go` | Uvijek otvori u Expo Go |

### Tunneling (kad Wi-Fi blokira konekciju)

```bash
npm i -g @expo/ngrok
npx expo start --tunnel
```

> Korisno na školskim/javnim mrežama gdje LAN ne radi.

---

## Kompajliranje native aplikacija

```bash
# iOS (samo na Macu, treba Xcode)
npx expo run:ios

# Android (treba Android Studio)
npx expo run:android
```

> Za nas je dovoljno **Expo Go** za razvoj — native build nije potreban za ovaj projekt.

---

## Instalacija paketa

```bash
# Uvijek koristiti expo install umjesto npm install za native pakete!
npx expo install ime-paketa

# Primjeri:
npx expo install expo-image-picker
npx expo install @react-native-async-storage/async-storage
```

> `npx expo install` automatski odabire verziju kompatibilnu s tvojom verzijom React Native-a.

---

## Prebuild (generiranje native foldera)

```bash
npx expo prebuild          # generira /android i /ios foldere
npx expo prebuild -p ios   # samo iOS
npx expo prebuild --clean  # čisti rebuild
```

> Kod Expo Managed Workflow-a (naš slučaj) ovo nije potrebno za razvoj.

---

## Export (produkcija)

```bash
npx expo export
```

- Bundlira JS i assete za produkciju
- Output ide u `/dist` mapu
- Automatski se poziva pri EAS buildu

---

## Ključni zaključci za projekt

1. **`npx expo start`** = jedina naredba koja nam treba za razvoj
2. **`npx expo install`** = uvijek koristiti za instalaciju paketa (ne `npm install`)
3. **Expo Go app** = testiranje na fizičkim uređajima (Android + iOS)
4. Tunneling (`--tunnel`) → ako smo na problematičnoj mreži (faks, javni Wi-Fi)
5. Native build (`run:ios`, `run:android`) → nije potreban za ovaj projekt
