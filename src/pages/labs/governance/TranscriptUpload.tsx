import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, Check, X, Pencil, ArrowRight } from 'lucide-react';
import { useDrafts, usePolicyMutations, Draft } from '@/hooks/useGovernance';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const SIMULATED_EXTRACTIONS = [
  {
    title: 'Rotating Leadership Model',
    summary: 'Leadership of the task force rotates quarterly among senior members, ensuring diverse perspectives guide the group and preventing consolidation of authority.',
    context_snippet: '"I think we should rotate who chairs the meetings every quarter so everyone gets a chance to lead and we don\'t create a power center."',
  },
  {
    title: 'Transparent Budget Allocation',
    summary: 'All budget decisions above $500 require published rationale. Quarterly financial reports are shared with all stakeholders within 10 business days of period close.',
    context_snippet: '"Every dollar we spend should be justifiable. Let\'s set a threshold — anything over five hundred, we document why."',
  },
  {
    title: 'Conflict Resolution Protocol',
    summary: 'Disputes are escalated through a three-step process: peer mediation, facilitator intervention, and finally a full task force vote. Each step has a 5-business-day window.',
    context_snippet: '"We need a clear path when people disagree. Start with talking it out, then bring in the facilitator, and only go to a full vote as a last resort."',
  },
  {
    title: 'Community Feedback Integration',
    summary: 'Community input collected through surveys and forums is synthesized into actionable briefs. Each brief is assigned an owner who must respond within two weeks.',
    context_snippet: '"It\'s not enough to collect feedback. Someone has to own it and actually respond to the community."',
  },
];

const TranscriptUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const { drafts, addDrafts, removeDraft } = useDrafts();
  const { addPolicy } = usePolicyMutations();
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.txt') || f.name.endsWith('.pdf'))) setFile(f);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const simulateParsing = () => {
    setParsing(true);
    setTimeout(() => {
      addDrafts.mutate(SIMULATED_EXTRACTIONS);
      setParsing(false);
    }, 2500);
  };

  const approveCard = (draft: Draft) => {
    addPolicy.mutate({ title: draft.title, summary: draft.summary, context_snippet: draft.context_snippet ?? undefined, status: 'draft' });
    removeDraft.mutate(draft.id);
  };

  const startEdit = (draft: Draft) => {
    setEditingId(draft.id);
    setEditTitle(draft.title);
    setEditSummary(draft.summary);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Transcript Upload</h2>
        <p className="text-gray-500 mt-1">Upload meeting transcripts to extract key decisions and vision pillars.</p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          'bg-white rounded-xl border-2 border-dashed p-10 text-center transition-colors',
          file ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200 hover:border-teal-300',
        )}
      >
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-10 h-10 text-teal-600" />
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            <div className="flex gap-3 mt-2">
              <button onClick={simulateParsing} disabled={parsing} className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {parsing ? 'Processing…' : 'Extract Insights'}
              </button>
              <button onClick={() => setFile(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Clear
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              Drag & drop a <span className="font-medium">.txt</span> or <span className="font-medium">.pdf</span> file, or click to browse
            </p>
            <input type="file" accept=".txt,.pdf" onChange={handleFileSelect} className="hidden" />
          </label>
        )}
      </div>

      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Drafting Table</h3>
            <span className="text-xs text-gray-400">{drafts.length} suggestion{drafts.length !== 1 && 's'} remaining</span>
          </div>
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {editingId === draft.id ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <textarea
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-gray-500 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-800">{draft.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{draft.summary}</p>
                    {draft.context_snippet && (
                      <blockquote className="mt-3 pl-3 border-l-2 border-teal-200 text-xs text-gray-400 italic">
                        {draft.context_snippet}
                      </blockquote>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => approveCard(draft)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Approve to Library
                      </button>
                      <button onClick={() => startEdit(draft)} className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => removeDraft.mutate(draft.id)} className="px-4 py-1.5 border border-gray-200 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" /> Discard
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {drafts.length > 0 && (
            <button
              onClick={() => navigate('/labs/governance/library')}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              View Policy Library →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TranscriptUpload;
