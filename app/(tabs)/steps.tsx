import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pedometer } from "expo-sensors";

const DAILY_GOAL = 10000;

// Calories burned per step (rough estimate ~0.04 kcal/step for avg person)
const KCAL_PER_STEP = 0.04;

// Distance per step in meters (avg ~0.762m)
const METERS_PER_STEP = 0.762;

type WeekDay = {
  label: string;
  steps: number;
};

export default function StepsScreen() {
  const insets = useSafeAreaInsets();

  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [todaySteps, setTodaySteps] = useState(0);
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Animated progress arc value
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progressPercent = Math.min(todaySteps / DAILY_GOAL, 1);
  const calories = Math.round(todaySteps * KCAL_PER_STEP);
  const distanceKm = ((todaySteps * METERS_PER_STEP) / 1000).toFixed(2);

  // Check availability + fetch today's steps
  useEffect(() => {
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    const init = async () => {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (!available) return;

      // Read today's steps (from midnight to now)
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);

      try {
        const result = await Pedometer.getStepCountAsync(midnight, now);
        setTodaySteps(result.steps);
      } catch (e) {
        console.warn("getStepCountAsync failed:", e);
      }

      // Live subscription for new steps
      subscription = Pedometer.watchStepCount((result) => {
        setTodaySteps((prev) => prev + result.steps);
        setIsLive(true);
      });

      // Fetch last 7 days
      await fetchWeekData();
    };

    init();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Animate progress ring when steps change
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progressPercent]);

  const fetchWeekData = async () => {
    const days: WeekDay[] = [];
    const dayLabels = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i);
      end.setHours(23, 59, 59, 999);

      const start = new Date(end);
      start.setHours(0, 0, 0, 0);

      let steps = 0;
      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        steps = result.steps;
      } catch (_) {
        steps = 0;
      }

      days.push({
        label: dayLabels[end.getDay()],
        steps,
      });
    }

    setWeekData(days);
  };

  const maxWeekSteps = Math.max(...weekData.map((d) => d.steps), 1);

  const handleNotAvailable = () => {
    Alert.alert(
      "Senzor nije dostupan",
      "Tvoj uređaj ne podržava pedometar, ili je potrebno odobriti dozvolu za praćenje aktivnosti.",
      [{ text: "OK" }]
    );
  };

  // Circular progress - simulate with a filled bar since RN doesn't have SVG natively
  const ringFill = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Koraci 🚶</Text>
          <Text style={styles.headerSub}>Dnevni pregled aktivnosti</Text>
        </View>
        <View style={[styles.liveBadge, { opacity: isLive ? 1 : 0.3 }]}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Unavailable state */}
      {isAvailable === false && (
        <Pressable style={styles.unavailableCard} onPress={handleNotAvailable}>
          <Ionicons name="warning-outline" size={32} color="#F97316" />
          <Text style={styles.unavailableTitle}>Pedometar nije dostupan</Text>
          <Text style={styles.unavailableSub}>
            Senzor nije podržan na ovom uređaju ili emulatorima.{"\n"}
            Testiraj na fizičkom uređaju.
          </Text>
        </Pressable>
      )}

      {/* Main progress ring card */}
      {isAvailable !== false && (
        <View style={styles.ringCard}>
          <Text style={styles.ringLabel}>Dnevni cilj</Text>

          {/* Outer ring */}
          <View style={styles.ringOuter}>
            <View style={styles.ringTrack}>
              <Animated.View
                style={[
                  styles.ringFill,
                  {
                    height: ringFill,
                    backgroundColor:
                      progressPercent >= 1 ? "#4ADE80" : "#F97316",
                  },
                ]}
              />
            </View>

            {/* Center content */}
            <View style={styles.ringCenter}>
              <Text
                style={[
                  styles.stepCount,
                  { color: progressPercent >= 1 ? "#4ADE80" : "#F8FAFC" },
                ]}
              >
                {todaySteps.toLocaleString()}
              </Text>
              <Text style={styles.stepUnit}>koraka</Text>
              <Text style={styles.stepGoal}>/ {DAILY_GOAL.toLocaleString()}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: ringFill,
                  backgroundColor:
                    progressPercent >= 1 ? "#4ADE80" : "#F97316",
                },
              ]}
            />
          </View>

          <Text style={styles.progressLabel}>
            {progressPercent >= 1
              ? "🎉 Cilj ostvaren! Odlično!"
              : `${Math.round(progressPercent * 100)}% ostvareno`}
          </Text>
        </View>
      )}

      {/* Stats row */}
      {isAvailable !== false && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: "#F9731630" }]}>
            <Ionicons name="flame-outline" size={22} color="#F97316" />
            <Text style={[styles.statValue, { color: "#F97316" }]}>
              {calories}
            </Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>

          <View style={[styles.statCard, { borderColor: "#38BDF830" }]}>
            <Ionicons name="map-outline" size={22} color="#38BDF8" />
            <Text style={[styles.statValue, { color: "#38BDF8" }]}>
              {distanceKm}
            </Text>
            <Text style={styles.statLabel}>km</Text>
          </View>

          <View style={[styles.statCard, { borderColor: "#A78BFA30" }]}>
            <Ionicons name="trending-up-outline" size={22} color="#A78BFA" />
            <Text style={[styles.statValue, { color: "#A78BFA" }]}>
              {DAILY_GOAL - todaySteps > 0
                ? (DAILY_GOAL - todaySteps).toLocaleString()
                : "✓"}
            </Text>
            <Text style={styles.statLabel}>
              {DAILY_GOAL - todaySteps > 0 ? "do cilja" : "završeno!"}
            </Text>
          </View>
        </View>
      )}

      {/* Weekly chart */}
      {weekData.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Tjedni pregled</Text>
          <View style={styles.chartCard}>
            {weekData.map((day, index) => {
              const barHeight = Math.max(
                (day.steps / maxWeekSteps) * 120,
                4
              );
              const isToday = index === weekData.length - 1;
              return (
                <View key={index} style={styles.chartColumn}>
                  <Text style={styles.chartStepCount}>
                    {day.steps > 999
                      ? `${(day.steps / 1000).toFixed(1)}k`
                      : day.steps}
                  </Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isToday
                            ? "#F97316"
                            : day.steps >= DAILY_GOAL
                            ? "#4ADE80"
                            : "#334155",
                          borderColor: isToday ? "#F97316" : "transparent",
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.chartDayLabel,
                      { color: isToday ? "#F97316" : "#64748B" },
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
              <Text style={styles.legendText}>Danas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#4ADE80" }]} />
              <Text style={styles.legendText}>Cilj ostvaren</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#334155" }]} />
              <Text style={styles.legendText}>Ostali dani</Text>
            </View>
          </View>
        </>
      )}

      {/* Tips card */}
      <View style={styles.tipsCard}>
        <Ionicons name="bulb-outline" size={22} color="#FBBF24" />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipsTitle}>Savjet dana</Text>
          <Text style={styles.tipsSub}>
            10.000 koraka dnevno odgovara ~5 km hodanja i pomaže u poboljšanju
            kardiovaskularnog zdravlja i sagorijevanju kalorija.
          </Text>
        </View>
      </View>

      {/* Platform note */}
      {Platform.OS !== "ios" && Platform.OS !== "android" && (
        <Text style={styles.platformNote}>
          ⚠️ Pedometar radi samo na fizičkim iOS/Android uređajima.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    padding: 20,
    gap: 0,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  headerSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ADE80",
    letterSpacing: 1,
  },

  // Unavailable
  unavailableCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#F9731630",
    marginBottom: 20,
  },
  unavailableTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  unavailableSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },

  // Ring card
  ringCard: {
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
    gap: 16,
  },
  ringLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ringOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    borderColor: "#0F172A",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
    backgroundColor: "#0F172A",
    borderRadius: 90,
    overflow: "hidden",
  },
  ringFill: {
    width: "100%",
    opacity: 0.25,
  },
  ringCenter: {
    alignItems: "center",
    zIndex: 1,
  },
  stepCount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  stepUnit: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  stepGoal: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
  },

  // Progress bar
  progressBarTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#0F172A",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
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
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 14,
  },

  // Chart
  chartCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 12,
    height: 190,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  chartStepCount: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 4,
  },
  barContainer: {
    height: 120,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 22,
    borderRadius: 6,
    borderWidth: 1,
  },
  chartDayLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },

  // Legend
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#64748B",
  },

  // Tips
  tipsCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FBBF2430",
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FBBF24",
    marginBottom: 4,
  },
  tipsSub: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 19,
  },

  // Platform note
  platformNote: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    marginTop: 8,
  },
});
