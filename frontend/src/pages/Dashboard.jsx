import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, ShieldAlert, Shield, BarChart3, ChevronRight, ArrowUpRight, Clock, Scan } from 'lucide-react';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';
import GlassCard from '../components/GlassCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/history/');
        if (res.data.status === 'success') {
          const scans = res.data.scans || [];
          setRecentScans(scans.slice(0, 5));
          setStats({
            total: scans.length,
            low: scans.filter(s => s.risk_level === 'LOW').length,
            medium: scans.filter(s => s.risk_level === 'MEDIUM').length,
            high: scans.filter(s => s.risk_level === 'HIGH').length,
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard" />;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl lg:text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">Overview of your scanning activity and compliance status.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { title: 'Total Scans', value: stats?.total || 0, icon: BarChart3, color: 'brand', delay: 0 },
          { title: 'Low Risk', value: stats?.low || 0, icon: ShieldCheck, color: 'green', delay: 0.05 },
          { title: 'Medium Risk', value: stats?.medium || 0, icon: Shield, color: 'yellow', delay: 0.1 },
          { title: 'High Risk', value: stats?.high || 0, icon: ShieldAlert, color: 'red', delay: 0.15 },
        ].map((s, i) => <StatsCard key={i} {...s} />)}
      </div>

      {/* Recent Scans */}
      <GlassCard delay={0.2} hoverEffect={false}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4.5 h-4.5 text-slate-500" />
            <h2 className="text-base lg:text-lg font-semibold">Recent Scans</h2>
          </div>
          <Link to="/history" className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentScans.length > 0 ? (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] text-slate-500 text-xs font-semibold uppercase tracking-[0.08em]">
                    <th className="pb-3.5 pl-4 font-medium">Repository</th>
                    <th className="pb-3.5 font-medium">Risk</th>
                    <th className="pb-3.5 font-medium">Date</th>
                    <th className="pb-3.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {recentScans.map((scan, i) => (
                    <motion.tr key={scan.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-500 group-hover:text-violet-400 transition-colors">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-200 truncate max-w-[220px]">{scan.repo_name || scan.repo_url}</span>
                        </div>
                      </td>
                      <td className="py-3.5"><RiskBadge level={scan.risk_level || 'UNKNOWN'} /></td>
                      <td className="py-3.5 text-sm text-slate-500">{new Date(scan.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5">
                        <Link to={`/scanner?repo=${encodeURIComponent(scan.repo_url)}`} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-violet-500/10 text-slate-400 hover:text-violet-400 transition-all">
                          Rescan <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-2.5">
              {recentScans.map((scan, i) => (
                <motion.div key={scan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Activity className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-200 truncate">{scan.repo_name || scan.repo_url}</span>
                    </div>
                    <RiskBadge level={scan.risk_level || 'UNKNOWN'} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{new Date(scan.created_at).toLocaleDateString()}</span>
                    <Link to={`/scanner?repo=${encodeURIComponent(scan.repo_url)}`} className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">Rescan →</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 lg:py-16">
            <div className="w-14 h-14 mx-auto bg-white/[0.04] rounded-full flex items-center justify-center mb-4 border border-white/[0.05]">
              <Scan className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1.5">No scans yet</h3>
            <p className="text-sm text-slate-500 mb-6">Start scanning your repositories to see insights here.</p>
            <Link to="/scanner" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Scan className="w-4 h-4" /> Start Scan
            </Link>
          </div>
        )}
      </GlassCard>

      {/* Quick action */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Link to="/scanner" className="group flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-violet-500/5 to-indigo-500/5 border border-violet-500/10 hover:from-violet-500/10 hover:to-indigo-500/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Scan className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Quick Scan</p>
              <p className="text-xs text-slate-500">Analyze a repository now</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
