import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.permissionText}>Aplikacija treba pristup tvojoj kameri za skeniranje QR koda.</Text>
        <Pressable style={styles.btnPrimary} onPress={requestPermission}>
          <Text style={styles.btnPrimaryText}>Dopusti pristup</Text>
        </Pressable>
        <Pressable style={styles.btnSecondary} onPress={() => router.back()}>
          <Text style={styles.btnSecondaryText}>Odustani</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    processQRCode(data);
  };

  const processQRCode = async (data: string) => {
    try {
      const payload = JSON.parse(data);
      if (payload.type === "share_split" && payload.splitId) {
        await fetchAndSaveSplit(payload.splitId);
      } else {
        Alert.alert("Nevažeći QR kod", "Ovaj kod nije prepoznat kao trening split.", [
          { text: "U redu", onPress: () => setScanned(false) }
        ]);
      }
    } catch (e) {
      Alert.alert("Greška", "QR kod ne sadrži ispravne podatke (nije JSON format).", [
        { text: "U redu", onPress: () => setScanned(false) }
      ]);
    }
  };

  const fetchAndSaveSplit = async (splitId: string) => {
    if (!user) return;
    try {
      const splitRef = doc(firestore, "splits", splitId);
      const splitSnap = await getDoc(splitRef);
      
      if (!splitSnap.exists()) {
        Alert.alert("Greška", "Ovaj split više ne postoji u bazi ili je obrisan.", [
          { text: "U redu", onPress: () => setScanned(false) }
        ]);
        return;
      }
      
      const splitData = splitSnap.data();
      
      // Sprječavanje da korisnik kopira vlastiti split
      if (splitData.userId === user.uid) {
        Alert.alert("Ovo je tvoj split", "Već posjeduješ ovaj split u svojoj listi.", [
          { text: "U redu", onPress: () => router.back() }
        ]);
        return;
      }
      
      // Kopiraj split u bazu ulogiranog korisnika
      await addDoc(collection(firestore, "splits"), {
        userId: user.uid,
        name: splitData.name, // Možemo dodati " (Kopirano)" po želji
        description: splitData.description || "",
        exerciseIds: splitData.exerciseIds || [],
        exerciseNames: splitData.exerciseNames || [],
        color: splitData.color || "#F97316",
        createdAt: serverTimestamp(),
      });
      
      Alert.alert("Uspjeh!", `Uspješno si preuzeo split:\n${splitData.name}`, [
        { text: "Odlično", onPress: () => router.back() }
      ]);
      
    } catch (e) {
      Alert.alert("Greška", "Dogodila se greška prilikom preuzimanja splita.", [
        { text: "Pokušaj ponovno", onPress: () => setScanned(false) }
      ]);
    }
  };



  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 10 : 40 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </Pressable>
        <Text style={styles.title}>Skeniraj QR Kod</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Kamera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Vizualni overlay kamere */}
        <View style={styles.overlay}>
          <View style={styles.overlayRow} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayCol} />
            <View style={styles.targetBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.overlayCol} />
          </View>
          <View style={styles.overlayRow} />
        </View>
      </View>

      {/* Footer kontrole */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
        <Text style={styles.footerText}>
          Usmjeri kameru prema QR kodu kojeg je pokazao tvoj trener kako bi preuzeo split.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F172A" },
  center: { justifyContent: "center", alignItems: "center", padding: 30 },
  permissionText: {
    fontSize: 16, color: "#94A3B8", textAlign: "center", marginBottom: 20, lineHeight: 24,
  },
  btnPrimary: {
    backgroundColor: "#F97316", paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14, width: "100%", alignItems: "center", marginBottom: 12,
  },
  btnPrimaryText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
  btnSecondary: {
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
    width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#334155",
  },
  btnSecondaryText: { color: "#F8FAFC", fontSize: 16, fontWeight: "600" },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#0F172A", zIndex: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: "#1E293B",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#F8FAFC" },

  cameraContainer: { flex: 1, position: "relative" },
  
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayRow: { flex: 1, backgroundColor: "#00000080" },
  overlayMiddle: { flexDirection: "row", height: 260 },
  overlayCol: { flex: 1, backgroundColor: "#00000080" },
  targetBox: { width: 260, height: 260, position: "relative" },
  
  corner: { position: "absolute", width: 40, height: 40, borderColor: "#F97316" },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },

  footer: {
    backgroundColor: "#0F172A", paddingHorizontal: 24, paddingTop: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, zIndex: 10,
  },
  footerText: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  galleryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: "#38BDF8", paddingVertical: 16, borderRadius: 16,
    shadowColor: "#38BDF8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  galleryText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
});
