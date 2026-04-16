import { useState } from 'react';
import {
  STYLE_OPTIONS,
  PERSONALITY_OPTIONS,
  USAGE_OPTIONS,
  BUDGET_OPTIONS,
  DriverProfile,
  DrivingStyle,
  Personality,
  Usage,
  Budget,
} from '../mockData';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onComplete: (p: DriverProfile) => void;
  onBack: () => void;
}

const Onboarding = ({ onComplete, onBack }: Props) => {
  const [step, setStep] = useState(0);
  const [drivingStyle, setDrivingStyle] = useState<DrivingStyle | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);

  const steps = [
    { title: 'How do you drive?', sub: 'Step 01 — Driving Style' },
    { title: 'What is your character?', sub: 'Step 02 — Personality' },
    { title: 'Where will it live?', sub: 'Step 03 — Usage Context' },
    { title: 'Define your investment.', sub: 'Step 04 — Budget' },
  ];

  const canNext =
    (step === 0 && drivingStyle) ||
    (step === 1 && personality) ||
    (step === 2 && usage) ||
    (step === 3 && budget);

  const next = () => {
    if (step < 3) setStep(step + 1);
    else if (drivingStyle && personality && usage && budget) {
      onComplete({ drivingStyle, personality, usage, budget });
    }
  };

  const back = () => (step === 0 ? onBack() : setStep(step - 1));

  const renderOptions = () => {
    if (step === 0)
      return STYLE_OPTIONS.map((o) => (
        <Choice
          key={o.value}
          active={drivingStyle === o.value}
          label={o.label}
          desc={o.desc}
          onClick={() => setDrivingStyle(o.value)}
        />
      ));
    if (step === 1)
      return PERSONALITY_OPTIONS.map((o) => (
        <Choice
          key={o.value}
          active={personality === o.value}
          label={o.label}
          desc={o.desc}
          onClick={() => setPersonality(o.value)}
        />
      ));
    if (step === 2)
      return USAGE_OPTIONS.map((o) => (
        <Choice
          key={o.value}
          active={usage === o.value}
          label={o.label}
          desc={o.desc}
          onClick={() => setUsage(o.value)}
        />
      ));
    return BUDGET_OPTIONS.map((o) => (
      <Choice
        key={o.value}
        active={budget === o.value}
        label={o.label}
        desc={o.desc}
        onClick={() => setBudget(o.value)}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col px-8 md:px-16 py-10">
      <div className="flex items-center justify-between">
        <button
          onClick={back}
          className="flex items-center gap-2 text-xs tracking-widest text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-px w-12 ${i <= step ? 'bg-white' : 'bg-white/20'} transition-colors`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-12">
        <p className="text-xs tracking-[0.4em] text-white/40 mb-4">{steps[step].sub}</p>
        <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-12">
          {steps[step].title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{renderOptions()}</div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={next}
          disabled={!canNext}
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm tracking-widest hover:bg-white/90 transition disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'GENERATE PROFILE' : 'CONTINUE'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Choice = ({
  label,
  desc,
  active,
  onClick,
}: {
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`text-left p-6 border transition-all ${
      active
        ? 'border-white bg-white/5'
        : 'border-white/15 hover:border-white/40 hover:bg-white/[0.02]'
    }`}
  >
    <div className="text-xl font-light mb-1">{label}</div>
    <div className="text-sm text-white/50 font-light">{desc}</div>
  </button>
);

export default Onboarding;
