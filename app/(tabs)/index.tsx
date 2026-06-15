import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import WorkoutCard, { type Workout } from "@/components/workouts/WorkoutCard";
import ExerciseLibraryModal from "@/components/exercises/ExerciseLibraryModal";

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const displayName = user?.email?.split("@")[0] ?? "Sportaš";

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, "workouts"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Workout[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Workout);
        });
        // Sort client-side by date
        list.sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
          return dateB - dateA;
        });
        setWorkouts(list);
        setLoading(false);
      },
      (error) => {
        console.error("Dashboard list error: ", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Statistics calculation
  const getStats = () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    // 1. Weekly workouts count
    const weeklyCount = workouts.filter((w) => {
      if (!w.createdAt) return false;
      const date = w.createdAt.toDate ? w.createdAt.toDate().getTime() : new Date(w.createdAt).getTime();
      return date >= oneWeekAgo;
    }).length;

    // 2. Total duration in hours
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // 3. Streak calculation (consecutive days)
    const workoutDates = Array.from(
      new Set(
        workouts
          .map((w) => {
            if (!w.createdAt) return null;
            const date = w.createdAt.toDate ? w.createdAt.toDate() : new Date(w.createdAt);
            return date.toDateString(); // "Fri Jun 05 2026"
          })
          .filter(Boolean)
      )
    ).map((dString) => new Date(dString!).getTime());

    workoutDates.sort((a, b) => b - a); // descending order (latest first)

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();

    // If no workouts at all, streak is 0
    if (workoutDates.length > 0) {
      const latestWorkout = workoutDates[0];
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Check if user worked out today or yesterday to continue streak
      if (checkDate - latestWorkout <= oneDayMs) {
        checkDate = latestWorkout;
        streak = 1;
        for (let i = 1; i < workoutDates.length; i++) {
          if (checkDate - workoutDates[i] === oneDayMs) {
            streak++;
            checkDate = workoutDates[i];
          } else if (checkDate - workoutDates[i] > oneDayMs) {
            break;
          }
        }
      }
    }

    return {
      weeklyCount,
      totalHours: totalHours === "0.0" ? "0h" : `${totalHours}h`,
      streak,
    };
  };

  const { weeklyCount, totalHours, streak } = getStats();

  const handleQuickAction = (label: string) => {
    if (label === "Novi trening") {
      router.push({
        pathname: "/(tabs)/two",
        params: { openAddModal: "true" },
      });
    } else if (label === "Vježbe") {
      setLibraryOpen(true);
    } else {
      Alert.alert("Uskoro", `Funkcionalnost "${label}" stiže u sljedećoj verziji aplikacije! 🚀`);
    }
  };

  return (
    <>
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top > 0 ? insets.top + 16 : 40,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 40 : 60,
        },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Dobrodošao, 👋</Text>
          <Text style={styles.username}>{displayName}</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={22} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Today's motivation */}
      <View style={styles.motivationCard}>
        <View style={styles.motivationIcon}>
          <Ionicons name="trophy-outline" size={28} color="#F97316" />
        </View>
        <View style={styles.motivationText}>
          <Text style={styles.motivationTitle}>Dan {new Date().getDate()}. — Počni danas!</Text>
          <Text style={styles.motivationSub}>
            Svaki trening je korak prema boljoj verziji sebe.
          </Text>
        </View>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Pregled</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={22} color="#F97316" />
          <Text style={[styles.statValue, { color: "#F97316" }]}>{weeklyCount}</Text>
          <Text style={styles.statLabel}>Tjedni treninzi</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={22} color="#38BDF8" />
          <Text style={[styles.statValue, { color: "#38BDF8" }]}>{totalHours}</Text>
          <Text style={styles.statLabel}>Ukupno sati</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={22} color="#4ADE80" />
          <Text style={[styles.statValue, { color: "#4ADE80" }]}>{streak}</Text>
          <Text style={styles.statLabel}>Streak (dani)</Text>
        </View>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Brze akcije</Text>
      <View style={styles.actionsGrid}>
        <Pressable style={styles.actionCard} onPress={() => handleQuickAction("Novi trening")}>
          <View style={[styles.actionIcon, { backgroundColor: "#F9731620" }]}>
            <Ionicons name="add-circle-outline" size={26} color="#F97316" />
          </View>
          <Text style={styles.actionLabel}>Novi trening</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => handleQuickAction("Vježbe")}>
          <View style={[styles.actionIcon, { backgroundColor: "#38BDF820" }]}>
            <Ionicons name="barbell-outline" size={26} color="#38BDF8" />
          </View>
          <Text style={styles.actionLabel}>Vježbe</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => handleQuickAction("Raspored")}>
          <View style={[styles.actionIcon, { backgroundColor: "#A78BFA20" }]}>
            <Ionicons name="calendar-outline" size={26} color="#A78BFA" />
          </View>
          <Text style={styles.actionLabel}>Raspored</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => handleQuickAction("Statistika")}>
          <View style={[styles.actionIcon, { backgroundColor: "#4ADE8020" }]}>
            <Ionicons name="stats-chart-outline" size={26} color="#4ADE80" />
          </View>
          <Text style={styles.actionLabel}>Statistika</Text>
        </Pressable>
      </View>

      {/* Last Workouts */}
      <Text style={styles.sectionTitle}>Zadnji treninzi</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#F97316" style={{ marginVertical: 20 }} />
      ) : workouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={36} color="#334155" />
          <Text style={styles.emptyText}>Nema odrađenih treninga</Text>
          <Text style={styles.emptySubText}>Idi na tab "Treninzi" i dodaj svoj prvi trening!</Text>
        </View>
      ) : (
        <View>
          {workouts.slice(0, 3).map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </View>
      )}
    </ScrollView>
    <ExerciseLibraryModal
      visible={libraryOpen}
      onClose={() => setLibraryOpen(false)}
      onSelect={() => {}}
    />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    padding: 20,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F8FAFC",
    textTransform: "capitalize",
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },

  // Motivation card
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F9731630",
    marginBottom: 28,
    gap: 14,
  },
  motivationIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F9731615",
    alignItems: "center",
    justifyContent: "center",
  },
  motivationText: { flex: 1 },
  motivationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  motivationSub: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 18,
  },

  // Section titles
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 14,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },

  // Quick actions
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  actionCard: {
    width: "47.5%",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CBD5E1",
  },

  // Empty state
  emptyCard: {
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginTop: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: "#334155",
    textAlign: "center",
  },
});
