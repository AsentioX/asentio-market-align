// Vibin design tokens (scoped to /labs/vibin via inline class strings)
// Vibrant Pinterest/Spotify aesthetic — coral, electric purple, sunset gradients

export const vibinTheme = {
  // Gradients
  gradientHero: 'bg-gradient-to-br from-[hsl(340_95%_60%)] via-[hsl(280_90%_55%)] to-[hsl(220_95%_55%)]',
  gradientWarm: 'bg-gradient-to-br from-[hsl(15_95%_60%)] via-[hsl(340_90%_60%)] to-[hsl(290_85%_55%)]',
  gradientCool: 'bg-gradient-to-br from-[hsl(190_90%_55%)] via-[hsl(220_90%_55%)] to-[hsl(280_85%_55%)]',
  gradientFood: 'bg-gradient-to-br from-[hsl(25_95%_55%)] to-[hsl(355_90%_55%)]',
  gradientPlace: 'bg-gradient-to-br from-[hsl(200_95%_55%)] to-[hsl(170_85%_45%)]',
  gradientExperience: 'bg-gradient-to-br from-[hsl(280_90%_60%)] to-[hsl(320_90%_55%)]',
  // Solids
  ink: 'text-[hsl(240_15%_10%)]',
  inkSoft: 'text-[hsl(240_10%_35%)]',
  inkMuted: 'text-[hsl(240_8%_55%)]',
  bg: 'bg-[hsl(20_30%_98%)]',
  bgCard: 'bg-white',
  bgChip: 'bg-[hsl(240_15%_96%)]',
  // Accents
  coral: 'hsl(345_95%_60%)',
  electric: 'hsl(265_90%_60%)',
  sunset: 'hsl(25_95%_58%)',
  mint: 'hsl(160_75%_45%)',
};

export const categoryStyle = {
  food: { gradient: vibinTheme.gradientFood, emoji: '🍜', label: 'Food' },
  place: { gradient: vibinTheme.gradientPlace, emoji: '📍', label: 'Place' },
  experience: { gradient: vibinTheme.gradientExperience, emoji: '🎯', label: 'Experience' },
} as const;

export type Category = keyof typeof categoryStyle;
