import { useEffect, useState } from 'react';
import { fetchAssessmentsAdmin } from '../../lib/api';
import type { AssessmentResult } from '../../lib/types';
import { Link } from 'react-router-dom';

export default function CKAdminAssessments() {
  const [items, setItems] = useState<AssessmentResult[]>([]);
  useEffect(() => { fetchAssessmentsAdmin().then(setItems); }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Assessments</h1>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Kit</th>
              <th className="px-4 py-3 font-medium">Risk tags</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-stone-500">No assessments yet.</td></tr>}
            {items.map(r => (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="px-4 py-3 text-stone-600">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">{r.email ?? <span className="text-stone-400">—</span>}</td>
                <td className="px-4 py-3 font-medium">{r.kit_name ?? '—'}</td>
                <td className="px-4 py-3 text-xs text-stone-600">{r.risk_tags.join(', ') || '—'}</td>
                <td className="px-4 py-3 text-right"><Link to={`/labs/carekits/results/${r.id}`} className="text-emerald-700 hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
