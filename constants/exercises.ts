export type Equipment = "Šipka" | "Bučice" | "Stroj" | "Kabel" | "Vlastita težina" | "Kardio";
export type Category = "Prsa" | "Leđa" | "Noge" | "Ramena" | "Ruke" | "Core" | "Cardio";

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  muscleGroup: string;
  equipment: Equipment;
  isGlobal: true;
  userId?: undefined;
}

export interface CustomExercise {
  id: string;
  name: string;
  category: Category;
  muscleGroup: string;
  equipment: Equipment;
  isGlobal: false;
  userId: string;
}

export type AnyExercise = Exercise | CustomExercise;

export const CATEGORY_COLORS: Record<Category, string> = {
  Prsa:    "#EF4444",
  Leđa:   "#3B82F6",
  Noge:    "#10B981",
  Ruke:    "#F59E0B",
  Ramena:  "#8B5CF6",
  Core:    "#EC4899",
  Cardio:  "#06B6D4",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Prsa:    "fitness-outline",
  Leđa:   "body-outline",
  Noge:    "walk-outline",
  Ruke:    "barbell-outline",
  Ramena:  "git-commit-outline",
  Core:    "flash-outline",
  Cardio:  "heart-outline",
};

export const CATEGORIES: Category[] = ["Prsa", "Leđa", "Noge", "Ramena", "Ruke", "Core", "Cardio"];

export const GLOBAL_EXERCISES: Exercise[] = [
  // ── PRSA ──────────────────────────────────────────
  { id: "g_bp",    name: "Bench Press",         category: "Prsa",   muscleGroup: "Pectoralis Major",  equipment: "Šipka",           isGlobal: true },
  { id: "g_ibp",   name: "Incline Bench Press", category: "Prsa",   muscleGroup: "Gornji Pectoralis", equipment: "Šipka",           isGlobal: true },
  { id: "g_dbp",   name: "Dumbbell Bench Press",category: "Prsa",   muscleGroup: "Pectoralis Major",  equipment: "Bučice",          isGlobal: true },
  { id: "g_df",    name: "Dumbbell Fly",         category: "Prsa",   muscleGroup: "Pectoralis Major",  equipment: "Bučice",          isGlobal: true },
  { id: "g_pu",    name: "Push-Up",              category: "Prsa",   muscleGroup: "Pectoralis Major",  equipment: "Vlastita težina", isGlobal: true },
  { id: "g_cc",    name: "Cable Crossover",      category: "Prsa",   muscleGroup: "Pectoralis Minor",  equipment: "Kabel",           isGlobal: true },

  // ── LEĐA ──────────────────────────────────────────
  { id: "g_dl",    name: "Deadlift",             category: "Leđa",  muscleGroup: "Erector Spinae",    equipment: "Šipka",           isGlobal: true },
  { id: "g_pup",   name: "Pull-Up",              category: "Leđa",  muscleGroup: "Latissimus Dorsi",  equipment: "Vlastita težina", isGlobal: true },
  { id: "g_bor",   name: "Bent Over Row",        category: "Leđa",  muscleGroup: "Latissimus Dorsi",  equipment: "Šipka",           isGlobal: true },
  { id: "g_lpd",   name: "Lat Pulldown",         category: "Leđa",  muscleGroup: "Latissimus Dorsi",  equipment: "Stroj",           isGlobal: true },
  { id: "g_cr",    name: "Cable Row",             category: "Leđa",  muscleGroup: "Rhomboids",         equipment: "Kabel",           isGlobal: true },
  { id: "g_dbr",   name: "Dumbbell Row",          category: "Leđa",  muscleGroup: "Latissimus Dorsi",  equipment: "Bučice",          isGlobal: true },

  // ── NOGE ──────────────────────────────────────────
  { id: "g_sq",    name: "Squat",                category: "Noge",   muscleGroup: "Quadriceps",        equipment: "Šipka",           isGlobal: true },
  { id: "g_lp",    name: "Leg Press",             category: "Noge",   muscleGroup: "Quadriceps",        equipment: "Stroj",           isGlobal: true },
  { id: "g_rdl",   name: "Romanian Deadlift",    category: "Noge",   muscleGroup: "Hamstrings",        equipment: "Šipka",           isGlobal: true },
  { id: "g_lc",    name: "Leg Curl",              category: "Noge",   muscleGroup: "Hamstrings",        equipment: "Stroj",           isGlobal: true },
  { id: "g_le",    name: "Leg Extension",         category: "Noge",   muscleGroup: "Quadriceps",        equipment: "Stroj",           isGlobal: true },
  { id: "g_calr",  name: "Calf Raise",            category: "Noge",   muscleGroup: "Gastrocnemius",     equipment: "Stroj",           isGlobal: true },
  { id: "g_lun",   name: "Walking Lunge",         category: "Noge",   muscleGroup: "Quadriceps",        equipment: "Bučice",          isGlobal: true },

  // ── RAMENA ────────────────────────────────────────
  { id: "g_ohp",   name: "Overhead Press",       category: "Ramena", muscleGroup: "Deltoids",          equipment: "Šipka",           isGlobal: true },
  { id: "g_lr",    name: "Lateral Raise",         category: "Ramena", muscleGroup: "Medijalni Deltoid", equipment: "Bučice",          isGlobal: true },
  { id: "g_fr",    name: "Front Raise",           category: "Ramena", muscleGroup: "Prednji Deltoid",   equipment: "Bučice",          isGlobal: true },
  { id: "g_fp",    name: "Face Pull",             category: "Ramena", muscleGroup: "Zadnji Deltoid",    equipment: "Kabel",           isGlobal: true },
  { id: "g_shr",   name: "Shrug",                category: "Ramena", muscleGroup: "Trapezius",         equipment: "Bučice",          isGlobal: true },

  // ── RUKE ──────────────────────────────────────────
  { id: "g_bbc",   name: "Barbell Curl",          category: "Ruke",   muscleGroup: "Biceps Brachii",    equipment: "Šipka",           isGlobal: true },
  { id: "g_hc",    name: "Hammer Curl",           category: "Ruke",   muscleGroup: "Brachialis",        equipment: "Bučice",          isGlobal: true },
  { id: "g_tcd",   name: "Tricep Dip",            category: "Ruke",   muscleGroup: "Triceps Brachii",   equipment: "Vlastita težina", isGlobal: true },
  { id: "g_sc",    name: "Skull Crusher",         category: "Ruke",   muscleGroup: "Triceps Brachii",   equipment: "Šipka",           isGlobal: true },
  { id: "g_cpd",   name: "Cable Pushdown",        category: "Ruke",   muscleGroup: "Triceps Brachii",   equipment: "Kabel",           isGlobal: true },

  // ── CORE ──────────────────────────────────────────
  { id: "g_plk",   name: "Plank",                category: "Core",   muscleGroup: "Transverzus Abdom.",equipment: "Vlastita težina", isGlobal: true },
  { id: "g_crn",   name: "Crunch",               category: "Core",   muscleGroup: "Rectus Abdominis",  equipment: "Vlastita težina", isGlobal: true },
  { id: "g_rt",    name: "Russian Twist",         category: "Core",   muscleGroup: "Obliques",          equipment: "Vlastita težina", isGlobal: true },
  { id: "g_hlr",   name: "Hanging Leg Raise",    category: "Core",   muscleGroup: "Rectus Abdominis",  equipment: "Vlastita težina", isGlobal: true },

  // ── CARDIO ────────────────────────────────────────
  { id: "g_run",   name: "Trčanje",              category: "Cardio", muscleGroup: "Cijelo tijelo",     equipment: "Kardio",          isGlobal: true },
  { id: "g_bike",  name: "Vožnja bicikla",       category: "Cardio", muscleGroup: "Noge",              equipment: "Kardio",          isGlobal: true },
  { id: "g_skip",  name: "Skipping rope",        category: "Cardio", muscleGroup: "Cijelo tijelo",     equipment: "Kardio",          isGlobal: true },
];
