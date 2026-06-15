import { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  GLOBAL_EXERCISES,
  CATEGORY_COLORS,
  CATEGORIES,
  type AnyExercise,
  type Category,
} from "@/constants/exercises";

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Called with the chosen exercise */
  onSelect: (exercise: AnyExercise) => void;
  /** IDs already selected (shown with checkmark) */
  selectedIds?: string[];
  /** If true, multi-select mode with "Dodaj odabrane" button */
  multiSelect?: boolean;
  onMultiConfirm?: (exercises: AnyExercise[]) => void;
  customExercises?: AnyExercise[];
};

export default function ExerciseLibraryModal({
  visible,
  onClose,
  onSelect,
  selectedIds = [],
  multiSelect = false,
  onMultiConfirm,
  customExercises = [],
}: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "Sve">("Sve");
  const [multiPicked, setMultiPicked] = useState<AnyExercise[]>([]);

  const allExercises = useMemo(
    () => [...GLOBAL_EXERCISES, ...customExercises],
    [customExercises]
  );

  const filtered = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchCat =
        activeCategory === "Sve" || ex.category === activeCategory;
      const matchSearch = ex.name
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allExercises, activeCategory, search]);

  const handleSelect = (ex: AnyExercise) => {
    if (multiSelect) {
      setMultiPicked((prev) =>
        prev.find((e) => e.id === ex.id)
          ? prev.filter((e) => e.id !== ex.id)
          : [...prev, ex]
      );
    } else {
      onSelect(ex);
      onClose();
    }
  };

  const handleConfirm = () => {
    onMultiConfirm?.(multiPicked);
    setMultiPicked([]);
    onClose();
  };

  const isChecked = (id: string) =>
    selectedIds.includes(id) ||
    (!multiSelect ? false : !!multiPicked.find((e) => e.id === id));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Biblioteka vježbi</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-outline" size={26} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Pretraži vježbu..."
              placeholderTextColor="#475569"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#64748B" />
              </Pressable>
            )}
          </View>

          {/* Category chips */}
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {(["Sve", ...CATEGORIES] as (Category | "Sve")[]).map((item) => {
                const active = activeCategory === item;
                const color =
                  item === "Sve"
                    ? "#F97316"
                    : CATEGORY_COLORS[item as Category];
                return (
                  <Pressable
                    key={item}
                    onPress={() => setActiveCategory(item)}
                    style={[
                      styles.chip,
                      active && { backgroundColor: color + "25", borderColor: color },
                    ]}
                  >
                    <Text
                      style={[styles.chipText, active && { color }]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Exercise list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={36} color="#334155" />
                <Text style={styles.emptyText}>Nema rezultata</Text>
              </View>
            }
            renderItem={({ item }) => {
              const color = CATEGORY_COLORS[item.category];
              const checked = isChecked(item.id);
              return (
                <Pressable
                  style={[styles.row, checked && styles.rowChecked]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{item.name}</Text>
                    <Text style={styles.rowMeta}>
                      {item.category} · {item.equipment}
                    </Text>
                  </View>
                  {checked ? (
                    <Ionicons name="checkmark-circle" size={22} color="#F97316" />
                  ) : (
                    <Ionicons name="add-circle-outline" size={22} color="#334155" />
                  )}
                </Pressable>
              );
            }}
          />

          {/* Multi-select confirm */}
          {multiSelect && multiPicked.length > 0 && (
            <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>
                Dodaj {multiPicked.length} vježb
                {multiPicked.length === 1 ? "u" : "e"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.8)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#334155",
    maxHeight: "92%",
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  closeBtn: { padding: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#334155",
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 15,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0F172A",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  rowChecked: {
    borderColor: "#F9731640",
    backgroundColor: "#F9731608",
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowText: { flex: 1 },
  rowName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  rowMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    color: "#475569",
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: "#F97316",
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 16,
  },
});
