import { auth, firestore } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface ExerciseProgress {
  exerciseName: string;
  exerciseId: string;
  category: string;
  data: {
    date: string;
    weightKg: number;
    reps: number;
    sets: number;
    totalVolume: number;
  }[];
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
}

export async function getUserWorkoutSessions() {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user logged in");
    return [];
  }

  const sessionsRef = collection(firestore, "workoutSessions");
  const q = query(sessionsRef, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getUserSplits() {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user logged in");
    return [];
  }

  const splitsRef = collection(firestore, "splits");
  const q = query(splitsRef, where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getExerciseStats(): Promise<ExerciseProgress[]> {
  const sessions = await getUserWorkoutSessions();
  const exerciseMap: Record<string, ExerciseProgress> = {};

  sessions.forEach((session: any) => {
    const date = session.date?.toDate?.() || new Date();
    const dateStr = date.toISOString().split("T")[0];

    const exercises = session.exercises || [];
    exercises.forEach((exercise: any) => {
      const name = exercise.exerciseName || "Unknown";
      const id = exercise.exerciseId || "unknown";
      const category = exercise.category || "Uncategorized";

      if (!exerciseMap[id]) {
        exerciseMap[id] = {
          exerciseName: name,
          exerciseId: id,
          category: category,
          data: [],
          bestWeight: 0,
          bestReps: 0,
          totalVolume: 0,
        };
      }

      const sets = exercise.sets || [];
      sets.forEach((set: any) => {
        const weight = set.weightKg || 0;
        const reps = set.reps || 0;
        const volume = weight * reps;

        exerciseMap[id].data.push({
          date: dateStr,
          weightKg: weight,
          reps: reps,
          sets: 1,
          totalVolume: volume,
        });

        if (weight > exerciseMap[id].bestWeight) {
          exerciseMap[id].bestWeight = weight;
          exerciseMap[id].bestReps = reps;
        } else if (
          weight === exerciseMap[id].bestWeight &&
          reps > exerciseMap[id].bestReps
        ) {
          exerciseMap[id].bestReps = reps;
        }

        exerciseMap[id].totalVolume += volume;
      });
    });
  });

  // Sort data by date
  Object.values(exerciseMap).forEach((exercise) => {
    exercise.data.sort((a, b) => a.date.localeCompare(b.date));
  });

  return Object.values(exerciseMap);
}
