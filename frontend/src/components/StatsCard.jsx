import { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, colorClass = 'brand', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (!isNumeric) { setDisplayValue(value); return; }
    let start = 0;
    const duration = 1200;
    const increment = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numericValue) { clearInterval(timer); setDisplayValue(numericValue); }
      else setDisplayValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue, isNumeric]);

  const colors = {
    green: { from: 'from-emerald-500/20', to: 'to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/25' },
    yellow: { from: 'from-amber-500/20', to: 'to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/25' },
    red: { from: 'from-red-500/20', to: 'to-red-600/10', text: 'text-red-400', border: 'border-red-500/25' },
    brand: { from: 'from-violet-500/20', to: 'to-indigo-600/10', text: 'text-violet-400', border: 'border-violet-500/25' },
  };
  const s = colors[colorClass] || colors.brand;

  return (
    <GlassCard delay={delay} className="group cursor-default" intense={false}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.08em] mb-1 group-hover:text-slate-400 transition-colors">{title}</p>
          <h3 className={`text-2xl lg:text-3xl font-bold ${isNumeric ? 'text-white' : s.text}`}>
            {isNumeric ? displayValue : value}
          </h3>
        </div>
        <div className={`p-3 lg:p-3.5 rounded-xl bg-gradient-to-br border ${s.from} ${s.to} ${s.border} ${s.text} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 shrink-0`}>
          <Icon className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
        </div>
      </div>
      <div className={`absolute -bottom-12 -right-12 w-36 h-36 bg-gradient-to-br ${s.from} ${s.to} rounded-full blur-[60px] opacity-[0.12] group-hover:opacity-[0.2] transition-opacity duration-500 pointer-events-none`} />
    </GlassCard>
  );
};

export default StatsCard;
