import { usePhase } from '@/hooks/useGovernance';
import { Eye, Target, Lightbulb } from 'lucide-react';

const VisionMission = () => {
  const { phase } = usePhase();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Vision & Mission</h2>
        <p className="text-sm text-gray-500">Guiding principles for the Field Of Views task force</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Vision</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            A future where spatial computing policy is shaped transparently, inclusively, and proactively — ensuring XR technologies serve the public good while fostering innovation.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Mission</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">
            To convene diverse stakeholders in drafting, debating, and finalising governance policies for extended reality — bridging the gap between technological possibility and societal readiness.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Guiding Principles</h3>
        </div>
        <ul className="space-y-3 text-gray-600">
          {[
            'Transparency — All deliberations and decisions are documented and publicly accessible.',
            'Inclusivity — Perspectives from industry, academia, civil society, and affected communities are actively sought.',
            'Evidence-based — Policies are grounded in research, real-world data, and expert testimony.',
            'Adaptive — Governance frameworks evolve alongside the technology they regulate.',
            'Human-centred — Individual rights, safety, and well-being remain the primary lens for every policy.',
          ].map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VisionMission;
