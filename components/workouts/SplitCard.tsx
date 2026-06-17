import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface Split {
  id?: string;
  userId: string;
  name: string;
  description: string;
  exerciseIds: string[];
  exerciseNames: string[];
  color: string;
  createdAt?: any;
}

type SplitCardProps = {
  split: Split;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
};

export default function SplitCard({ split, onPress, onEdit, onDelete, onShare }: SplitCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { borderColor: split.color + "40" }, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* Color stripe */}
      <View style={[styles.stripe, { backgroundColor: split.color }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={[styles.iconBg, { backgroundColor: split.color + "20" }]}>
            <Ionicons name="barbell-outline" size={20} color={split.color} />
          </View>
          <View style={styles.actions}>
            {onShare && (
              <Pressable onPress={onShare} style={styles.actionBtn} hitSlop={8}>
                <Ionicons name="share-social-outline" size={16} color="#38BDF8" />
              </Pressable>
            )}
            <Pressable onPress={onEdit} style={styles.actionBtn} hitSlop={8}>
              <Ionicons name="pencil-outline" size={16} color="#64748B" />
            </Pressable>
            <Pressable onPress={onDelete} style={styles.actionBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#EF444460" />
            </Pressable>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.name}>{split.name}</Text>

        {/* Description */}
        {split.description ? (
          <Text style={styles.description} numberOfLines={1}>{split.description}</Text>
        ) : null}

        {/* Exercises preview */}
        <View style={styles.exercisesRow}>
          <Ionicons name="list-outline" size={14} color="#64748B" />
          <Text style={styles.exercisesText}>
            {split.exerciseIds.length === 0
              ? "Nema vježbi"
              : split.exerciseNames.slice(0, 3).join(", ") +
                (split.exerciseNames.length > 3 ? ` +${split.exerciseNames.length - 3}` : "")}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.countBadge, { color: split.color, backgroundColor: split.color + "15" }]}>
            {split.exerciseIds.length} vježb{split.exerciseIds.length === 1 ? "a" : "i"}
          </Text>
          <Pressable
            style={[styles.startBtn, { backgroundColor: split.color }]}
            onPress={onPress}
          >
            <Ionicons name="play" size={13} color="#fff" />
            <Text style={styles.startBtnText}>Počni</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pressed: { opacity: 0.88 },
  stripe: {
    width: 5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  description: {
    fontSize: 13,
    color: "#64748B",
  },
  exercisesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  exercisesText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});
