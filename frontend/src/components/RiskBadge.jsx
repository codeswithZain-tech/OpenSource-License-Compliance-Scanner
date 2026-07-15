import { ShieldAlert, ShieldCheck, Shield, AlertTriangle } from 'lucide-react';

const config = {
  LOW: { cls: 'badge-low', icon: ShieldCheck },
  MEDIUM: { cls: 'badge-medium', icon: AlertTriangle },
  HIGH: { cls: 'badge-high', icon: ShieldAlert },
  UNKNOWN: { cls: 'badge-unknown', icon: Shield },
};

const RiskBadge = ({ level }) => {
  const lv = level?.toUpperCase() || 'UNKNOWN';
  const c = config[lv] || config.UNKNOWN;
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${c.cls} ${lv === 'HIGH' ? 'shadow-[0_0_12px_rgba(239,68,68,0.15)]' : ''}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[11px] font-bold tracking-[0.08em]">{lv}</span>
    </div>
  );
};

export default RiskBadge;
