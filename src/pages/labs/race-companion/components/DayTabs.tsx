import { motion } from 'framer-motion';
import { SCHEDULE } from '../data/schedule';

interface Props {
  activeDate: string;
  onChange: (date: string) => void;
}

export const DayTabs = ({ activeDate, onChange }: Props) => {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-1">
        {SCHEDULE.map(day => {
          const active = day.date === activeDate;
          const [, month, dd] = day.date.split('-');
          return (
            <button
              key={day.date}
              onClick={() => onChange(day.date)}
              className={`snap-start shrink-0 relative rounded-2xl px-4 py-2.5 min-w-[68px] text-center transition-all
                ${active ? 'text-white' : 'text-white/45 hover:text-white/70'}`}
            >
              {active && (
                <motion.div
                  layoutId="dayTabActive"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/90 to-amber-500/90 shadow-[0_8px_30px_-8px_rgba(251,146,60,0.55)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-widest">{day.label}</div>
                <div className="text-lg font-black tabular-nums leading-tight">{dd}</div>
                <div className="text-[9px] font-semibold uppercase tracking-widest opacity-70">Jul</div>
                {month /* placate ts */ && null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
