import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAssessment } from '../lib/api';
import type { AssessmentResult } from '../lib/types';
import { ArrowRight, Bookmark } from 'lucide-react';

export default function CKSaved() {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    document.title = 'Saved results · Smart Care Kits';
    const id = (() => { try { return localStorage.getItem('ck:lastAssessment'); } catch { return null; } })();
    if (!id) { setMissing(true); return; }
    fetchAssessment(id).then(r => {
      if (!r) setMissing(true);
      else setResult(r);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-3xl font-semibold mb-2 inline-flex items-center gap-2"><Bookmark className="w-7 h-7 text-emerald-600" /> Your saved results</h1>
      <p className="text-stone-600 mb-8">A simple caregiver dashboard for keeping track of your kit.</p>

      {missing && (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center">
          <p className="text-stone-600 mb-4">No saved assessments on this device yet.</p>
          <Link to="/labs/carekits/quiz" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 rounded-full">
            Take the assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {result && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6">
          <p className="text-sm text-stone-500">Last assessment · {new Date(result.created_at).toLocaleDateString()}</p>
          <h2 className="text-2xl font-semibold mt-1">{result.kit_name}</h2>
          {result.risk_tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {result.risk_tags.map(t => <span key={t} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">{t}</span>)}
            </div>
          )}
          <Link to={`/labs/carekits/results/${result.id}`} className="mt-5 inline-flex items-center gap-2 text-emerald-700 font-medium hover:underline">
            Open my kit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
