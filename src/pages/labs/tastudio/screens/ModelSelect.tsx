import { DriverProfile, VEHICLE_MODELS, STYLE_OPTIONS, PERSONALITY_OPTIONS } from '../mockData';
import { ArrowLeft } from 'lucide-react';

interface Props {
  profile: DriverProfile;
  onPick: (modelId: string) => void;
  onBack: () => void;
}

const ModelSelect = ({ profile, onPick, onBack }: Props) => {
  const styleLabel = STYLE_OPTIONS.find((s) => s.value === profile.drivingStyle)?.label;
  const personalityLabel = PERSONALITY_OPTIONS.find((p) => p.value === profile.personality)?.label;

  return (
    <div className="min-h-screen px-8 md:px-16 py-10">
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-widest text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>
        <div className="text-xs tracking-[0.4em] text-white/40">DRIVER PROFILE GENERATED</div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="border border-white/15 bg-white/[0.02] p-8 mb-12">
          <p className="text-xs tracking-[0.4em] text-white/40 mb-4">YOUR PROFILE</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileItem label="Style" value={styleLabel ?? ''} />
            <ProfileItem label="Character" value={personalityLabel ?? ''} />
            <ProfileItem label="Context" value={profile.usage} />
          </div>
        </div>

        <p className="text-xs tracking-[0.4em] text-white/40 mb-2">SELECT YOUR PLATFORM</p>
        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-10">
          Choose your Porsche.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VEHICLE_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              className="group text-left bg-white/[0.02] border border-white/10 hover:border-white/40 transition-all overflow-hidden"
            >
              <div className="aspect-video overflow-hidden bg-white/5">
                <img
                  src={m.image}
                  alt={`Porsche ${m.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <div className="text-2xl font-light mb-1">{m.name}</div>
                <div className="text-xs tracking-widest text-white/40">{m.series.toUpperCase()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs tracking-widest text-white/40 mb-1">{label.toUpperCase()}</div>
    <div className="text-lg font-light capitalize">{value}</div>
  </div>
);

export default ModelSelect;
