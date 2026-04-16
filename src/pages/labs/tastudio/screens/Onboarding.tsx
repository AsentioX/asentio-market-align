import { useRef, useState } from 'react';
import {
  STYLE_OPTIONS,
  PERSONALITY_OPTIONS,
  USAGE_OPTIONS,
  VEHICLE_MODELS,
  DriverProfile,
  DrivingStyle,
  Personality,
  Usage,
} from '../mockData';
import { ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onComplete: (
    p: DriverProfile,
    starting: { kind: 'photo'; dataUrl: string } | { kind: 'model'; modelId: string },
  ) => void;
  onBack: () => void;
}

const Onboarding = ({ onComplete, onBack }: Props) => {
  const [step, setStep] = useState(0);
  const [drivingStyle, setDrivingStyle] = useState<DrivingStyle | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: 'How do you drive?', sub: 'Step 01 — Driving Style' },
    { title: 'What is your character?', sub: 'Step 02 — Personality' },
    { title: 'Where will it live?', sub: 'Step 03 — Usage Context' },
    { title: 'Your starting point.', sub: 'Step 04 — Begin Your Build' },
  ];

  const startingChosen = !!photoDataUrl || !!modelId;
  const canNext =
    (step === 0 && drivingStyle) ||
    (step === 1 && personality) ||
    (step === 2 && usage) ||
    (step === 3 && startingChosen);

  const next = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (drivingStyle && personality && usage) {
      const profile = { drivingStyle, personality, usage };
      if (photoDataUrl) onComplete(profile, { kind: 'photo', dataUrl: photoDataUrl });
      else if (modelId) onComplete(profile, { kind: 'model', modelId });
    }
  };

  const back = () => (step === 0 ? onBack() : setStep(step - 1));

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      setModelId(null);
    };
    reader.readAsDataURL(file);
  };

  const renderOptions = () => {
    if (step === 0)
      return STYLE_OPTIONS.map((o) => (
        <Choice key={o.value} active={drivingStyle === o.value} label={o.label} desc={o.desc} onClick={() => setDrivingStyle(o.value)} />
      ));
    if (step === 1)
      return PERSONALITY_OPTIONS.map((o) => (
        <Choice key={o.value} active={personality === o.value} label={o.label} desc={o.desc} onClick={() => setPersonality(o.value)} />
      ));
    if (step === 2)
      return USAGE_OPTIONS.map((o) => (
        <Choice key={o.value} active={usage === o.value} label={o.label} desc={o.desc} onClick={() => setUsage(o.value)} />
      ));
    return null;
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
            <div key={i} className={`h-px w-12 ${i <= step ? 'bg-white' : 'bg-white/20'} transition-colors`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full py-12">
        <p className="text-xs tracking-[0.4em] text-white/40 mb-4">{steps[step].sub}</p>
        <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-12">{steps[step].title}</h2>

        {step < 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{renderOptions()}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Your Photo */}
            <div
              className={`border transition-all ${
                photoDataUrl ? 'border-white bg-white/5' : 'border-white/15 hover:border-white/40'
              }`}
            >
              <div className="p-6">
                <p className="text-xs tracking-[0.4em] text-white/40 mb-2">OPTION A</p>
                <h3 className="text-2xl font-light mb-1">Upload Your Photo</h3>
                <p className="text-sm text-white/50 font-light mb-6">
                  Use a photo of your own Porsche. Our AI will reimagine it in your style.
                </p>

                {photoDataUrl ? (
                  <div className="relative">
                    <img src={photoDataUrl} alt="Your Porsche" className="w-full aspect-video object-cover" />
                    <button
                      onClick={() => setPhotoDataUrl(null)}
                      className="absolute top-2 right-2 bg-black/70 p-2 hover:bg-black transition"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full aspect-video border border-dashed border-white/20 hover:border-white/50 flex flex-col items-center justify-center gap-3 transition"
                  >
                    <Upload className="w-8 h-8 text-white/50" />
                    <span className="text-sm text-white/60">Click to upload — JPG or PNG</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* Pick a Platform */}
            <div
              className={`border transition-all ${
                modelId ? 'border-white bg-white/5' : 'border-white/15 hover:border-white/40'
              }`}
            >
              <div className="p-6">
                <p className="text-xs tracking-[0.4em] text-white/40 mb-2">OPTION B</p>
                <h3 className="text-2xl font-light mb-1">Pick a Platform</h3>
                <p className="text-sm text-white/50 font-light mb-6">
                  Start from a Porsche model. We'll generate a complete TECHART build.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto">
                  {VEHICLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModelId(m.id);
                        setPhotoDataUrl(null);
                      }}
                      className={`text-left border transition overflow-hidden ${
                        modelId === m.id
                          ? 'border-white'
                          : 'border-white/10 hover:border-white/40'
                      }`}
                    >
                      <div className="aspect-video bg-white/5 overflow-hidden">
                        <img src={m.image} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="px-3 py-2">
                        <div className="text-sm font-light">{m.name}</div>
                        <div className="text-[10px] tracking-widest text-white/40">{m.series.toUpperCase()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={next}
          disabled={!canNext}
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm tracking-widest hover:bg-white/90 transition disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'GENERATE BUILD' : 'CONTINUE'}
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
      active ? 'border-white bg-white/5' : 'border-white/15 hover:border-white/40 hover:bg-white/[0.02]'
    }`}
  >
    <div className="text-xl font-light mb-1">{label}</div>
    <div className="text-sm text-white/50 font-light">{desc}</div>
  </button>
);

export default Onboarding;
