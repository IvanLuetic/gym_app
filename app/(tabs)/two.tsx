import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { firestore } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import SplitCard, { type Split } from "@/components/workouts/SplitCard";
import CreateSplitModal from "@/components/workouts/CreateSplitModal";
import WorkoutHistoryCard from "@/components/workouts/WorkoutHistoryCard";
import ShareSplitModal from "@/components/workouts/ShareSplitModal";
import type { AnyExercise } from "@/constants/exercises";

type Tab = "splits" | "history";

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ openAddModal?: string }>();

  const [activeTab, setActiveTab] = useState<Tab>("splits");
  const [splits, setSplits] = useState<Split[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSplits, setLoadingSplits] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [shareSplitModalOpen, setShareSplitModalOpen] = useState(false);
  const [editSplit, setEditSplit] = useState<Split | null>(null);
  const [shareSplit, setShareSplit] = useState<Split | null>(null);

  // Open split creation from dashboard quick action
  useEffect(() => {
    if (params.openAddModal === "true") {
      setSplitModalOpen(true);
      router.setParams({ openAddModal: undefined });
    }
  }, [params.openAddModal]);

  // Fetch splits
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(firestore, "splits"),
      where("userId", "==", user.uid)
    );
    return onSnapshot(q, (snap) => {
      const list: Split[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Split));
      list.sort((a, b) =>
        (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      );
      setSplits(list);
      setLoadingSplits(false);
    });
  }, [user]);

  // Fetch session history
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(firestore, "workoutSessions"),
      where("userId", "==", user.uid)
    );
    return onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.finishedAt?.seconds ?? a.startedAt?.seconds ?? 0;
        const tb = b.finishedAt?.seconds ?? b.startedAt?.seconds ?? 0;
        return tb - ta;
      });
      setSessions(list);
      setLoadingSessions(false);
    });
  }, [user]);

  // Start a workout session from a split
  const handleStartSplit = (split: Split) => {
    if (split.exerciseIds.length === 0) {
      Alert.alert(
        "Split je prazan",
        "Dodaj barem jednu vježbu u split prije nego počneš trening.",
        [
          { text: "Uredi split", onPress: () => { setEditSplit(split); setSplitModalOpen(true); } },
          { text: "Odustani", style: "cancel" },
        ]
      );
      return;
    }
    router.push({
      pathname: "/workout/session",
      params: {
        splitId: split.id,
        splitName: split.name,
        exerciseIds: split.exerciseIds.join(","),
        exerciseNames: split.exerciseNames.join(","),
      },
    });
  };

  const handleStartEmpty = () => {
    router.push({ pathname: "/workout/session" });
  };

  const openEditSplit = (split: Split) => {
    setEditSplit(split);
    setSplitModalOpen(true);
  };

  const openShareSplit = (split: Split) => {
    setShareSplit(split);
    setShareSplitModalOpen(true);
  };

  const handleScanQR = () => {
    router.push("/workout/scan-qr");
  };

  return (
    <View style={styles.root}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 16 : 40 }]}>
        <View>
          <Text style={styles.title}>Treninzi</Text>
          <Text style={styles.subtitle}>
            {activeTab === "splits"
              ? `${splits.length} split${splits.length === 1 ? "" : "a"}`
              : `${sessions.length} sesij${sessions.length === 1 ? "a" : "a"}`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.emptySessionBtn} onPress={handleScanQR}>
            <Ionicons name="qr-code-outline" size={18} color="#38BDF8" />
          </Pressable>
          <Pressable style={styles.emptySessionBtn} onPress={handleStartEmpty}>
            <Ionicons name="play-outline" size={18} color="#F97316" />
          </Pressable>
          <Pressable
            style={styles.addBtn}
            onPress={() => { setEditSplit(null); setSplitModalOpen(true); }}
          >
            <Ionicons name="add-outline" size={24} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      {/* ── Tab toggle ───────────────────────────────────────────── */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "splits" && styles.tabActive]}
          onPress={() => setActiveTab("splits")}
        >
          <Ionicons
            name="barbell-outline"
            size={16}
            color={activeTab === "splits" ? "#F97316" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "splits" && styles.tabTextActive]}>
            Splitovi
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === "history" ? "#F97316" : "#64748B"}
          />
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
            Povijest
          </Text>
        </Pressable>
      </View>

      {/* ── Splits tab ───────────────────────────────────────────── */}
      {activeTab === "splits" && (
        loadingSplits ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : splits.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Ionicons name="barbell-outline" size={40} color="#F97316" />
            </View>
            <Text style={styles.emptyTitle}>Nema splitova</Text>
            <Text style={styles.emptySub}>
              Kreiraj prvi split i organiziraj svoje treninge!
            </Text>
            <Pressable
              style={styles.emptyCreateBtn}
              onPress={() => { setEditSplit(null); setSplitModalOpen(true); }}
            >
              <Ionicons name="add-outline" size={18} color="#0F172A" />
              <Text style={styles.emptyCreateBtnText}>Kreiraj split</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={splits}
            keyExtractor={(item) => item.id!}
            renderItem={({ item }) => (
              <SplitCard
                split={item}
                onPress={() => handleStartSplit(item)}
                onEdit={() => openEditSplit(item)}
                onDelete={() => openEditSplit(item)}
                onShare={() => openShareSplit(item)}
              />
            )}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100 },
            ]}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <Pressable
                style={styles.freeSessionBtn}
                onPress={handleStartEmpty}
              >
                <Ionicons name="play-circle-outline" size={20} color="#64748B" />
                <Text style={styles.freeSessionText}>
                  Slobodan trening (bez splita)
                </Text>
              </Pressable>
            }
          />
        )
      )}

      {/* ── History tab ──────────────────────────────────────────── */}
      {activeTab === "history" && (
        loadingSessions ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyIcon}>
              <Ionicons name="time-outline" size={40} color="#F97316" />
            </View>
            <Text style={styles.emptyTitle}>Nema odrađenih treninga</Text>
            <Text style={styles.emptySub}>
              Počni trening iz jednog od tvojih splitova!
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <WorkoutHistoryCard session={item} />}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* ── Modals ───────────────────────────────────────────────── */}
      <CreateSplitModal
        visible={splitModalOpen}
        onClose={() => { setSplitModalOpen(false); setEditSplit(null); }}
        editSplit={editSplit}
      />
      
      <ShareSplitModal
        visible={shareSplitModalOpen}
        onClose={() => { setShareSplitModalOpen(false); setShareSplit(null); }}
        split={shareSplit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0F172A" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#F8FAFC" },
  subtitle: { fontSize: 13, color: "#94A3B8", marginTop: 2, fontWeight: "600" },
  headerRight: { flexDirection: "row", gap: 8 },
  emptySessionBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#F9731640",
    alignItems: "center", justifyContent: "center",
  },
  addBtn: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: "#F97316", alignItems: "center", justifyContent: "center",
    shadowColor: "#F97316", shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  // Tab toggle
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 14,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 10, borderRadius: 10,
  },
  tabActive: { backgroundColor: "#0F172A" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  tabTextActive: { color: "#F97316" },

  // List
  list: { padding: 20, paddingTop: 0 },

  // Empty state
  center: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 32,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: "#1E293B", borderWidth: 1, borderColor: "#F9731630",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#F8FAFC", marginBottom: 6 },
  emptySub: {
    fontSize: 14, color: "#64748B", textAlign: "center",
    lineHeight: 20, marginBottom: 20,
  },
  emptyCreateBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F97316", paddingHorizontal: 20,
    paddingVertical: 12, borderRadius: 14,
  },
  emptyCreateBtnText: { color: "#0F172A", fontWeight: "700", fontSize: 15 },

  // Free session
  freeSessionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#1E293B",
    borderRadius: 16, paddingVertical: 14, marginTop: 4,
    borderWidth: 1, borderColor: "#334155",
  },
  freeSessionText: { color: "#64748B", fontWeight: "600", fontSize: 14 },
});
