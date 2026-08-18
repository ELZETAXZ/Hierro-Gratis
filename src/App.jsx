import { useState, useMemo, useEffect } from "react";
import {
  Dumbbell, Flame, Activity, User, Target, Calendar,
  ChevronRight, ChevronLeft, Sparkles, RotateCcw, Info,
  Check, Shuffle, TrendingDown, TrendingUp, Utensils, Save
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Meal-idea pools (ejemplos concretos, no exactos en gramos)          */
/* ------------------------------------------------------------------ */
const MEAL_PROTEINS = ["pechuga de pollo a la plancha", "claras de huevo con 1 entero", "atún en agua", "filete de pescado al vapor", "frijoles de la olla", "carne molida magra", "requesón"];
const MEAL_CARBS = ["arroz integral", "tortillas de maíz", "avena", "camote asado", "papa cocida", "quinoa"];
const MEAL_VEGGIES = ["nopales asados", "verduras salteadas", "pico de gallo", "ensalada verde con limón", "verduras al vapor"];
const MEAL_FATS = ["1/4 de aguacate", "un puño de nueces", "1 cda de aceite de oliva", "cacahuates naturales"];
const COLACION_OPTS = ["yogur griego con fruta", "fruta con un puño de nueces", "palomitas naturales + 2 claras cocidas", "jícama con limón, chile y atún"];
const MEAL_SLOTS = ["Desayuno", "Comida", "Cena", "Colación"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildMealIdeas() {
  return MEAL_SLOTS.map((slot) => {
    if (slot === "Colación") return { slot, text: pickRandom(COLACION_OPTS) };
    const items = [pickRandom(MEAL_PROTEINS), pickRandom(MEAL_CARBS), pickRandom(MEAL_VEGGIES), pickRandom(MEAL_FATS)];
    return { slot, text: items.join(" · ") };
  });
}

/* ------------------------------------------------------------------ */
/* Almacenamiento persistente (progreso del usuario, en su propio      */
/* celular/navegador — nadie más lo ve, no requiere servidor)          */
/* ------------------------------------------------------------------ */
const STORAGE_PREFIX = "hierro-gratis:";
async function loadKey(key, fallback) {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    /* si falla (ej. modo privado sin storage), la app sigue funcionando sin persistencia */
  }
}

/* ------------------------------------------------------------------ */
/* Exercise pool                                                       */
/* equipTier: 0 = sin equipo, 1 = básico (mancuernas/bandas), 2 = gym  */
/* levelTier: 0 = principiante, 1 = intermedio, 2 = avanzado           */
/* ------------------------------------------------------------------ */
const POOL = [
  // piernas
  { name: "Sentadilla asistida en silla", group: "piernas", equipTier: 0, levelTier: 0 },
  { name: "Sentadilla sumo", group: "piernas", equipTier: 0, levelTier: 0 },
  { name: "Zancada estática", group: "piernas", equipTier: 0, levelTier: 0 },
  { name: "Puente de glúteo", group: "piernas", equipTier: 0, levelTier: 0 },
  { name: "Elevación de talones", group: "piernas", equipTier: 0, levelTier: 0 },
  { name: "Zancada caminando", group: "piernas", equipTier: 0, levelTier: 1 },
  { name: "Sentadilla búlgara con silla", group: "piernas", equipTier: 0, levelTier: 1 },
  { name: "Sentadilla con salto", group: "piernas", equipTier: 0, levelTier: 1 },
  { name: "Sentadilla pistol asistida", group: "piernas", equipTier: 0, levelTier: 2 },
  { name: "Sentadilla goblet con mancuerna", group: "piernas", equipTier: 1, levelTier: 0 },
  { name: "Peso muerto rumano con mancuernas", group: "piernas", equipTier: 1, levelTier: 1 },
  { name: "Zancada con mancuernas", group: "piernas", equipTier: 1, levelTier: 1 },
  { name: "Sentadilla búlgara con mancuernas", group: "piernas", equipTier: 1, levelTier: 2 },
  { name: "Prensa de piernas", group: "piernas", equipTier: 2, levelTier: 0 },
  { name: "Extensión de cuádriceps en máquina", group: "piernas", equipTier: 2, levelTier: 0 },
  { name: "Sentadilla con barra", group: "piernas", equipTier: 2, levelTier: 1 },
  { name: "Peso muerto convencional", group: "piernas", equipTier: 2, levelTier: 2 },

  // empuje (pecho / hombro / tríceps)
  { name: "Flexión en pared", group: "empuje", equipTier: 0, levelTier: 0 },
  { name: "Flexión de rodillas", group: "empuje", equipTier: 0, levelTier: 0 },
  { name: "Fondos en silla", group: "empuje", equipTier: 0, levelTier: 0 },
  { name: "Flexión completa", group: "empuje", equipTier: 0, levelTier: 1 },
  { name: "Flexión pica (hombros)", group: "empuje", equipTier: 0, levelTier: 1 },
  { name: "Flexión con palmada", group: "empuje", equipTier: 0, levelTier: 2 },
  { name: "Elevaciones laterales con mancuernas", group: "empuje", equipTier: 1, levelTier: 0 },
  { name: "Extensión de tríceps con mancuerna", group: "empuje", equipTier: 1, levelTier: 0 },
  { name: "Press militar con mancuernas", group: "empuje", equipTier: 1, levelTier: 1 },
  { name: "Press banca en piso con mancuernas", group: "empuje", equipTier: 1, levelTier: 1 },
  { name: "Press militar en máquina", group: "empuje", equipTier: 2, levelTier: 0 },
  { name: "Press inclinado con mancuernas", group: "empuje", equipTier: 2, levelTier: 1 },
  { name: "Press banca con barra", group: "empuje", equipTier: 2, levelTier: 1 },
  { name: "Fondos en paralelas", group: "empuje", equipTier: 2, levelTier: 2 },

  // jalón (espalda / bíceps)
  { name: "Superman", group: "jalón", equipTier: 0, levelTier: 0 },
  { name: "Buenos días sin peso", group: "jalón", equipTier: 0, levelTier: 0 },
  { name: "Remo invertido en mesa", group: "jalón", equipTier: 0, levelTier: 1 },
  { name: "Plancha lateral con rotación", group: "jalón", equipTier: 0, levelTier: 1 },
  { name: "Remo con banda elástica", group: "jalón", equipTier: 1, levelTier: 0 },
  { name: "Curl de bíceps con mancuerna", group: "jalón", equipTier: 1, levelTier: 0 },
  { name: "Remo con mancuerna a una mano", group: "jalón", equipTier: 1, levelTier: 1 },
  { name: "Face pull con banda", group: "jalón", equipTier: 1, levelTier: 1 },
  { name: "Jalón al pecho en polea", group: "jalón", equipTier: 2, levelTier: 0 },
  { name: "Remo en polea baja", group: "jalón", equipTier: 2, levelTier: 0 },
  { name: "Remo en máquina", group: "jalón", equipTier: 2, levelTier: 0 },
  { name: "Dominadas asistidas", group: "jalón", equipTier: 2, levelTier: 2 },

  // core
  { name: "Plancha", group: "core", equipTier: 0, levelTier: 0 },
  { name: "Abdominal bicicleta", group: "core", equipTier: 0, levelTier: 0 },
  { name: "Elevación de piernas", group: "core", equipTier: 0, levelTier: 1 },
  { name: "Plancha lateral", group: "core", equipTier: 0, levelTier: 1 },
  { name: "Escaladores (mountain climbers)", group: "core", equipTier: 0, levelTier: 1 },
  { name: "Abdominal en V", group: "core", equipTier: 0, levelTier: 2 },

  // cardio
  { name: "Jumping jacks", group: "cardio", equipTier: 0, levelTier: 0 },
  { name: "Skipping en el lugar", group: "cardio", equipTier: 0, levelTier: 0 },
  { name: "Marcha con rodillas altas", group: "cardio", equipTier: 0, levelTier: 0 },
  { name: "Escaladores rápidos", group: "cardio", equipTier: 0, levelTier: 1 },
  { name: "Burpees", group: "cardio", equipTier: 0, levelTier: 2 },
  { name: "Caminadora inclinada", group: "cardio", equipTier: 2, levelTier: 0 },
  { name: "Bicicleta estática", group: "cardio", equipTier: 2, levelTier: 0 },
  { name: "Elíptica", group: "cardio", equipTier: 2, levelTier: 0 },
];

const EQUIP_TIER = { ninguno: 0, basico: 1, completo: 2 };
const LEVEL_TIER = { principiante: 0, intermedio: 1, avanzado: 2 };
const ACTIVITY_FACTORS = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  activo: 1.725,
  muyActivo: 1.9,
};
const SETSREPS = {
  principiante: { sets: 2, reps: "12-15" },
  intermedio: { sets: 3, reps: "10-12" },
  avanzado: { sets: 4, reps: "8-12" },
};
const CARDIO_MIN = { principiante: 5, intermedio: 8, avanzado: 10 };

function pick(group, count, equipTier, levelTier, exclude) {
  const candidates = POOL.filter(
    (e) =>
      e.group === group &&
      e.equipTier <= equipTier &&
      e.levelTier <= levelTier &&
      !exclude.has(e.name)
  ).sort((a, b) => b.levelTier - a.levelTier);
  const out = [];
  for (const c of candidates) {
    if (out.length >= count) break;
    out.push(c);
    exclude.add(c.name);
  }
  return out;
}

const FOCUS_RECIPE = {
  "Cuerpo completo": [["piernas", 2], ["empuje", 2], ["jalón", 2], ["core", 1]],
  "Tren superior": [["empuje", 3], ["jalón", 3]],
  "Tren inferior": [["piernas", 4], ["core", 2]],
  "Empuje": [["empuje", 4], ["core", 1]],
  "Jalón": [["jalón", 4], ["core", 1]],
  "Piernas": [["piernas", 5]],
  "Cardio y core": [["cardio", 3], ["core", 3]],
};

function splitForDays(days) {
  if (days <= 3) return Array(days).fill("Cuerpo completo");
  if (days === 4) return ["Tren superior", "Tren inferior", "Tren superior", "Tren inferior"];
  if (days === 5) return ["Empuje", "Jalón", "Piernas", "Tren superior", "Cardio y core"];
  return ["Empuje", "Jalón", "Piernas", "Empuje", "Jalón", "Piernas"];
}

function generateWeek({ level, equipment, days, goal }) {
  const equipTier = EQUIP_TIER[equipment];
  const levelTier = LEVEL_TIER[level];
  const template = splitForDays(days);
  const { sets, reps } = SETSREPS[level];

  return template.map((focus, i) => {
    const used = new Set();
    const recipe = FOCUS_RECIPE[focus];
    const exercises = recipe.flatMap(([group, count]) =>
      pick(group, count, equipTier, levelTier, used).map((e) => ({ ...e, sets, reps }))
    );
    const wantsCardioFinisher = goal === "perder" && focus !== "Cardio y core";
    return {
      day: i + 1,
      focus,
      exercises,
      cardioFinisher: wantsCardioFinisher ? CARDIO_MIN[level] : null,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Calorie / macro math                                                */
/* ------------------------------------------------------------------ */
function calcPlan({ sex, age, weight, height, activity, goal }) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  const bmr = sex === "hombre" ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY_FACTORS[activity];

  let target;
  if (goal === "perder") {
    const floor = sex === "hombre" ? 1500 : 1200;
    target = Math.max(tdee - 500, floor);
  } else if (goal === "ganar") {
    target = tdee + 300;
  } else {
    target = tdee;
  }

  const proteinG = Math.round(weight * (goal === "ganar" ? 2.2 : 2.0));
  const fatG = Math.round((target * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((target - proteinG * 4 - fatG * 9) / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    delta: Math.round(target - tdee),
    protein: proteinG,
    fat: fatG,
    carbs: carbsG,
  };
}

/* ------------------------------------------------------------------ */
/* UI bits                                                             */
/* ------------------------------------------------------------------ */
const GOAL_LABEL = { perder: "Perder peso", mantener: "Mantener peso", ganar: "Ganar músculo" };
const ACTIVITY_LABEL = {
  sedentario: "Sedentario (trabajo de oficina, poco movimiento)",
  ligero: "Ligero (1-3 días de actividad/semana)",
  moderado: "Moderado (3-5 días de actividad/semana)",
  activo: "Activo (6-7 días de actividad/semana)",
  muyActivo: "Muy activo (trabajo físico + entrenamiento)",
};

function Plate({ label, grams, kcalShare, color }) {
  const pct = Math.min(100, Math.round(kcalShare * 100));
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="plate">
      <svg viewBox="0 0 100 100" width="104" height="104">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--steel-light)" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="47" textAnchor="middle" className="plate-num">{grams}</text>
        <text x="50" y="63" textAnchor="middle" className="plate-unit">g</text>
      </svg>
      <div className="plate-label">{label}</div>
    </div>
  );
}

export default function FitnessApp() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", age: "", sex: "hombre", weight: "", height: "",
    activity: "sedentario", goal: "perder",
    level: "principiante", equipment: "ninguno", days: 4,
  });
  const [showPlan, setShowPlan] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const [checkingStorage, setCheckingStorage] = useState(true);
  const [savedProfile, setSavedProfile] = useState(null);
  const [weightLog, setWeightLog] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [completed, setCompleted] = useState({});
  const [mealSeed, setMealSeed] = useState(0);

  useEffect(() => {
    (async () => {
      const [profile, log, done] = await Promise.all([
        loadKey("profile", null),
        loadKey("weight-log", []),
        loadKey("completed-days", {}),
      ]);
      if (profile) setSavedProfile(profile);
      setWeightLog(log);
      setCompleted(done);
      setCheckingStorage(false);
    })();
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const continueSaved = () => { setForm(savedProfile); setShowPlan(true); setActiveDay(0); };
  const dismissSaved = () => setSavedProfile(null);

  const createPlan = () => {
    setShowPlan(true);
    setActiveDay(0);
    saveKey("profile", form);
  };

  const addWeightEntry = () => {
    if (!weightInput) return;
    const entry = { date: new Date().toISOString().slice(0, 10), weight: Number(weightInput) };
    const updated = [...weightLog, entry];
    setWeightLog(updated);
    setWeightInput("");
    saveKey("weight-log", updated);
  };

  const toggleCompleted = (dayIndex) => {
    const updated = { ...completed, [dayIndex]: !completed[dayIndex] };
    setCompleted(updated);
    saveKey("completed-days", updated);
  };

  const resetWeek = () => {
    setCompleted({});
    saveKey("completed-days", {});
  };

  const plan = useMemo(() => {
    if (!showPlan) return null;
    const nutrition = calcPlan({
      sex: form.sex, age: Number(form.age), weight: Number(form.weight),
      height: Number(form.height), activity: form.activity, goal: form.goal,
    });
    const week = generateWeek({
      level: form.level, equipment: form.equipment, days: Number(form.days), goal: form.goal,
    });
    return { nutrition, week };
  }, [showPlan, form]);

  const mealIdeas = useMemo(() => (showPlan ? buildMealIdeas() : null), [showPlan, mealSeed]);

  const step1Valid = form.name.trim() && form.age && form.weight && form.height;

  const startOver = () => { setShowPlan(false); setStep(0); setActiveDay(0); };

  const weightTrend = weightLog.length >= 2
    ? Math.round((weightLog[weightLog.length - 1].weight - weightLog[0].weight) * 10) / 10
    : null;
  const completedCount = plan ? plan.week.filter((_, i) => completed[i]).length : 0;

  return (
    <div className="wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        .wrap {
          --ink: #14171a;
          --steel: #1c2024;
          --steel-light: #262b30;
          --line: #333940;
          --text: #f2f0ea;
          --muted: #9aa0a6;
          --primary: #ff5a36;
          --primary-dim: #ff5a3622;
          --protein: #2fd0c4;
          --carbs: #ffc24b;
          --fat: #b586ff;
          background: var(--ink);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          padding: 28px 16px 48px;
        }
        .wrap * { box-sizing: border-box; }
        .display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        .shell { max-width: 640px; margin: 0 auto; }

        .brand { display:flex; align-items:center; gap:10px; margin-bottom: 22px; }
        .brand-badge {
          width:36px; height:36px; border-radius:10px; background:var(--primary);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .brand-title { font-size: 28px; line-height:1; }
        .brand-sub { color:var(--muted); font-size:12px; margin-top:2px; }

        .progress { display:flex; gap:8px; margin-bottom:26px; }
        .progress .dot {
          flex:1; height:6px; border-radius:4px; background:var(--steel-light);
          overflow:hidden; position:relative;
        }
        .progress .dot.done { background: var(--primary); }
        .progress .dot.current::after {
          content:''; position:absolute; inset:0; background:var(--primary); width:50%;
        }

        .card {
          background: var(--steel); border:1px solid var(--line); border-radius:18px;
          padding: 26px 22px;
        }
        .step-title { font-size: 30px; margin: 0 0 4px; }
        .step-desc { color: var(--muted); font-size: 13px; margin: 0 0 22px; }

        .field { margin-bottom: 16px; }
        .field label {
          display:block; font-size:12px; text-transform:uppercase; letter-spacing:.06em;
          color: var(--muted); margin-bottom:6px; font-weight:600;
        }
        .field input, .field select {
          width:100%; background: var(--steel-light); border:1px solid var(--line);
          color: var(--text); padding:11px 12px; border-radius:10px; font-size:15px;
          font-family: inherit; outline:none;
        }
        .field input:focus, .field select:focus { border-color: var(--primary); }
        .row2 { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }

        .choice-grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
        .choice-grid.single { grid-template-columns: 1fr; }
        .choice {
          border:1px solid var(--line); background:var(--steel-light); border-radius:12px;
          padding:12px 14px; cursor:pointer; font-size:14px; font-weight:600;
          transition: border-color .15s, background .15s;
        }
        .choice small { display:block; font-weight:400; color:var(--muted); margin-top:3px; font-size:11.5px; }
        .choice.active { border-color: var(--primary); background: var(--primary-dim); }

        .nav { display:flex; justify-content:space-between; margin-top:24px; gap:10px; }
        .btn {
          display:inline-flex; align-items:center; gap:6px; justify-content:center;
          border:none; border-radius:10px; padding:12px 18px; font-weight:700;
          font-size:14px; cursor:pointer; font-family:inherit;
        }
        .btn-primary { background: var(--primary); color:#fff; }
        .btn-primary:disabled { opacity:.4; cursor:not-allowed; }
        .btn-ghost { background: var(--steel-light); color:var(--text); border:1px solid var(--line); }

        .days-stepper { display:flex; align-items:center; gap:14px; }
        .days-stepper button {
          width:38px; height:38px; border-radius:10px; border:1px solid var(--line);
          background:var(--steel-light); color:var(--text); font-size:18px; cursor:pointer;
        }
        .days-val { font-size:26px; font-family:'JetBrains Mono',monospace; font-weight:700; min-width:26px; text-align:center; }

        /* dashboard */
        .dash-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; }
        .dash-hello { font-size:32px; margin:0; }
        .dash-goal { color:var(--muted); font-size:13px; margin-top:2px; }

        .stat-row { display:grid; grid-template-columns: repeat(3,1fr); gap:10px; margin-bottom:22px; }
        .stat {
          background:var(--steel); border:1px solid var(--line); border-radius:14px; padding:14px;
        }
        .stat-label { font-size:10.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); }
        .stat-value { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; margin-top:4px; }
        .stat-value.accent { color: var(--primary); }

        .plates-card {
          background:var(--steel); border:1px solid var(--line); border-radius:18px;
          padding:20px; margin-bottom:22px;
        }
        .plates-title { font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:14px; font-weight:600; }
        .plates-row { display:flex; justify-content:space-around; }
        .plate { display:flex; flex-direction:column; align-items:center; gap:6px; }
        .plate-num { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; fill: var(--text); }
        .plate-unit { font-size:9px; fill: var(--muted); }
        .plate-label { font-size:12px; color:var(--muted); font-weight:600; }

        .week-title { font-size:24px; margin: 4px 0 12px; }
        .day-tabs { display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; margin-bottom:14px; }
        .day-tab {
          flex-shrink:0; border:1px solid var(--line); background:var(--steel-light); color:var(--muted);
          padding:8px 14px; border-radius:20px; font-size:13px; font-weight:700; cursor:pointer;
          font-family:'JetBrains Mono',monospace;
        }
        .day-tab.active { background:var(--primary); border-color:var(--primary); color:#fff; }

        .day-card { background:var(--steel); border:1px solid var(--line); border-radius:16px; padding:18px; }
        .day-focus { font-size:22px; margin:0 0 12px; }
        .ex-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:10px 0; border-bottom:1px solid var(--line); font-size:14px;
        }
        .ex-row:last-of-type { border-bottom:none; }
        .ex-name { font-weight:600; }
        .ex-scheme { color:var(--muted); font-family:'JetBrains Mono',monospace; font-size:13px; white-space:nowrap; margin-left:10px; }
        .cardio-note {
          margin-top:12px; padding:10px 12px; background:var(--primary-dim); border:1px solid var(--primary);
          border-radius:10px; font-size:13px; display:flex; align-items:center; gap:8px;
        }

        .disclaimer {
          display:flex; gap:8px; color:var(--muted); font-size:11.5px; margin-top:20px; line-height:1.5;
        }
        .reset-row { text-align:center; margin-top:14px; }
        .welcome-card { margin-bottom: 10px; }

        .week-head-row { display:flex; align-items:center; justify-content:space-between; margin: 4px 0 12px; }
        .progress-pill {
          font-family:'JetBrains Mono',monospace; font-size:12px; background:var(--steel-light);
          border:1px solid var(--line); padding:5px 10px; border-radius:20px; color:var(--muted);
        }
        .complete-btn {
          width:100%; margin-top:14px; padding:12px; border-radius:10px; border:1px solid var(--line);
          background:var(--steel-light); color:var(--text); font-weight:700; font-size:13.5px;
          display:flex; align-items:center; justify-content:center; gap:7px; cursor:pointer; font-family:inherit;
        }
        .complete-btn.done { background: var(--primary); border-color:var(--primary); color:#fff; }

        .weight-card {
          background:var(--steel); border:1px solid var(--line); border-radius:16px; padding:18px; margin-top:16px;
        }
        .weight-input-row { display:flex; gap:8px; margin-bottom:12px; }
        .weight-input-row input {
          flex:1; background:var(--steel-light); border:1px solid var(--line); color:var(--text);
          padding:11px 12px; border-radius:10px; font-size:14px; font-family:inherit; outline:none;
        }
        .weight-input-row input:focus { border-color: var(--primary); }
        .trend-pill {
          display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600;
          padding:6px 10px; border-radius:20px; margin-bottom:10px;
        }
        .trend-pill.down { background:#2fd0c422; color:var(--protein); }
        .trend-pill.up { background:#ff5a3622; color:var(--primary); }
        .weight-list { display:flex; flex-direction:column; }
        .weight-item {
          display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--line);
          font-size:13.5px; color:var(--muted);
        }
        .weight-item:last-child { border-bottom:none; }
        .weight-item span:last-child { color:var(--text); }
        .weight-empty { color:var(--muted); font-size:12.5px; line-height:1.5; }

        .meals-card {
          background:var(--steel); border:1px solid var(--line); border-radius:18px; padding:20px; margin-bottom:22px;
        }
        .meals-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .shuffle-btn {
          display:flex; align-items:center; gap:6px; background:var(--steel-light); border:1px solid var(--line);
          color:var(--text); font-size:12px; font-weight:700; padding:6px 10px; border-radius:20px; cursor:pointer;
          font-family:inherit;
        }
        .hand-tip {
          font-size:12px; color:var(--muted); line-height:1.5; background:var(--steel-light);
          border-radius:10px; padding:10px 12px; margin-bottom:12px;
        }
        .meal-row { display:flex; gap:10px; padding:9px 0; border-bottom:1px solid var(--line); font-size:13.5px; }
        .meal-row:last-child { border-bottom:none; }
        .meal-slot { flex-shrink:0; width:78px; font-weight:700; color:var(--primary); font-size:12px; text-transform:uppercase; letter-spacing:.03em; padding-top:1px; }
        .meal-text { color:var(--text); }
      `}</style>

      <div className="shell">
        <div className="brand">
          <div className="brand-badge"><Dumbbell size={20} color="#fff" /></div>
          <div>
            <div className="brand-title display">HIERRO&nbsp;GRATIS</div>
            <div className="brand-sub">Rutina + calorías, sin cuenta, sin cobros</div>
          </div>
        </div>

        {!showPlan && checkingStorage && (
          <div className="card" style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Cargando…
          </div>
        )}

        {!showPlan && !checkingStorage && savedProfile && (
          <div className="card welcome-card">
            <Save size={22} color="var(--primary)" />
            <h2 className="step-title display">Bienvenido de nuevo</h2>
            <p className="step-desc">Tenemos guardados los datos de {savedProfile.name.split(" ")[0]} en este navegador.</p>
            <div className="nav">
              <button className="btn btn-ghost" onClick={dismissSaved}>Empezar de nuevo</button>
              <button className="btn btn-primary" onClick={continueSaved}>Continuar mi plan<ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {!showPlan && !checkingStorage && !savedProfile && (
          <>
            <div className="progress">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`dot ${i < step ? "done" : ""} ${i === step ? "current" : ""}`} />
              ))}
            </div>

            <div className="card">
              {step === 0 && (
                <>
                  <User size={22} color="var(--primary)" />
                  <h2 className="step-title display">Tus datos</h2>
                  <p className="step-desc">Los usamos solo para calcular tu gasto calórico. Nada se guarda en un servidor.</p>
                  <div className="field">
                    <label>Nombre</label>
                    <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="¿Cómo te llamas?" />
                  </div>
                  <div className="row2">
                    <div className="field">
                      <label>Edad</label>
                      <input type="number" min="14" max="90" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="años" />
                    </div>
                    <div className="field">
                      <label>Sexo</label>
                      <select value={form.sex} onChange={(e) => update("sex", e.target.value)}>
                        <option value="hombre">Hombre</option>
                        <option value="mujer">Mujer</option>
                      </select>
                    </div>
                  </div>
                  <div className="row2">
                    <div className="field">
                      <label>Peso (kg)</label>
                      <input type="number" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="kg" />
                    </div>
                    <div className="field">
                      <label>Estatura (cm)</label>
                      <input type="number" value={form.height} onChange={(e) => update("height", e.target.value)} placeholder="cm" />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <Target size={22} color="var(--primary)" />
                  <h2 className="step-title display">Actividad y objetivo</h2>
                  <p className="step-desc">Esto define cuántas calorías necesitas al día.</p>
                  <div className="field">
                    <label>Nivel de actividad diaria (sin contar el ejercicio que vamos a armar)</label>
                    <select value={form.activity} onChange={(e) => update("activity", e.target.value)}>
                      {Object.entries(ACTIVITY_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Objetivo principal</label>
                    <div className="choice-grid single">
                      {Object.entries(GOAL_LABEL).map(([k, v]) => (
                        <div key={k} className={`choice ${form.goal === k ? "active" : ""}`} onClick={() => update("goal", k)}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <Activity size={22} color="var(--primary)" />
                  <h2 className="step-title display">Experiencia y equipo</h2>
                  <p className="step-desc">Ajustamos la dificultad y qué ejercicios te podemos pedir.</p>
                  <div className="field">
                    <label>Nivel de experiencia</label>
                    <div className="choice-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                      {["principiante", "intermedio", "avanzado"].map((l) => (
                        <div key={l} className={`choice ${form.level === l ? "active" : ""}`} onClick={() => update("level", l)} style={{ textAlign: "center", textTransform: "capitalize" }}>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Equipo disponible</label>
                    <div className="choice-grid single">
                      <div className={`choice ${form.equipment === "ninguno" ? "active" : ""}`} onClick={() => update("equipment", "ninguno")}>
                        Ninguno <small>Solo peso corporal</small>
                      </div>
                      <div className={`choice ${form.equipment === "basico" ? "active" : ""}`} onClick={() => update("equipment", "basico")}>
                        Básico <small>Mancuernas y/o bandas</small>
                      </div>
                      <div className={`choice ${form.equipment === "completo" ? "active" : ""}`} onClick={() => update("equipment", "completo")}>
                        Completo <small>Acceso a gimnasio</small>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label>Días por semana</label>
                    <div className="days-stepper">
                      <button type="button" onClick={() => update("days", Math.max(3, form.days - 1))}>−</button>
                      <div className="days-val mono">{form.days}</div>
                      <button type="button" onClick={() => update("days", Math.min(6, form.days + 1))}>+</button>
                    </div>
                  </div>
                </>
              )}

              <div className="nav">
                {step > 0 ? (
                  <button className="btn btn-ghost" onClick={() => setStep(step - 1)}><ChevronLeft size={16} />Atrás</button>
                ) : <div />}
                {step < 2 && (
                  <button className="btn btn-primary" disabled={step === 0 && !step1Valid} onClick={() => setStep(step + 1)}>
                    Siguiente<ChevronRight size={16} />
                  </button>
                )}
                {step === 2 && (
                  <button className="btn btn-primary" onClick={createPlan}>
                    <Sparkles size={16} />Crear mi plan
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {showPlan && plan && (
          <>
            <div className="dash-head">
              <div>
                <h2 className="dash-hello display">Tu plan, {form.name.split(" ")[0]}</h2>
                <div className="dash-goal">{GOAL_LABEL[form.goal]} · {form.days} días/semana · nivel {form.level}</div>
              </div>
              <Flame size={26} color="var(--primary)" />
            </div>

            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">Mantenimiento</div>
                <div className="stat-value mono">{plan.nutrition.tdee}<span style={{ fontSize: 12 }}> kcal</span></div>
              </div>
              <div className="stat">
                <div className="stat-label">Objetivo diario</div>
                <div className="stat-value accent mono">{plan.nutrition.target}<span style={{ fontSize: 12 }}> kcal</span></div>
              </div>
              <div className="stat">
                <div className="stat-label">{plan.nutrition.delta <= 0 ? "Déficit" : "Superávit"}</div>
                <div className="stat-value mono">{Math.abs(plan.nutrition.delta)}<span style={{ fontSize: 12 }}> kcal</span></div>
              </div>
            </div>

            <div className="plates-card">
              <div className="plates-title">Macros sugeridos por día</div>
              <div className="plates-row">
                <Plate label="Proteína" grams={plan.nutrition.protein} kcalShare={(plan.nutrition.protein * 4) / plan.nutrition.target} color="var(--protein)" />
                <Plate label="Carbos" grams={plan.nutrition.carbs} kcalShare={(plan.nutrition.carbs * 4) / plan.nutrition.target} color="var(--carbs)" />
                <Plate label="Grasas" grams={plan.nutrition.fat} kcalShare={(plan.nutrition.fat * 9) / plan.nutrition.target} color="var(--fat)" />
              </div>
            </div>

            <div className="meals-card">
              <div className="meals-head">
                <div className="plates-title" style={{ marginBottom: 0 }}><Utensils size={13} style={{ verticalAlign: -2, marginRight: 5 }} />Ideas de comidas de hoy</div>
                <button className="shuffle-btn" onClick={() => setMealSeed((s) => s + 1)}><Shuffle size={13} />Otras ideas</button>
              </div>
              <div className="hand-tip">
                Referencia rápida sin pesar todo: proteína ≈ una palma de tu mano, carbohidrato ≈ un puño, verdura ≈ libre, grasa ≈ un pulgar. Ajusta las porciones para acercarte a los macros de arriba.
              </div>
              {mealIdeas.map((m) => (
                <div className="meal-row" key={m.slot}>
                  <span className="meal-slot">{m.slot}</span>
                  <span className="meal-text">{m.text}</span>
                </div>
              ))}
            </div>

            <div className="week-head-row">
              <h3 className="week-title display" style={{ marginBottom: 0 }}>Tu semana de entrenamiento</h3>
              <span className="progress-pill">{completedCount}/{plan.week.length} completados</span>
            </div>
            <div className="day-tabs">
              {plan.week.map((d, i) => (
                <button key={i} className={`day-tab ${activeDay === i ? "active" : ""}`} onClick={() => setActiveDay(i)}>
                  DÍA {d.day}
                </button>
              ))}
            </div>

            <div className="day-card">
              <h4 className="day-focus display">{plan.week[activeDay].focus}</h4>
              {plan.week[activeDay].exercises.map((ex, i) => (
                <div className="ex-row" key={i}>
                  <span className="ex-name">{ex.name}</span>
                  <span className="ex-scheme">{ex.sets}×{ex.reps}</span>
                </div>
              ))}
              {plan.week[activeDay].cardioFinisher && (
                <div className="cardio-note">
                  <Flame size={14} />
                  Cierra con {plan.week[activeDay].cardioFinisher} min de cardio continuo (caminata rápida, escaladores o saltos, a tu ritmo).
                </div>
              )}
              <button
                className={`complete-btn ${completed[activeDay] ? "done" : ""}`}
                onClick={() => toggleCompleted(activeDay)}
              >
                <Check size={14} />
                {completed[activeDay] ? "Día completado" : "Marcar día como completado"}
              </button>
            </div>

            {completedCount > 0 && (
              <div className="reset-row">
                <button className="btn btn-ghost" onClick={resetWeek}><RotateCcw size={13} />Reiniciar semana</button>
              </div>
            )}

            <div className="weight-card">
              <div className="plates-title">Seguimiento de peso</div>
              <div className="weight-input-row">
                <input
                  type="number"
                  placeholder="Peso de hoy (kg)"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
                <button className="btn btn-primary" onClick={addWeightEntry}>Guardar</button>
              </div>
              {weightLog.length > 0 ? (
                <>
                  {weightTrend !== null && (
                    <div className={`trend-pill ${weightTrend <= 0 ? "down" : "up"}`}>
                      {weightTrend <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      {Math.abs(weightTrend)} kg desde tu primer registro
                    </div>
                  )}
                  <div className="weight-list">
                    {[...weightLog].reverse().slice(0, 6).map((w, i) => (
                      <div className="weight-item" key={i}>
                        <span>{w.date}</span>
                        <span className="mono">{w.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="weight-empty">Aún no tienes registros. Pésate una vez por semana, siempre en las mismas condiciones, para ver tu tendencia real.</div>
              )}
            </div>

            <div className="disclaimer">
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              Esta es una guía general calculada con fórmulas estándar (Mifflin-St Jeor). No sustituye la valoración de un médico o nutriólogo, sobre todo si tienes alguna condición de salud.
            </div>

            <div className="reset-row">
              <button className="btn btn-ghost" onClick={startOver}><RotateCcw size={14} />Editar mis datos</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
