# 17 - Supabase Storage: Upload Slike Igre

> Tema: Supabase Storage za slike + zamjena ručnog URL unosa u AddGameModal

---

## Instalacija

```bash
npm install @supabase/supabase-js expo-image-picker react-native-url-polyfill
```

---

## Struktura

```
supabase.ts                        # Supabase klijent
services/uploadGameImage.ts        # Upload servis
components/games/AddGameModal.tsx  # Ažuriran (bez URL inputa)
app/(tabs)/games.tsx               # Ažuriran (handlePickImage)
.env                               # Supabase kredencijali
```

---

## Supabase Console Setup

1. Kreiraj projekt na https://supabase.com/
2. **Project Settings → API** → kopiraj URL i anon key
3. **Storage** → kreiraj bucket `game-images` (public)
4. Postavi policy pravila:

```sql
create policy "Public read game images"
on storage.objects for select
using (bucket_id = 'game-images');

create policy "Allow image uploads"
on storage.objects for insert
with check (bucket_id = 'game-images');
```

---

## `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> ⚠️ Anon key ≠ service role key — nikad ne stavljati service role key u app!

---

## `supabase.ts`

```typescript
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## `services/uploadGameImage.ts`

```typescript
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/supabase";

const BUCKET_NAME = "game-images";

export async function pickAndUploadGameImage(): Promise<string | null> {
  // 1. Traži dozvolu
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Potrebna je dozvola za galeriju.");

  // 2. Otvori galeriju
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  const fileExt = asset.uri.split(".").pop() ?? "jpg";
  const filePath = `games/${Date.now()}.${fileExt}`;

  // 3. fetch → ArrayBuffer → upload
  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, arrayBuffer, {
      contentType: asset.mimeType ?? "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  // 4. Vrati public URL
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
}
```

---

## Ažurirani `AddGameModal` props

```tsx
// Maknuli: onChangeImageUrl, imageUrl TextInput
// Dodali:  onPickImage, uploadingImage

type AddGameModalProps = {
  visible: boolean;
  title: string; description: string; imageUrl: string; route: string;
  uploadingImage: boolean;           // ← NOVO
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeRoute: (v: string) => void;
  onPickImage: () => void;           // ← NOVO (zamjena za onChangeImageUrl)
  onClose: () => void;
  onSubmit: () => void;
};

// Umjesto TextInput za URL, prikazuje:
<Pressable onPress={onPickImage} disabled={uploadingImage}>
  <Text>{uploadingImage ? "Upload u tijeku..." : "Odaberi i upload-aj sliku"}</Text>
</Pressable>
{imageUrl
  ? <Text style={{ color: "#15803d" }}>Slika je odabrana i uploadana.</Text>
  : <Text style={{ color: "#6b7280" }}>Slika još nije odabrana.</Text>
}
```

---

## Ažurirani `games.tsx`

```tsx
import { pickAndUploadGameImage } from "@/services/uploadGameImage";

const [uploadingImage, setUploadingImage] = useState(false);

const handlePickImage = async () => {
  try {
    setUploadingImage(true);
    const publicUrl = await pickAndUploadGameImage();
    if (publicUrl) {
      setGameImageUrl(publicUrl);  // Spremi URL u state
      Alert.alert("Uspjeh", "Slika je uploadana.");
    }
  } catch (error: any) {
    Alert.alert("Greška", error.message ?? "Upload slike nije uspio.");
  } finally {
    setUploadingImage(false);
  }
};
```

---

## Što se sprema gdje

```
Supabase Storage:
  game-images/games/1234567890.jpg   ← Sama slika (binary)

Firestore games/{id}:
  imageUrl: "https://...supabase.co/storage/v1/object/public/game-images/games/...jpg"
  ↑ Samo URL, ne slika!
```

---

## Flow dodavanja igre

```
"Odaberi i upload-aj sliku"
        ↓
ImagePicker → galerija → odabir
        ↓
fetch(uri) → ArrayBuffer
        ↓
supabase.storage.upload(filePath, arrayBuffer)
        ↓
getPublicUrl(filePath) → publicUrl
        ↓
setGameImageUrl(publicUrl) (lokalni state)
        ↓
"Dodaj" → addDoc(firestore, "games", { ..., imageUrl: publicUrl })
```

---

## Napomene za naš projekt

1. **Zašto Supabase za slike?** → Firebase Storage je alternativa, ali Supabase je jednostavniji za setup
2. **Zašto URL u Firestore?** → Firestore nije za binarne datoteke — samo reference (URL-ovi)
3. **Upload servis** → odvojen od UI komponente (MVVM princip)
4. **Anon key** je javni ključ — prava zaštita je kroz Storage policy pravila
5. `react-native-url-polyfill/auto` → **mora biti prvi import** u `supabase.ts`
6. Validacija ostaje ista: `if (!imageUrl)` sprječava submit bez slike
