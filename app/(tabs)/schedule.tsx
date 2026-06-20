import {
  cancelNotification,
  requestNotificationPermissions,
  scheduleWeeklyWorkoutNotification,
} from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Show notif if app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const STORAGE_KEY = "weekly_schedule";

const DAY_NAMES = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
];

const DAY_SHORT = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface ScheduleItem {
  id: string;
  day: number;
  time: string;
  label: string;
  notificationsEnabled: boolean;
  notificationId?: string;
}

function getNextOccurrence(day: number, time: string): Date {
  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  const result = new Date();
  result.setHours(hour, minute, 0, 0);

  let dayDiff = day - now.getDay();

  if (dayDiff < 0 || (dayDiff === 0 && result.getTime() <= now.getTime())) {
    dayDiff += 7;
  }
  result.setDate(now.getDate() + dayDiff);
  return result;
}

function formatRelativeDay(date: Date): string {
  const now = new Date();

  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const dateMidnight = new Date(date);
  dateMidnight.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (dateMidnight.getTime() - todayMidnight.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) return "Danas";
  if (diffDays === 1) return "Sutra";
  return DAY_NAMES[date.getDay()];
}
export default function RasporedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [timeInput, setTimeInput] = useState("18:00");
  const [notifInput, setNotifInput] = useState(true);

  // Load saved schedule on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSchedule(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load schedule:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (items: ScheduleItem[]) => {
    setSchedule(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const openModalForDay = (day: number) => {
    const existing = schedule.find((s) => s.day === day);
    setEditingDay(day);
    setLabelInput(existing?.label ?? "");
    setTimeInput(existing?.time ?? "18:00");
    setNotifInput(existing?.notificationsEnabled ?? true);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingDay(null);
  };

  const validateTime = (value: string) =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

  const handleSave = async () => {
    if (editingDay === null) return;

    if (!labelInput.trim()) {
      Alert.alert("Greška", "Unesi naziv treninga (npr. Push Day).");
      return;
    }

    if (!validateTime(timeInput)) {
      Alert.alert("Greška", "Unesi vrijeme u formatu HH:MM (npr. 18:00).");
      return;
    }

    const existing = schedule.find((s) => s.day === editingDay);

    if (existing?.notificationId) {
      await cancelNotification(existing.notificationId);
    }

    let notificationId: string | undefined;

    if (notifInput) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Obavijesti onemogućene",
          "Dozvoli obavijesti u postavkama uređaja da bi primao podsjetnike.",
        );
      } else {
        const id = await scheduleWeeklyWorkoutNotification(
          editingDay,
          timeInput,
          labelInput.trim(),
        );
        notificationId = id ?? undefined;
      }
    }

    const newItem: ScheduleItem = {
      id: existing?.id ?? `${editingDay}-${Date.now()}`,
      day: editingDay,
      time: timeInput,
      label: labelInput.trim(),
      notificationsEnabled: notifInput && !!notificationId,
      notificationId,
    };

    const updated = existing
      ? schedule.map((s) => (s.day === editingDay ? newItem : s))
      : [...schedule, newItem];

    await persist(updated);
    closeModal();
  };

  const handleDelete = async () => {
    if (editingDay === null) return;
    const existing = schedule.find((s) => s.day === editingDay);
    if (existing?.notificationId) {
      await cancelNotification(existing.notificationId);
    }
    const updated = schedule.filter((s) => s.day !== editingDay);
    await persist(updated);
    closeModal();
  };

  const upcoming = schedule
    .map((item) => ({ item, date: getNextOccurrence(item.day, item.time) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

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
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#94A3B8" />
        </Pressable>
        <Text style={styles.title}>Raspored</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Upcoming sessions */}
      <Text style={styles.sectionTitle}>Nadolazeći treninzi</Text>
      {loading ? null : upcoming.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={32} color="#334155" />
          <Text style={styles.emptyText}>Nema zakazanih treninga</Text>
          <Text style={styles.emptySubText}>
            Dodaj trening klikom na dan u tjednom rasporedu ispod.
          </Text>
        </View>
      ) : (
        <View style={{ marginBottom: 28 }}>
          {upcoming.map(({ item, date }) => (
            <View key={item.id} style={styles.upcomingCard}>
              <View style={styles.upcomingIcon}>
                <Ionicons name="barbell-outline" size={20} color="#38BDF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upcomingLabel}>{item.label}</Text>
                <Text style={styles.upcomingMeta}>
                  {formatRelativeDay(date)} u {item.time}
                </Text>
              </View>
              {item.notificationsEnabled && (
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color="#4ADE80"
                />
              )}
            </View>
          ))}
        </View>
      )}

      {/* Weekly planner */}
      <Text style={styles.sectionTitle}>Tjedni raspored</Text>
      <View style={styles.weekGrid}>
        {DISPLAY_ORDER.map((day) => {
          const item = schedule.find((s) => s.day === day);
          return (
            <Pressable
              key={day}
              style={[styles.dayCard, item && styles.dayCardActive]}
              onPress={() => openModalForDay(day)}
            >
              <Text style={styles.dayName}>{DAY_SHORT[day]}</Text>
              {item ? (
                <>
                  <Text style={styles.dayLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.dayTime}>{item.time}</Text>
                </>
              ) : (
                <Ionicons name="add" size={20} color="#475569" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Add/Edit modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDay !== null ? DAY_NAMES[editingDay] : ""}
            </Text>

            <Text style={styles.inputLabel}>Naziv treninga</Text>
            <TextInput
              style={styles.input}
              placeholder="npr. Push Day"
              placeholderTextColor="#475569"
              value={labelInput}
              onChangeText={setLabelInput}
            />

            <Text style={styles.inputLabel}>Vrijeme (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="18:00"
              placeholderTextColor="#475569"
              value={timeInput}
              onChangeText={setTimeInput}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Pressable
              style={styles.notifToggle}
              onPress={() => setNotifInput((v) => !v)}
            >
              <Ionicons
                name={notifInput ? "checkbox" : "square-outline"}
                size={22}
                color={notifInput ? "#4ADE80" : "#64748B"}
              />
              <Text style={styles.notifToggleText}>
                Pošalji podsjetnik (svaki tjedan)
              </Text>
            </Pressable>

            <View style={styles.modalActions}>
              {schedule.some((s) => s.day === editingDay) && (
                <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteBtnText}>Obriši</Text>
                </Pressable>
              )}
              <Pressable style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Odustani</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Spremi</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 14,
  },

  // Upcoming
  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 10,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#38BDF820",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  upcomingMeta: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  // Empty state
  emptyCard: {
    backgroundColor: "#1E293B",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
    marginBottom: 28,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginTop: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: "#334155",
    textAlign: "center",
  },

  // Week grid
  weekGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayCard: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#1E293B",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 6,
  },
  dayCardActive: {
    borderColor: "#38BDF860",
    backgroundColor: "#1E293B",
  },
  dayName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#F8FAFC",
    textAlign: "center",
  },
  dayTime: {
    fontSize: 11,
    color: "#38BDF8",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 12,
    color: "#F8FAFC",
    fontSize: 15,
  },
  notifToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  notifToggleText: {
    fontSize: 13,
    color: "#CBD5E1",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#EF444420",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF444440",
  },
  deleteBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#334155",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#CBD5E1",
    fontWeight: "700",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#F97316",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 14,
  },
});
