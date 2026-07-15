import { useEffect, useState } from 'react';
import { History as HistoryIcon, Activity, ChevronLeft, ChevronRight, ChevronDown, Search, ArrowUpRight, Calendar } from 'lucide-react';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const pageSize = 10;

  useEffect(() => {
    const fetchScans = async () => {
      setLoading(true);
      try {
        const res = await api.get('/history/', { params: { page, pageSize, search: filter } });
        if (res.data.status === 'success') {
          const list = res.data.scans || [];
          setScans(list);
          setTotalPages(Math.ceil((res.data.total || list.length) / pageSize) || 1);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchScans();
  }, [page, filter]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <HistoryIcon className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl lg:text-3xl font-bold">Scan History</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">Review all your past license scans and their results.</p>
      </motion.div>

      {/* Filters */}
      <GlassCard delay={0.05} hoverEffect={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="input-icon pl-11"
            />
          </div>
        </div>
      </GlassCard>

      {/* List */}
      {loading ? (
        <LoadingSpinner text="Loading history" />
      ) : scans.length > 0 ? (
        <>
          {/* Desktop */}
          <GlassCard delay={0.1} hoverEffect={false}>
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.04] text-slate-500 text-xs font-semibold uppercase tracking-[0.08em]">
                    <th className="pb-3.5 pl-4 font-medium">Repository</th>
                    <th className="pb-3.5 font-medium">License</th>
                    <th className="pb-3.5 font-medium">Risk</th>
                    <th className="pb-3.5 font-medium">Dependencies</th>
                    <th className="pb-3.5 font-medium">Date</th>
                    <th className="pb-3.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {scans.map((scan, i) => (
                    <motion.tr key={scan.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-500 group-hover:text-violet-400 transition-colors">
                            <Activity className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-200 truncate max-w-[240px]">{scan.repo_name || scan.repo_url}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-sm text-slate-300">{scan.license_name || scan.license || '—'}</td>
                      <td className="py-3.5"><RiskBadge level={scan.risk_level || 'UNKNOWN'} /></td>
                      <td className="py-3.5 text-sm text-slate-500">{scan.dependencies?.length || 0}</td>
                      <td className="py-3.5 text-sm text-slate-500">{new Date(scan.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5">
                        <Link to={`/scanner?repo=${encodeURIComponent(scan.repo_url)}`} className="btn-ghost flex items-center gap-1.5 py-1.5 px-3">
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
              {scans.map((scan, i) => (
                <motion.div key={scan.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Activity className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-200 truncate">{scan.repo_name || scan.repo_url}</span>
                    </div>
                    <RiskBadge level={scan.risk_level || 'UNKNOWN'} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(scan.created_at).toLocaleDateString()}
                    </div>
                    <span>License: {scan.license_name || scan.license || '—'}</span>
                  </div>
                  <Link to={`/scanner?repo=${encodeURIComponent(scan.repo_url)}`} className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                    Rescan <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/[0.03] text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] border border-white/[0.05]'
                }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-icon disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <GlassCard delay={0.1} hoverEffect={false}>
          <div className="text-center py-16 lg:py-20">
            <div className="w-14 h-14 mx-auto bg-white/[0.04] rounded-full flex items-center justify-center mb-4 border border-white/[0.05]">
              <HistoryIcon className="w-6 h-6 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1.5">No scans found</h3>
            <p className="text-sm text-slate-500 mb-6">{filter ? 'No results match your search.' : 'Start scanning repositories to build your history.'}</p>
            <Link to="/scanner" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4" /> Start Scan
            </Link>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default History;
