import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award } from 'lucide-react';
import { mockProgressData, mockWeeklyTrend } from './mockData';

const personalRecords = [
  { label: 'Max Bench', value: '225 lbs', icon: '🏋️' },
  { label: 'Longest Run', value: '12.4 km', icon: '🏃' },
  { label: 'Most Reps (Push-ups)', value: '120', icon: '💪' },
  { label: 'Highest Score Day', value: '1,240 pts', icon: '🔥' },
];

const ProgressPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Progress</h2>

      {/* Weekly score chart */}
      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Weekly Score Trend</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={mockWeeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily breakdown bar chart */}
      <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
        <span className="text-sm font-medium mb-4 block">This Week Breakdown</span>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={mockProgressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <Bar dataKey="strength" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
            <Bar dataKey="cardio" stackId="a" fill="#fb923c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Strength</span>
          <span className="flex items-center gap-1 text-[10px] text-white/40"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Cardio</span>
        </div>
      </div>

      {/* Personal records */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold">Personal Records</h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {personalRecords.map((pr) => (
            <div key={pr.label} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/5 text-center">
              <span className="text-2xl mb-1 block">{pr.icon}</span>
              <p className="text-base font-bold">{pr.value}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{pr.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
