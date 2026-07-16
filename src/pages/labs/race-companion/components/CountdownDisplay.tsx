import { motion } from 'framer-motion';
import type { Countdown } from '../lib/time';

interface Props {
  cd: Countdown;
  size?: 'lg' | 'md';
}

const Cell = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <motion.span
      key={value}
      initial={{ y: -6, opacity: 0.4 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="font-black tabular-nums text-white text-4xl md:text-5xl leading-none tracking-tight"
    >
      {String(value).padStart(2, '0')}
    </motion.span>
    <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
  </div>
);

export const CountdownDisplay = ({ cd }: Props) => {
  if (cd.past) {
    return (
      <div className="text-white/60 text-sm font-semibold tracking-wide uppercase">Now</div>
    );
  }
  return (
    <div className="flex items-end gap-4">
      {cd.days > 0 && <Cell value={cd.days} label="Days" />}
      <Cell value={cd.hours} label="Hrs" />
      <Cell value={cd.minutes} label="Min" />
      <Cell value={cd.seconds} label="Sec" />
    </div>
  );
};
