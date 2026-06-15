import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  type AnyExercise,
  type Category,
  type Equipment,
} from "@/constants/exercises";

const EQUIPMENT_OPTIONS: Equipment[] = [
  "Šipka",
  "Bučice",
  "Stroj",
  "Kabel",
  "Vlastita težina",
  "Kardio",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  editExercise?: AnyExercise | null;
};

export default function AddExerciseModal({ visible, onClose, editExercise }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Prsa");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState<Equipment>("Šipka");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editExercise) {
      setName(editExercise.name);
      setCategory(editExercise.category);
      setMuscleGroup(editExercise.muscleGroup);
      setEquipment(editExercise.equipment);
    } else {
      setName("");
      setCategory("Prsa");
      setMuscleGroup("");
      setEquipment("Šipka");
    }
  }, [editExercise, visible]);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Greška", "Unesite naziv vježbe.");
    if (!user) return;
    setLoading(true);
    try {
      if (editExercise && !editExercise.isGlobal) {
        await updateDoc(doc(firestore, "exercises", editExercise.id), {
          name: name.trim(),
          category,
          muscleGroup: muscleGroup.trim(),
          equipment,
        });
      } else {
        await addDoc(collection(firestore, "exercises"), {
          name: name.trim(),
          category,
          muscleGroup: muscleGroup.trim(),
          equipment,
          isGlobal: false,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (e) {
      Alert.alert("Greška", "Nije moguće spremiti vježbu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editExercise || editExercise.isGlobal) return;
    Alert.alert(
      "Obriši vježbu",
      `Jeste li sigurni da želite obrisati "${editExercise.name}"?`,
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Obriši",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(firestore, "exercises", editExercise.id));
              onClose();
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editExercise ? "Uredi vježbu" : "Nova vježba"}
            </Text>
            <View style={styles.headerRight}>
              {editExercise && !editExercise.isGlobal && (
                <Pressable onPress={handleDelete} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </Pressable>
              )}
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close-outline" size={24} color="#94A3B8" />
              </Pressable>
            </View>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            {/* Name */}
            <Text style={styles.label}>Naziv vježbe</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="npr. Bench Press..."
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Category */}
            <Text style={styles.label}>Kategorija</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                const color = CATEGORY_COLORS[cat];
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, active && { backgroundColor: color + "25", borderColor: color }]}
                  >
                    <Text style={[styles.chipText, active && { color }]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Muscle group */}
            <Text style={styles.label}>Mišićna skupina (opcionalno)</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="npr. Pectoralis Major..."
                placeholderTextColor="#475569"
                value={muscleGroup}
                onChangeText={setMuscleGroup}
              />
            </View>

            {/* Equipment */}
            <Text style={styles.label}>Oprema</Text>
            <View style={styles.chipRow}>
              {EQUIPMENT_OPTIONS.map((eq) => {
                const active = equipment === eq;
                return (
                  <Pressable
                    key={eq}
                    onPress={() => setEquipment(eq)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{eq}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {editExercise ? "Spremi izmjene" : "Dodaj vježbu"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.8)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 12,
  },
  headerRight: { flexDirection: "row", gap: 8 },
  title: { fontSize: 20, fontWeight: "800", color: "#F8FAFC" },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#450A0A", alignItems: "center", justifyContent: "center",
  },
  closeBtn: { padding: 4 },
  scroll: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "700", color: "#94A3B8", marginBottom: 8, marginTop: 14 },
  inputWrap: {
    backgroundColor: "#0F172A", borderWidth: 1, borderColor: "#334155",
    borderRadius: 14, paddingHorizontal: 14,
  },
  input: { height: 50, color: "#F8FAFC", fontSize: 15 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: "#334155", backgroundColor: "#0F172A",
  },
  chipActive: { borderColor: "#F97316", backgroundColor: "#F9731620" },
  chipText: { fontSize: 13, color: "#94A3B8", fontWeight: "600" },
  chipTextActive: { color: "#F97316", fontWeight: "700" },
  saveBtn: {
    backgroundColor: "#F97316", borderRadius: 16,
    paddingVertical: 16, alignItems: "center", marginTop: 24,
  },
  saveBtnText: { color: "#0F172A", fontSize: 16, fontWeight: "700" },
});
