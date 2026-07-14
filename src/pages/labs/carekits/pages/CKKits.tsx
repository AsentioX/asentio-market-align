import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Clock, Wrench } from 'lucide-react';
import { KITS } from '../lib/kits';

export default function CKKits() {
  useEffect(() => { document.title = 'Browse Care Kits · Smart Care Kits'; }, []);
  return (
    <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700">Care Kits</span>
        <h1 className="mt-2 text-3xl md:text-5xl font-semibold tracking-tight">Curated kits for every situation.</h1>
        <p className="mt-4 text-stone-600 leading-relaxed">Each kit bundles trusted, hand-picked products for a specific caregiving situation. Take the assessment for a personalized recommendation, or browse by need.</p>
      </div>

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {KITS.map(k => (
          <Link key={k.slug} to={`/labs/carekits/kits/${k.slug}`} className="group bg-white border border-stone-200 rounded-3xl p-6 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col">
            <h3 className="text-xl font-semibold text-stone-900">{k.title}</h3>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{k.short}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] text-stone-600">
              <MetaChip icon={<DollarSign className="w-3 h-3" />} label={`~$${k.estInitial}`} sub="initial" />
              <MetaChip icon={<DollarSign className="w-3 h-3" />} label={k.estMonthly ? `$${k.estMonthly}/mo` : 'No mo. fee'} sub="ongoing" />
              <MetaChip icon={<Wrench className="w-3 h-3" />} label={k.installDifficulty} sub={`~${k.installMinutes}m`} />
            </div>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 group-hover:gap-2 transition-all">
              View kit <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MetaChip({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="bg-stone-50 border border-stone-100 rounded-xl px-2 py-2 text-center">
      <div className="flex items-center justify-center gap-1 font-semibold text-stone-900 capitalize">{icon}{label}</div>
      <div className="text-stone-500 mt-0.5">{sub}</div>
    </div>
  );
}
