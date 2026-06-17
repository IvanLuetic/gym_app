import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Image, Modal, TextInput, ScrollView, Alert, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "Male",
    goal: "Maintain",
    activity: "Moderate",
  });
  const [macros, setMacros] = useState<{ calories: number; protein: number } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Settings za obavijesti
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    reminders: true,
    motivation: false,
  });

  const displayName = user?.email?.split("@")[0] ?? "Sportaš";

  useEffect(() => {
    // Učitavanje lokalno spremljene slike
    const loadAvatar = async () => {
      try {
        const storedUri = await AsyncStorage.getItem(`avatar_${user?.uid}`);
        if (storedUri) {
          setAvatarUri(storedUri);
        }
        
        const storedData = await AsyncStorage.getItem(`userData_${user?.uid}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setUserData(parsed);
          setMacros(calculateMacros(parsed));
        }

        const storedNotifs = await AsyncStorage.getItem(`notifs_${user?.uid}`);
        if (storedNotifs) {
          setNotifSettings(JSON.parse(storedNotifs));
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };
    if (user?.uid) {
      loadAvatar();
    }
  }, [user?.uid]);

  const calculateMacros = (data: any) => {
    const w = parseFloat(data.weight);
    const h = parseFloat(data.height);
    const a = parseInt(data.age);
    if (!w || !h || !a) return null;

    let bmr = 10 * w + 6.25 * h - 5 * a;
    bmr += data.gender === "Male" ? 5 : -161;

    let tdee = bmr;
    if (data.activity === "Low") tdee *= 1.2;
    else if (data.activity === "Moderate") tdee *= 1.55;
    else if (data.activity === "High") tdee *= 1.725;
    else tdee *= 1.55; // Default osiguranje

    if (data.goal === "Lose") tdee -= 500;
    if (data.goal === "Build") tdee += 300;

    const protein = Math.round(w * 2.2); // cca 2.2g po kg
    const calories = Math.round(tdee);

    return { calories, protein };
  };

  const saveUserData = async () => {
    if (!userData.age || !userData.height || !userData.weight) {
      Alert.alert("Greška", "Molimo unesite sve podatke (dob, visinu, težinu).");
      return;
    }
    try {
      if (user?.uid) {
        await AsyncStorage.setItem(`userData_${user.uid}`, JSON.stringify(userData));
        setMacros(calculateMacros(userData));
        
        // Skrolaj do rezultata
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleNotif = async (key: "reminders" | "motivation") => {
    const newVal = !notifSettings[key];
    const newSettings = { ...notifSettings, [key]: newVal };
    setNotifSettings(newSettings);
    if (user?.uid) {
      await AsyncStorage.setItem(`notifs_${user.uid}`, JSON.stringify(newSettings));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        
        // Lokalno spremanje za sada
        if (user?.uid) {
          await AsyncStorage.setItem(`avatar_${user.uid}`, uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top > 0 ? insets.top + 20 : 40 }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moj Profil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Pressable onPress={pickImage} style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={40} color="#94A3B8" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera-outline" size={14} color="#FFF" />
            </View>
          </Pressable>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Postavke</Text>
          
          <Pressable style={styles.settingRow} onPress={() => setNotifModalVisible(true)}>
            <View style={styles.settingIcon}>
              <Ionicons name="notifications-outline" size={20} color="#F8FAFC" />
            </View>
            <Text style={styles.settingText}>Obavijesti</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </Pressable>
          
          <Pressable style={styles.settingRow} onPress={() => setModalVisible(true)}>
            <View style={[styles.settingIcon, { backgroundColor: "#8B5CF620" }]}>
              <Ionicons name="body-outline" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.settingText}>Podaci korisnika i analiza</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </Pressable>

          <Pressable style={styles.settingRow} onPress={logout}>
            <View style={[styles.settingIcon, { backgroundColor: "#EF444420" }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.settingText, { color: "#EF4444" }]}>Odjava</Text>
          </Pressable>
        </View>
      </View>

      {/* User Data Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tvoji Podaci</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </Pressable>
              </View>

              <Text style={styles.label}>Dob (godine)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userData.age}
                onChangeText={(text) => setUserData({ ...userData, age: text })}
                placeholder="Npr. 25"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Visina (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userData.height}
                onChangeText={(text) => setUserData({ ...userData, height: text })}
                placeholder="Npr. 180"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Težina (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userData.weight}
                onChangeText={(text) => setUserData({ ...userData, weight: text })}
                placeholder="Npr. 80"
                placeholderTextColor="#64748B"
              />

              <Text style={styles.label}>Spol</Text>
              <View style={styles.rowChoices}>
                <Pressable
                  style={[styles.choiceBtn, userData.gender === "Male" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, gender: "Male" })}
                >
                  <Text style={[styles.choiceText, userData.gender === "Male" && styles.choiceTextActive]}>Muško</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceBtn, userData.gender === "Female" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, gender: "Female" })}
                >
                  <Text style={[styles.choiceText, userData.gender === "Female" && styles.choiceTextActive]}>Žensko</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Fizička aktivnost</Text>
              <View style={styles.rowChoices}>
                <Pressable
                  style={[styles.choiceBtn, userData.activity === "Low" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, activity: "Low" })}
                >
                  <Text style={[styles.choiceText, userData.activity === "Low" && styles.choiceTextActive]}>Slabo</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceBtn, userData.activity === "Moderate" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, activity: "Moderate" })}
                >
                  <Text style={[styles.choiceText, userData.activity === "Moderate" && styles.choiceTextActive]}>Umjereno</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceBtn, userData.activity === "High" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, activity: "High" })}
                >
                  <Text style={[styles.choiceText, userData.activity === "High" && styles.choiceTextActive]}>Jako</Text>
                </Pressable>
              </View>

              <Text style={styles.label}>Cilj</Text>
              <View style={styles.rowChoices}>
                <Pressable
                  style={[styles.choiceBtn, userData.goal === "Lose" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, goal: "Lose" })}
                >
                  <Text style={[styles.choiceText, userData.goal === "Lose" && styles.choiceTextActive]}>Mršavljenje</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceBtn, userData.goal === "Maintain" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, goal: "Maintain" })}
                >
                  <Text style={[styles.choiceText, userData.goal === "Maintain" && styles.choiceTextActive]}>Održavanje</Text>
                </Pressable>
                <Pressable
                  style={[styles.choiceBtn, userData.goal === "Build" && styles.choiceActive]}
                  onPress={() => setUserData({ ...userData, goal: "Build" })}
                >
                  <Text style={[styles.choiceText, userData.goal === "Build" && styles.choiceTextActive]}>Mišićna masa</Text>
                </Pressable>
              </View>

              <Pressable style={styles.saveBtn} onPress={saveUserData}>
                <Text style={styles.saveBtnText}>Izračunaj i Spremi</Text>
              </Pressable>

              {macros && (
                <View style={styles.macrosBox}>
                  <Text style={styles.macrosTitle}>Tvoj dnevni cilj (procjena)</Text>
                  <View style={styles.macroRow}>
                    <Ionicons name="flame-outline" size={24} color="#F97316" />
                    <Text style={styles.macroValue}>{macros.calories} kcal</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Ionicons name="nutrition-outline" size={24} color="#38BDF8" />
                    <Text style={styles.macroValue}>{macros.protein}g proteina</Text>
                  </View>
                  <Text style={styles.macrosNote}>
                    *Izračunato Mifflin-St Jeor formulom za odabranu aktivnost.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Notifications Modal */}
      <Modal visible={notifModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Postavke obavijesti</Text>
              <Pressable onPress={() => setNotifModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Podsjetnik na trening</Text>
                <Text style={styles.toggleSub}>Upozorenja kada je vrijeme za tvoj zakazani trening.</Text>
              </View>
              <Switch
                value={notifSettings.reminders}
                onValueChange={() => toggleNotif("reminders")}
                trackColor={{ false: "#334155", true: "#F97316" }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Motivacijske poruke</Text>
                <Text style={styles.toggleSub}>Dnevni podsjetnici da te održe na pravom putu.</Text>
              </View>
              <Switch
                value={notifSettings.motivation}
                onValueChange={() => toggleNotif("motivation")}
                trackColor={{ false: "#334155", true: "#F97316" }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.notifWarningBox}>
              <Ionicons name="information-circle-outline" size={20} color="#38BDF8" />
              <Text style={styles.notifWarningText}>
                Push obavijesti su trenutno samo vizualni prikaz za razvoj. Pune obavijesti dolaze u produkcijskoj verziji aplikacije!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F172A" },
  header: { paddingHorizontal: 20, marginBottom: 30 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#F8FAFC" },
  content: { paddingHorizontal: 20 },
  
  avatarContainer: { alignItems: "center", marginBottom: 40 },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#334155",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1E293B",
    borderWidth: 3,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#F97316",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  displayName: { fontSize: 20, fontWeight: "700", color: "#F8FAFC", marginBottom: 4 },
  email: { fontSize: 14, color: "#94A3B8" },
  
  section: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#F8FAFC",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#F8FAFC" },
  label: { fontSize: 14, color: "#94A3B8", marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 14,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#334155",
    fontSize: 16,
  },
  rowChoices: { flexDirection: "row", gap: 8 },
  choiceBtn: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  choiceActive: { borderColor: "#F97316", backgroundColor: "#F9731615" },
  choiceText: { color: "#94A3B8", fontSize: 12, fontWeight: "600", textAlign: "center" },
  choiceTextActive: { color: "#F97316" },
  saveBtn: {
    backgroundColor: "#F97316",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  
  macrosBox: {
    marginTop: 24,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F9731630",
  },
  macrosTitle: { fontSize: 16, fontWeight: "600", color: "#F8FAFC", marginBottom: 16, textAlign: "center" },
  macroRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 },
  macroValue: { fontSize: 22, fontWeight: "800", color: "#E2E8F0" },
  macrosNote: { fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 8 },
  
  // Settings toggle
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingRight: 10 },
  toggleTitle: { fontSize: 16, fontWeight: "600", color: "#F8FAFC", marginBottom: 4 },
  toggleSub: { fontSize: 12, color: "#94A3B8", maxWidth: 220, lineHeight: 16 },
  notifWarningBox: { flexDirection: "row", backgroundColor: "#38BDF815", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#38BDF840", gap: 10, marginTop: 10 },
  notifWarningText: { flex: 1, fontSize: 12, color: "#38BDF8", lineHeight: 18 },
});
