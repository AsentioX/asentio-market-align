import { useState, useMemo } from 'react';
import { Project, calcProjectCost, STATUS_CONFIG, Material } from './mockData';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link2, ShoppingCart, MessageSquare, Eye, Download, ChevronDown, ChevronUp, Send } from 'lucide-react';

const TIERS = ['economy', 'standard', 'premium'] as const;
const TIER_LABELS = { economy: 'Economy', standard: 'Standard', premium: 'Premium' };

interface Props {
  project: Project;
  onBack: () => void;
}

const ProjectView = ({ project, onBack }: Props) => {
  const [tierIndex, setTierIndex] = useState(TIERS.indexOf(project.tier));
  const tier = TIERS[tierIndex];
  const costs = useMemo(() => calcProjectCost(project, tier), [project, tier]);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(project.rooms[0]?.id ?? null);
  const [cart, setCart] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { author: 'Sarah M.', text: 'Can we see the premium cabinets in white?', time: '2h ago' },
    { author: 'You', text: 'Absolutely — updated the render with white shaker option.', time: '1h ago' },
  ]);

  const toggleCart = (id: string) => setCart((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [...prev, { author: 'You', text: comment, time: 'just now' }]);
    setComment('');
  };

  const status = STATUS_CONFIG[project.status];
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h2>
          <p className="text-xs text-gray-400">{project.address}</p>
        </div>
        <Badge className={`${status.color} text-[10px]`}>{status.label}</Badge>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Link2 className="w-3.5 h-3.5" />
          Pro-Link
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center — Visual Canvas */}
        <div className="flex-1 p-5 overflow-y-auto">
          {/* Room render placeholder */}
          <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-100 flex items-center justify-center mb-5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-32 h-48 border-2 border-amber-400 rounded-lg" />
              <div className="absolute top-8 left-44 w-64 h-48 border-2 border-amber-400 rounded-lg" />
              <div className="absolute bottom-8 left-8 w-96 h-24 border-2 border-amber-400 rounded-lg" />
              <div className="absolute top-8 right-8 w-24 h-32 border-2 border-amber-400 rounded-lg" />
            </div>
            <div className="text-center z-10">
              <Eye className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-700">AI Room Visualization</p>
              <p className="text-xs text-amber-500 mt-1">{TIER_LABELS[tier]} tier • {project.rooms[0]?.name}</p>
            </div>
          </div>

          {/* Materials by room */}
          {project.rooms.map((room) => (
            <div key={room.id} className="mb-4">
              <button
                onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800">{room.name}</span>
                  <span className="text-xs text-gray-400">{room.sqft} sq ft</span>
                </div>
                {expandedRoom === room.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {expandedRoom === room.id && (
                <div className="mt-2 space-y-2">
                  {room.materials.map((mat) => (
                    <MaterialRow key={mat.id} mat={mat} tier={tier} inCart={cart.includes(mat.id)} onToggle={() => toggleCart(mat.id)} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Comments */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              Discussion
            </h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {comments.map((c, i) => (
                <div key={i} className={`flex gap-2 ${c.author === 'You' ? 'flex-row-reverse' : ''}`}>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] ${c.author === 'You' ? 'bg-amber-50 text-amber-900' : 'bg-gray-50 text-gray-700'}`}>
                    <span className="font-medium text-xs">{c.author}</span>
                    <p className="mt-0.5">{c.text}</p>
                    <span className="text-[10px] text-gray-400">{c.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                placeholder="Comment on this project..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-300"
              />
              <Button size="sm" onClick={addComment} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right — Budget + Summary */}
        <div className="lg:w-[320px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-white p-5 overflow-y-auto">
          {/* Budget Slider */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Budget Tier</h3>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              {TIERS.map((t) => (
                <span key={t} className={t === tier ? 'font-bold text-amber-700' : ''}>{TIER_LABELS[t]}</span>
              ))}
            </div>
            <Slider
              value={[tierIndex]}
              onValueChange={([v]) => setTierIndex(v)}
              min={0}
              max={2}
              step={1}
              className="mb-2"
            />
            <div className="text-center mt-3">
              <p className="text-3xl font-bold text-gray-900">{fmt(costs.total)}</p>
              <p className="text-xs text-gray-400 mt-1">Estimated total</p>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Materials</span>
              <span className="font-medium text-gray-800">{fmt(costs.materialsCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Labor ({costs.totalSqft} sq ft)</span>
              <span className="font-medium text-gray-800">{fmt(costs.laborCost)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-bold text-amber-700">{fmt(costs.total)}</span>
            </div>
          </div>

          {/* Cart */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cart ({cart.length})</h3>
            {cart.length === 0 ? (
              <p className="text-xs text-gray-400">Click + on materials to add to cart</p>
            ) : (
              <div className="space-y-1">
                {cart.map((id) => {
                  const mat = project.rooms.flatMap((r) => r.materials).find((m) => m.id === id);
                  if (!mat) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-xs p-2 bg-amber-50 rounded-lg">
                      <span className="text-gray-700">{mat.name}</span>
                      <span className="font-medium text-amber-700">{fmt(mat.quantity * mat.prices[tier])}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <ShoppingCart className="w-4 h-4" />
            Place Order
          </Button>

          {/* Pro-Link */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">Pro-Link</span>
            </div>
            <p className="text-[11px] text-amber-700 mb-2">Share this link with your client — no login required.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[10px] bg-white/80 px-2 py-1.5 rounded border border-amber-200 text-amber-800 truncate">
                casapro.link/{project.proLinkId}
              </code>
              <Button size="sm" variant="outline" className="text-[10px] h-7 px-2 border-amber-200 text-amber-700">Copy</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialRow = ({ mat, tier, inCart, onToggle }: { mat: Material; tier: 'economy' | 'standard' | 'premium'; inCart: boolean; onToggle: () => void }) => {
  const price = mat.quantity * mat.prices[tier];
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const CATEGORY_COLORS: Record<string, string> = {
    flooring: 'bg-blue-50 text-blue-600',
    cabinets: 'bg-purple-50 text-purple-600',
    paint: 'bg-green-50 text-green-600',
    fixtures: 'bg-orange-50 text-orange-600',
    countertops: 'bg-rose-50 text-rose-600',
    tile: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-50 hover:border-amber-100 transition-colors">
      <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${CATEGORY_COLORS[mat.category] || 'bg-gray-50 text-gray-500'}`}>
        {mat.category}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{mat.name}</p>
        <p className="text-[11px] text-gray-400">{mat.quantity} {mat.unit} • {mat.specs}</p>
      </div>
      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{fmt(price)}</span>
      <button
        onClick={onToggle}
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${inCart ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-amber-100'}`}
      >
        {inCart ? '✓' : '+'}
      </button>
    </div>
  );
};

export default ProjectView;
