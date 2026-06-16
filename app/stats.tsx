import { ExerciseProgress, getExerciseStats } from "@/services/statistics";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

export default function StatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseProgress | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseProgress[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, []),
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      const stats = await getExerciseStats();
      setExerciseData(stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const openExerciseDetail = (exercise: ExerciseProgress) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const renderExerciseCard = (exercise: ExerciseProgress) => {
    // Find the highest weight
    let bestWeight = 0;
    let bestRepsAtBestWeight = 0;

    exercise.data.forEach((d) => {
      if (d.weightKg > bestWeight) {
        bestWeight = d.weightKg;
        bestRepsAtBestWeight = d.reps;
      }
    });

    return (
      <Pressable
        key={exercise.exerciseId}
        style={styles.exerciseCard}
        onPress={() => openExerciseDetail(exercise)}
      >
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <Text style={styles.exerciseCategory}>{exercise.category}</Text>
        </View>

        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bestWeight}kg</Text>
            <Text style={styles.statLabel}>Best Weight</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bestRepsAtBestWeight}</Text>
            <Text style={styles.statLabel}>Reps at Best Weight</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exercise.data.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📊 Statistike</Text>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Učitavanje statistika...</Text>
        </View>
      ) : exerciseData.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart-outline" size={48} color="#475569" />
          <Text style={styles.emptyText}>Još nema podataka</Text>
          <Text style={styles.emptySub}>
            Dodaj treninge da bi vidio progres
          </Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Ionicons name="barbell-outline" size={20} color="#38BDF8" />
              <Text style={styles.summaryNumber}>{exerciseData.length}</Text>
              <Text style={styles.summaryLabel}>Vježbe</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="trophy-outline" size={20} color="#FBBF24" />
              <Text style={styles.summaryNumber}>
                {exerciseData.reduce((acc, ex) => acc + ex.data.length, 0)}
              </Text>
              <Text style={styles.summaryLabel}>Totalni Setovi</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="trending-up-outline" size={20} color="#4ADE80" />
              <Text style={styles.summaryNumber}>
                {exerciseData.filter((ex) => ex.data.length > 1).length}
              </Text>
              <Text style={styles.summaryLabel}>Praćeno</Text>
            </View>
          </View>

          {/* Exercise List */}
          <Text style={styles.sectionTitle}>Vježbe</Text>
          <Text style={styles.sectionSub}>
            Klikni na vježbu za pregled progresa{" "}
          </Text>

          {exerciseData.map(renderExerciseCard)}
        </>
      )}

      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedExercise?.exerciseName}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            {selectedExercise && (
              <ScrollView>
                {/* Best stats */}
                <View style={styles.modalStats}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {selectedExercise.bestWeight}kg
                    </Text>
                    <Text style={styles.modalStatLabel}>Najviša kilaža</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {selectedExercise.bestReps}
                    </Text>
                    <Text style={styles.modalStatLabel}>Repeticije</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {selectedExercise.totalVolume}kg
                    </Text>
                    <Text style={styles.modalStatLabel}>Ukupni volumen</Text>
                  </View>
                </View>

                {/* Weight chart */}
                {selectedExercise.data.length > 1 && (
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Progres kilaže</Text>
                    <LineChart
                      data={selectedExercise.data.map((d) => ({
                        value: d.weightKg,
                        label: d.date.split("-")[2],
                      }))}
                      height={200}
                      width={width - 60}
                      color="#F97316"
                      thickness={2}
                      dataPointsColor="#F97316"
                      textColor="#94A3B8"
                      xAxisLabelTextStyle={{ color: "#64748B", fontSize: 10 }}
                      yAxisTextStyle={{ color: "#64748B", fontSize: 10 }}
                      verticalLinesColor="#334155"
                      xAxisColor="#334155"
                      yAxisColor="#334155"
                      noOfSections={5}
                      spacing={25}
                      showDataPointOnFocus
                    />
                  </View>
                )}

                {/* All data */}
                <Text style={styles.historyTitle}>History</Text>
                {selectedExercise.data
                  .slice()
                  .reverse()
                  .map((point, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Text style={styles.historyDate}>{point.date}</Text>
                      <Text style={styles.historyWeight}>
                        {point.weightKg}kg
                      </Text>
                      <Text style={styles.historyReps}>{point.reps} reps</Text>
                    </View>
                  ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySub: {
    color: "#475569",
    fontSize: 14,
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F8FAFC",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  exerciseCategory: {
    fontSize: 12,
    color: "#64748B",
    backgroundColor: "#0F172A",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exerciseStats: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  modalStats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modalStat: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  modalStatLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  historyDate: {
    color: "#94A3B8",
    fontSize: 13,
  },
  historyWeight: {
    color: "#F97316",
    fontWeight: "600",
  },
  historyReps: {
    color: "#4ADE80",
    fontWeight: "600",
  },
});
