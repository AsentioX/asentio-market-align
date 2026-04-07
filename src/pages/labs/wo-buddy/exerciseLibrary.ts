// Comprehensive Exercise Library with structured metadata
// Each exercise has category, metrics, purpose tags, and goal connections

export type ExerciseCategory = 'endurance' | 'strength' | 'bodyweight' | 'agility' | 'power' | 'mobility' | 'recovery' | 'sport_specific';

export type MetricType = 'numeric' | 'time' | 'distance' | 'dropdown' | 'tags';

export interface ExerciseMetric {
  key: string;
  label: string;
  type: MetricType;
  unit?: string;
  required?: boolean;
  options?: string[]; // for dropdowns
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  subcategory: string;
  icon: string;
  description: string;
  defaultMetrics: ExerciseMetric[];
  optionalMetrics: ExerciseMetric[];
  purposeTags: string[];
  linkedOutcomes: string[];
  linkedDrivers: string[];
  whyItMatters: string;
  shortTermBenefit: string;
  longTermBenefit: string;
  entryType: 'sets' | 'intervals' | 'duration' | 'simple';
  color: string;
}

export const CATEGORY_CONFIG: Record<ExerciseCategory, { label: string; icon: string; color: string; bg: string; border: string }> = {
  endurance: { label: 'Endurance', icon: '🫁', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/20' },
  strength: { label: 'Strength', icon: '🏋️', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
  bodyweight: { label: 'Bodyweight', icon: '💪', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/20' },
  agility: { label: 'Agility', icon: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/20' },
  power: { label: 'Power', icon: '💥', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/20' },
  mobility: { label: 'Mobility', icon: '🧘', color: 'text-teal-400', bg: 'bg-teal-500/15', border: 'border-teal-500/20' },
  recovery: { label: 'Recovery', icon: '♻️', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  sport_specific: { label: 'Sport-Specific', icon: '🎯', color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/20' },
};

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  // ── ENDURANCE ──────────────────────────────
  {
    id: 'running',
    name: 'Running',
    category: 'endurance',
    subcategory: 'Cardiovascular',
    icon: '🏃',
    description: 'Steady-state or tempo running for aerobic conditioning.',
    defaultMetrics: [
      { key: 'distance', label: 'Distance', type: 'distance', unit: 'mi', required: true, step: 0.1 },
      { key: 'time', label: 'Time', type: 'time', unit: 'min', required: true },
      { key: 'pace', label: 'Pace', type: 'time', unit: 'min/mi' },
    ],
    optionalMetrics: [
      { key: 'elevation', label: 'Elevation', type: 'numeric', unit: 'ft' },
      { key: 'heart_rate', label: 'Avg Heart Rate', type: 'numeric', unit: 'bpm' },
      { key: 'cadence', label: 'Cadence', type: 'numeric', unit: 'spm' },
    ],
    purposeTags: ['aerobic base', 'fat oxidation', 'mental toughness'],
    linkedOutcomes: ['improved VO2max', 'faster mile time', 'weight management'],
    linkedDrivers: ['Endurance', 'Efficiency'],
    whyItMatters: 'Running builds aerobic capacity and cardiovascular efficiency, which is the foundation for all athletic performance.',
    shortTermBenefit: 'Improves cardiovascular conditioning and energy levels within 2-4 weeks.',
    longTermBenefit: 'Builds a powerful aerobic engine that supports recovery, endurance sports, and overall longevity.',
    entryType: 'simple',
    color: 'from-orange-500/20 to-orange-600/5',
  },
  {
    id: 'sprint_intervals',
    name: 'Sprint Intervals',
    category: 'endurance',
    subcategory: 'High Intensity',
    icon: '⚡',
    description: 'High-intensity sprint intervals with rest periods.',
    defaultMetrics: [
      { key: 'interval_distance', label: 'Distance/Interval', type: 'distance', unit: 'm', required: true, defaultValue: 200 },
      { key: 'interval_time', label: 'Time/Interval', type: 'time', unit: 'sec', required: true },
      { key: 'rest_time', label: 'Rest Time', type: 'time', unit: 'sec', required: true, defaultValue: 60 },
      { key: 'total_sets', label: 'Total Sets', type: 'numeric', required: true, defaultValue: 6 },
    ],
    optionalMetrics: [
      { key: 'heart_rate', label: 'Peak Heart Rate', type: 'numeric', unit: 'bpm' },
    ],
    purposeTags: ['speed development', 'anaerobic capacity', 'lactate tolerance'],
    linkedOutcomes: ['faster sprint speed', 'improved power output', 'better acceleration'],
    linkedDrivers: ['Power', 'Endurance'],
    whyItMatters: 'Sprint intervals develop anaerobic capacity and neuromuscular power, improving your ability to produce force at high speeds.',
    shortTermBenefit: 'Increases top-end speed and improves lactate clearance within 3-6 sessions.',
    longTermBenefit: 'Develops explosive speed and power that transfers to all sports requiring bursts of acceleration.',
    entryType: 'intervals',
    color: 'from-yellow-500/20 to-yellow-600/5',
  },
  {
    id: 'cycling',
    name: 'Cycling',
    category: 'endurance',
    subcategory: 'Cardiovascular',
    icon: '🚴',
    description: 'Indoor or outdoor cycling for endurance and leg strength.',
    defaultMetrics: [
      { key: 'distance', label: 'Distance', type: 'distance', unit: 'mi', required: true },
      { key: 'time', label: 'Time', type: 'time', unit: 'min', required: true },
    ],
    optionalMetrics: [
      { key: 'cadence', label: 'Cadence', type: 'numeric', unit: 'rpm' },
      { key: 'power', label: 'Avg Power', type: 'numeric', unit: 'W' },
      { key: 'elevation', label: 'Elevation', type: 'numeric', unit: 'ft' },
      { key: 'heart_rate', label: 'Avg Heart Rate', type: 'numeric', unit: 'bpm' },
    ],
    purposeTags: ['aerobic endurance', 'leg endurance', 'low impact'],
    linkedOutcomes: ['improved cycling FTP', 'better leg endurance', 'cardiovascular health'],
    linkedDrivers: ['Endurance', 'Efficiency'],
    whyItMatters: 'Cycling builds aerobic endurance with lower joint impact, making it ideal for cross-training and recovery rides.',
    shortTermBenefit: 'Improves leg endurance and aerobic capacity without high joint stress.',
    longTermBenefit: 'Builds a sustainable aerobic base that supports multi-sport performance and active recovery.',
    entryType: 'simple',
    color: 'from-green-500/20 to-green-600/5',
  },
  {
    id: 'rowing',
    name: 'Rowing',
    category: 'endurance',
    subcategory: 'Full Body Cardio',
    icon: '🚣',
    description: 'Indoor rowing for full-body endurance and power.',
    defaultMetrics: [
      { key: 'distance', label: 'Distance', type: 'distance', unit: 'm', required: true },
      { key: 'time', label: 'Time', type: 'time', unit: 'min', required: true },
      { key: 'split', label: 'Split /500m', type: 'time', unit: 'min:sec' },
    ],
    optionalMetrics: [
      { key: 'stroke_rate', label: 'Stroke Rate', type: 'numeric', unit: 'spm' },
      { key: 'heart_rate', label: 'Avg Heart Rate', type: 'numeric', unit: 'bpm' },
    ],
    purposeTags: ['full body endurance', 'pacing', 'power endurance'],
    linkedOutcomes: ['faster 2k row', 'improved aerobic power', 'better pacing ability'],
    linkedDrivers: ['Endurance', 'Power'],
    whyItMatters: 'Rowing intervals improve aerobic endurance and pacing ability, which directly supports a faster 2k row and overall conditioning.',
    shortTermBenefit: 'Develops rowing technique and aerobic power within 2-3 weeks of consistent training.',
    longTermBenefit: 'Builds world-class cardiovascular endurance and full-body pulling power over months of training.',
    entryType: 'intervals',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    category: 'endurance',
    subcategory: 'Aquatic',
    icon: '🏊',
    description: 'Pool or open-water swimming for full-body conditioning.',
    defaultMetrics: [
      { key: 'distance', label: 'Distance', type: 'distance', unit: 'm', required: true },
      { key: 'time', label: 'Time', type: 'time', unit: 'min', required: true },
    ],
    optionalMetrics: [
      { key: 'stroke_type', label: 'Stroke Type', type: 'dropdown', options: ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Mixed'] },
      { key: 'lap_splits', label: 'Lap Splits', type: 'tags' },
    ],
    purposeTags: ['full body conditioning', 'low impact', 'breath control'],
    linkedOutcomes: ['improved swim times', 'better breath control', 'full-body conditioning'],
    linkedDrivers: ['Endurance', 'Technique'],
    whyItMatters: 'Swimming provides full-body conditioning with zero impact, building aerobic capacity and breath control simultaneously.',
    shortTermBenefit: 'Improves cardiovascular fitness and upper body endurance quickly.',
    longTermBenefit: 'Develops exceptional cardiovascular conditioning and joint-friendly fitness that supports longevity.',
    entryType: 'intervals',
    color: 'from-cyan-500/20 to-cyan-600/5',
  },
  {
    id: 'jump_rope',
    name: 'Jump Rope',
    category: 'endurance',
    subcategory: 'Conditioning',
    icon: '⏭️',
    description: 'Jump rope for coordination, conditioning, and footwork.',
    defaultMetrics: [
      { key: 'duration', label: 'Duration', type: 'time', unit: 'min', required: true },
      { key: 'jump_count', label: 'Jump Count', type: 'numeric', required: true },
    ],
    optionalMetrics: [
      { key: 'intensity', label: 'Intensity', type: 'dropdown', options: ['Light', 'Moderate', 'High', 'Max'] },
    ],
    purposeTags: ['coordination', 'conditioning', 'footwork'],
    linkedOutcomes: ['improved footwork', 'better conditioning', 'weight management'],
    linkedDrivers: ['Endurance', 'Efficiency'],
    whyItMatters: 'Jump rope develops coordination, foot speed, and cardiovascular endurance in a time-efficient format.',
    shortTermBenefit: 'Quickly improves coordination and gets the heart rate up for effective conditioning.',
    longTermBenefit: 'Builds fast feet, rhythm, and sustained endurance that transfers to boxing, basketball, and combat sports.',
    entryType: 'simple',
    color: 'from-pink-500/20 to-pink-600/5',
  },
  {
    id: 'stair_climbing',
    name: 'Stair Climbing',
    category: 'endurance',
    subcategory: 'Conditioning',
    icon: '🪜',
    description: 'Climbing stairs or using a stair machine for leg endurance.',
    defaultMetrics: [
      { key: 'floors', label: 'Floors / Steps', type: 'numeric', required: true },
      { key: 'time', label: 'Time', type: 'time', unit: 'min', required: true },
    ],
    optionalMetrics: [
      { key: 'pace', label: 'Pace', type: 'numeric', unit: 'floors/min' },
    ],
    purposeTags: ['leg endurance', 'glute activation', 'vertical power'],
    linkedOutcomes: ['stronger legs', 'improved climbing ability', 'better conditioning'],
    linkedDrivers: ['Endurance', 'Strength'],
    whyItMatters: 'Stair climbing targets the glutes, quads, and calves while building cardiovascular endurance under load.',
    shortTermBenefit: 'Builds leg endurance and glute activation within a few sessions.',
    longTermBenefit: 'Develops powerful legs and sustained endurance for hiking, mountaineering, and general fitness.',
    entryType: 'simple',
    color: 'from-amber-500/20 to-amber-600/5',
  },

  // ── STRENGTH ──────────────────────────────
  {
    id: 'squats',
    name: 'Squats',
    category: 'strength',
    subcategory: 'Lower Body',
    icon: '🦵',
    description: 'Barbell back squats for lower body strength and power.',
    defaultMetrics: [
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 4 },
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 8 },
      { key: 'weight', label: 'Weight', type: 'numeric', unit: 'lbs', required: true },
    ],
    optionalMetrics: [
      { key: 'tempo', label: 'Tempo', type: 'dropdown', options: ['Normal', '3-1-1', '4-0-1', '2-2-2'] },
      { key: 'bar_speed', label: 'Bar Speed', type: 'dropdown', options: ['Slow', 'Moderate', 'Fast', 'Explosive'] },
    ],
    purposeTags: ['lower body strength', 'force production', 'functional movement'],
    linkedOutcomes: ['increased squat max', 'better sprint speed', 'improved jumping', 'rowing drive'],
    linkedDrivers: ['Strength', 'Power', 'Stability'],
    whyItMatters: 'Squats improve lower body strength and force production, which can support sprint speed, jumping, and rowing drive.',
    shortTermBenefit: 'Builds foundational leg strength and improves movement patterns within 2-4 weeks.',
    longTermBenefit: 'Develops maximal lower body strength that transfers to virtually every athletic movement.',
    entryType: 'sets',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    category: 'strength',
    subcategory: 'Full Body',
    icon: '⬆️',
    description: 'Conventional or sumo deadlifts for posterior chain strength.',
    defaultMetrics: [
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 5 },
      { key: 'weight', label: 'Weight', type: 'numeric', unit: 'lbs', required: true },
    ],
    optionalMetrics: [
      { key: 'bar_speed', label: 'Bar Speed', type: 'dropdown', options: ['Slow', 'Moderate', 'Fast'] },
    ],
    purposeTags: ['posterior chain', 'grip strength', 'total body strength'],
    linkedOutcomes: ['stronger back', 'improved posture', 'greater pulling power'],
    linkedDrivers: ['Strength', 'Power'],
    whyItMatters: 'Deadlifts develop the entire posterior chain — glutes, hamstrings, and back — building raw pulling power and injury resilience.',
    shortTermBenefit: 'Rapidly builds grip strength and posterior chain activation.',
    longTermBenefit: 'Creates a bulletproof back and hips that support heavy lifting, sports performance, and injury prevention.',
    entryType: 'sets',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    category: 'strength',
    subcategory: 'Upper Body',
    icon: '🏋️',
    description: 'Barbell bench press for chest, shoulder, and tricep strength.',
    defaultMetrics: [
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 4 },
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 8 },
      { key: 'weight', label: 'Weight', type: 'numeric', unit: 'lbs', required: true },
    ],
    optionalMetrics: [
      { key: 'grip', label: 'Grip Width', type: 'dropdown', options: ['Narrow', 'Standard', 'Wide'] },
    ],
    purposeTags: ['upper body push', 'chest strength', 'pressing power'],
    linkedOutcomes: ['increased bench max', 'stronger pushing', 'upper body mass'],
    linkedDrivers: ['Strength', 'Power'],
    whyItMatters: 'Bench press builds upper body pressing strength, essential for contact sports, throwing, and general functional fitness.',
    shortTermBenefit: 'Quickly builds chest, shoulder, and tricep strength.',
    longTermBenefit: 'Develops elite upper body pressing power and muscle mass over time.',
    entryType: 'sets',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    category: 'strength',
    subcategory: 'Upper Body',
    icon: '🙆',
    description: 'Standing barbell or dumbbell overhead press.',
    defaultMetrics: [
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 8 },
      { key: 'weight', label: 'Weight', type: 'numeric', unit: 'lbs', required: true },
    ],
    optionalMetrics: [],
    purposeTags: ['shoulder strength', 'overhead stability', 'core bracing'],
    linkedOutcomes: ['stronger shoulders', 'better overhead stability', 'improved posture'],
    linkedDrivers: ['Strength', 'Stability'],
    whyItMatters: 'Overhead pressing builds shoulder strength and core stability, critical for overhead athletes and general upper body function.',
    shortTermBenefit: 'Strengthens shoulders and improves overhead stability quickly.',
    longTermBenefit: 'Develops balanced shoulder strength and postural control that prevents injuries.',
    entryType: 'sets',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    category: 'strength',
    subcategory: 'Lower Body',
    icon: '🦿',
    description: 'Walking or stationary lunges for unilateral leg strength.',
    defaultMetrics: [
      { key: 'reps_per_leg', label: 'Reps/Leg', type: 'numeric', required: true, defaultValue: 10 },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
      { key: 'weight', label: 'Weight', type: 'numeric', unit: 'lbs' },
    ],
    optionalMetrics: [],
    purposeTags: ['unilateral strength', 'balance', 'hip stability'],
    linkedOutcomes: ['better single-leg strength', 'improved balance', 'reduced imbalances'],
    linkedDrivers: ['Strength', 'Stability'],
    whyItMatters: 'Lunges address muscle imbalances between legs and build single-leg strength critical for running and cutting movements.',
    shortTermBenefit: 'Improves balance and identifies strength imbalances between legs.',
    longTermBenefit: 'Builds bulletproof single-leg strength that prevents injuries and improves athletic agility.',
    entryType: 'sets',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    id: 'leg_press',
    name: 'Leg Press',
    category: 'strength',
    subcategory: 'Lower Body',
    icon: '🦵',
    description: 'Machine leg press for quad and glute development.',
    defaultMetrics: [
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 4 },
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 10 },
      { key: 'weight', label: 'Weight', type: 'numeric', unit: 'lbs', required: true },
    ],
    optionalMetrics: [],
    purposeTags: ['quad development', 'leg volume', 'safe loading'],
    linkedOutcomes: ['stronger legs', 'more leg volume', 'quad hypertrophy'],
    linkedDrivers: ['Strength'],
    whyItMatters: 'Leg press allows you to safely load the legs with higher volume than squats, building muscle size and endurance.',
    shortTermBenefit: 'Adds training volume for the legs in a safe, controlled movement.',
    longTermBenefit: 'Builds significant leg muscle mass and endurance that supports heavier squats and athletic performance.',
    entryType: 'sets',
    color: 'from-blue-500/20 to-blue-600/5',
  },

  // ── BODYWEIGHT ──────────────────────────────
  {
    id: 'pull_ups',
    name: 'Pull-Ups',
    category: 'bodyweight',
    subcategory: 'Upper Body',
    icon: '🧗',
    description: 'Bodyweight pull-ups for back and bicep strength.',
    defaultMetrics: [
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 8 },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
    ],
    optionalMetrics: [
      { key: 'added_weight', label: 'Added Weight', type: 'numeric', unit: 'lbs' },
      { key: 'assisted_weight', label: 'Assisted Weight', type: 'numeric', unit: 'lbs' },
    ],
    purposeTags: ['back strength', 'grip strength', 'upper body pull'],
    linkedOutcomes: ['more pull-up reps', 'wider back', 'better grip'],
    linkedDrivers: ['Strength'],
    whyItMatters: 'Pull-ups are the gold standard for upper body pulling strength, building the lats, biceps, and grip simultaneously.',
    shortTermBenefit: 'Builds relative body strength and back width quickly.',
    longTermBenefit: 'Develops elite pulling strength and upper body muscle that transfers to climbing, swimming, and martial arts.',
    entryType: 'sets',
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    id: 'push_ups',
    name: 'Push-Ups',
    category: 'bodyweight',
    subcategory: 'Upper Body',
    icon: '💪',
    description: 'Bodyweight push-ups for chest and tricep endurance.',
    defaultMetrics: [
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 20 },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
    ],
    optionalMetrics: [
      { key: 'tempo', label: 'Tempo', type: 'dropdown', options: ['Normal', 'Slow', 'Explosive', 'Pause'] },
    ],
    purposeTags: ['muscular endurance', 'pushing endurance', 'core stability'],
    linkedOutcomes: ['more push-up reps', 'upper body endurance', 'posture improvement'],
    linkedDrivers: ['Endurance', 'Stability'],
    whyItMatters: 'Push-ups improve upper body muscular endurance, which supports contact tolerance, posture, and general work capacity.',
    shortTermBenefit: 'Builds pushing endurance and activates chest and core effectively.',
    longTermBenefit: 'Develops high-rep upper body endurance and postural strength that supports all pressing movements.',
    entryType: 'sets',
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    id: 'sit_ups',
    name: 'Sit-Ups / Crunches',
    category: 'bodyweight',
    subcategory: 'Core',
    icon: '🔄',
    description: 'Core exercises for abdominal strength and stability.',
    defaultMetrics: [
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 25 },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
    ],
    optionalMetrics: [],
    purposeTags: ['core strength', 'abdominal endurance', 'trunk stability'],
    linkedOutcomes: ['stronger core', 'better posture', 'improved stability'],
    linkedDrivers: ['Stability'],
    whyItMatters: 'Core exercises build the foundation of trunk stability that supports every compound lift and athletic movement.',
    shortTermBenefit: 'Activates and strengthens the abdominals and hip flexors.',
    longTermBenefit: 'Builds core endurance and stability that protects the spine and improves all movement quality.',
    entryType: 'sets',
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'bodyweight',
    subcategory: 'Core',
    icon: '🧱',
    description: 'Isometric plank hold for deep core stabilization.',
    defaultMetrics: [
      { key: 'duration', label: 'Duration', type: 'time', unit: 'sec', required: true, defaultValue: 60 },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
    ],
    optionalMetrics: [],
    purposeTags: ['core stability', 'anti-extension', 'isometric strength'],
    linkedOutcomes: ['longer plank hold', 'better core stability', 'spinal health'],
    linkedDrivers: ['Stability'],
    whyItMatters: 'Planks train the core in an anti-extension pattern, building the deep stabilizers that protect your spine under load.',
    shortTermBenefit: 'Improves core endurance and body awareness immediately.',
    longTermBenefit: 'Develops deep core stability that supports heavy lifting and prevents back injuries.',
    entryType: 'duration',
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'bodyweight',
    subcategory: 'Full Body',
    icon: '🔥',
    description: 'Full-body explosive conditioning movement.',
    defaultMetrics: [
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 15 },
      { key: 'time', label: 'Time', type: 'time', unit: 'sec' },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 3 },
    ],
    optionalMetrics: [],
    purposeTags: ['conditioning', 'full body power', 'metabolic'],
    linkedOutcomes: ['improved conditioning', 'better work capacity', 'weight management'],
    linkedDrivers: ['Endurance', 'Power'],
    whyItMatters: 'Burpees combine strength and cardio in one explosive movement, building total-body conditioning and mental resilience.',
    shortTermBenefit: 'Spikes heart rate and builds conditioning rapidly.',
    longTermBenefit: 'Develops world-class conditioning and work capacity that transfers to every sport.',
    entryType: 'sets',
    color: 'from-purple-500/20 to-purple-600/5',
  },

  // ── POWER ──────────────────────────────
  {
    id: 'box_jumps',
    name: 'Box Jumps',
    category: 'power',
    subcategory: 'Plyometrics',
    icon: '📦',
    description: 'Explosive box jumps for lower body power.',
    defaultMetrics: [
      { key: 'reps', label: 'Reps', type: 'numeric', required: true, defaultValue: 8 },
      { key: 'box_height', label: 'Box Height', type: 'numeric', unit: 'in', required: true, defaultValue: 24 },
      { key: 'sets', label: 'Sets', type: 'numeric', required: true, defaultValue: 4 },
    ],
    optionalMetrics: [],
    purposeTags: ['explosive power', 'vertical jump', 'plyometrics'],
    linkedOutcomes: ['higher vertical jump', 'better explosiveness', 'improved sprint start'],
    linkedDrivers: ['Power', 'Strength'],
    whyItMatters: 'Box jumps develop explosive lower body power and fast-twitch muscle recruitment, critical for jumping, sprinting, and change of direction.',
    shortTermBenefit: 'Builds explosive takeoff power and improves neuromuscular firing rate.',
    longTermBenefit: 'Develops elite vertical jump power and reactive strength that dominates in basketball, volleyball, and football.',
    entryType: 'sets',
    color: 'from-red-500/20 to-red-600/5',
  },

  // ── AGILITY ──────────────────────────────
  {
    id: 'shuttle_runs',
    name: 'Shuttle Runs',
    category: 'agility',
    subcategory: 'Speed & Agility',
    icon: '↔️',
    description: 'Short-distance shuttle runs for agility and change of direction.',
    defaultMetrics: [
      { key: 'distance', label: 'Distance', type: 'distance', unit: 'm', required: true, defaultValue: 20 },
      { key: 'time', label: 'Time', type: 'time', unit: 'sec', required: true },
      { key: 'rest_intervals', label: 'Rest', type: 'time', unit: 'sec', defaultValue: 30 },
    ],
    optionalMetrics: [
      { key: 'total_sets', label: 'Total Sets', type: 'numeric', defaultValue: 6 },
    ],
    purposeTags: ['agility', 'change of direction', 'acceleration'],
    linkedOutcomes: ['faster shuttle time', 'better agility', 'improved deceleration'],
    linkedDrivers: ['Power', 'Endurance'],
    whyItMatters: 'Shuttle runs train deceleration, change of direction, and re-acceleration — the movements that define most team sports.',
    shortTermBenefit: 'Improves lateral quickness and change-of-direction speed.',
    longTermBenefit: 'Develops elite agility and reactive speed that separates good athletes from great ones.',
    entryType: 'intervals',
    color: 'from-yellow-500/20 to-yellow-600/5',
  },
];

// Helper to find exercise by ID or name
export function findExercise(idOrName: string): ExerciseDefinition | undefined {
  return EXERCISE_LIBRARY.find(e => e.id === idOrName || e.name.toLowerCase() === idOrName.toLowerCase());
}

// Helper to get exercises by category
export function getExercisesByCategory(category: ExerciseCategory): ExerciseDefinition[] {
  return EXERCISE_LIBRARY.filter(e => e.category === category);
}

// Helper to get all categories with exercise counts
export function getCategoryCounts(): Record<ExerciseCategory, number> {
  const counts = {} as Record<ExerciseCategory, number>;
  for (const cat of Object.keys(CATEGORY_CONFIG) as ExerciseCategory[]) {
    counts[cat] = EXERCISE_LIBRARY.filter(e => e.category === cat).length;
  }
  return counts;
}

// Sample goals for seeding
export const SAMPLE_GOALS = [
  { name: 'Improve 2K Row from 8:00 to 7:30', category: 'performance', metric: 'time', target: 450, current: 480, drivers: ['Endurance', 'Power'], deadline: '2026-08-01' },
  { name: 'Squat 225 lbs', category: 'capacity', metric: 'weight', target: 225, current: 185, drivers: ['Strength', 'Power'], deadline: '2026-07-01' },
  { name: 'Run a 7-minute mile', category: 'performance', metric: 'time', target: 7, current: 8.2, drivers: ['Endurance', 'Efficiency'], deadline: '2026-09-01' },
  { name: '50 Push-ups Unbroken', category: 'capacity', metric: 'reps', target: 50, current: 32, drivers: ['Endurance', 'Stability'], deadline: '2026-06-15' },
];

// RPE scale
export const RPE_SCALE = [
  { value: 1, label: 'Very Light', color: 'text-emerald-400' },
  { value: 2, label: 'Light', color: 'text-emerald-400' },
  { value: 3, label: 'Light', color: 'text-green-400' },
  { value: 4, label: 'Moderate', color: 'text-green-400' },
  { value: 5, label: 'Moderate', color: 'text-yellow-400' },
  { value: 6, label: 'Hard', color: 'text-yellow-400' },
  { value: 7, label: 'Hard', color: 'text-orange-400' },
  { value: 8, label: 'Very Hard', color: 'text-orange-400' },
  { value: 9, label: 'Near Max', color: 'text-red-400' },
  { value: 10, label: 'Max Effort', color: 'text-red-500' },
];
