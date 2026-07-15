import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, Save, RefreshCw, Settings2 } from 'lucide-react';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const Settings = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const { addToast } = useToast();

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/policies/');
      if (res.data.status === 'success') setPolicies(res.data.policies || []);
    } catch { addToast('Failed to load policies', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const updateAction = async (id, action) => {
    setSaving(id);
    try {
      await api.post('/policies/update/', { id, action });
      setPolicies(prev => prev.map(p => p.id === id ? { ...p, action } : p));
      addToast('Policy updated', 'success');
    } catch { addToast('Failed to update', 'error'); }
    finally { setSaving(null); }
  };

  const actionIcon = (action) => {
    if (action === 'allow') return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    if (action === 'block') return <ShieldAlert className="w-4 h-4 text-red-400" />;
    return <Shield className="w-4 h-4 text-amber-400" />;
  };

  if (loading) return <LoadingSpinner text="Loading policies..." />;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl lg:text-3xl font-bold">License Policies</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">Manage which licenses are allowed, warned, or blocked in your organization.</p>
      </motion.div>

      {/* Policy list */}
      <GlassCard delay={0.05} hoverEffect={false}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4.5 h-4.5 text-violet-400" />
            <h2 className="text-base font-semibold">License Rules</h2>
          </div>
          <button onClick={fetchPolicies} className="btn-ghost flex items-center gap-2 py-1.5 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="space-y-1.5">
          {policies.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {actionIcon(p.action)}
                <div>
                  <p className="text-sm font-medium text-slate-200">{p.license_name}</p>
                  <p className="text-xs text-slate-600">{p.license_key}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {['allow', 'warn', 'block'].map((act) => (
                  <button
                    key={act}
                    onClick={() => updateAction(p.id, act)}
                    disabled={saving === p.id}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all uppercase tracking-[0.04em] ${
                      p.action === act
                        ? act === 'allow' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shadow-[0_0_8px_rgba(52,211,153,0.06)]'
                          : act === 'block' ? 'bg-red-500/15 text-red-300 border border-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.06)]'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.06)]'
                        : 'bg-white/[0.03] text-slate-500 border border-transparent hover:text-slate-300 hover:bg-white/[0.07]'
                    }`}
                  >
                    {saving === p.id ? '...' : act}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Summary */}
      <GlassCard delay={0.1} hoverEffect={false}>
        <h2 className="text-base font-semibold mb-5">Policy Summary</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Allowed', count: policies.filter(p => p.action === 'allow').length, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
            { label: 'Warned', count: policies.filter(p => p.action === 'warn').length, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
            { label: 'Blocked', count: policies.filter(p => p.action === 'block').length, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/10' },
          ].map((s, i) => (
            <div key={i} className={`p-4 lg:p-5 rounded-xl ${s.bg} border ${s.border} text-center`}>
              <p className={`text-2xl lg:text-3xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;
