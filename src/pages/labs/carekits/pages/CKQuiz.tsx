import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import { QUIZ, scoreAnswers, type Answers } from '../lib/quiz';
import { saveAssessment } from '../lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CKQuiz() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { toast } = useToast();
  const q = QUIZ[i];
  const total = QUIZ.length;
  const isLast = i === total - 1;
  const selected = answers[q.key];

  async function handleNext() {
    if (!selected) return;
    if (!isLast) { setI(i + 1); return; }
    setSubmitting(true);
    try {
      const profile = scoreAnswers(answers);
      const res = await saveAssessment({
        answers,
        ...profile,
      } as any);
      try { localStorage.setItem('ck:lastAssessment', res.id); } catch {}
      nav(`/labs/carekits/results/${res.id}`);
    } catch (e: any) {
      toast({ title: 'Could not save assessment', description: e.message, variant: 'destructive' });
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 md:py-16">
      <Link to="/labs/carekits" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>

      <div className="flex items-center gap-1.5 mb-6">
        {QUIZ.map((_, idx) => (
          <div key={idx} className={`h-1.5 flex-1 rounded-full transition-colors ${idx <= i ? 'bg-emerald-600' : 'bg-stone-200'}`} />
        ))}
      </div>
      <p className="text-sm text-stone-500 mb-2">Question {i + 1} of {total}</p>

      <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 leading-snug">{q.q}</h1>
      {q.helper && <p className="mt-2 text-stone-600">{q.helper}</p>}

      <div className="mt-8 grid gap-3">
        {q.options.map(o => {
          const isSel = selected === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setAnswers(a => ({ ...a, [q.key]: o.value }))}
              className={`flex items-center justify-between text-left px-5 py-4 rounded-2xl border transition-all ${
                isSel
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                  : 'bg-white border-stone-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-stone-900 font-medium">{o.label}</span>
              {isSel && <Check className="w-5 h-5 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          disabled={i === 0}
          onClick={() => setI(i - 1)}
          className="text-sm text-stone-500 disabled:opacity-40 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selected || submitting}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-full"
        >
          {submitting ? 'Saving…' : isLast ? 'See my recommendations' : 'Next'} <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-10 text-xs text-stone-500 inline-flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" /> Your answers stay private. Recommendations are based only on what you share here.
      </p>
    </div>
  );
}
