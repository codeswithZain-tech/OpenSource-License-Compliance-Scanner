import { useState, useEffect } from 'react';
import { Search, Globe, FileJson, AlertTriangle, CheckCircle, XCircle, Shield, ChevronDown, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Scanner = () => {
  const [searchParams] = useSearchParams();
  const [repoUrl, setRepoUrl] = useState(searchParams.get('repo') || '');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setError('');
    setScanResult(null);
    try {
      const res = await api.post('/scan/', { repo_url: repoUrl });
      setScanResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Scan failed. Ensure you have set GITHUB_TOKEN in backend/.env');
    }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Search className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl lg:text-3xl font-bold">License Scanner</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">Analyze a GitHub repository for license compliance and risks.</p>
      </motion.div>

      {/* Input */}
      <GlassCard delay={0.05} hoverEffect={false}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              className="input-icon pl-11"
            />
          </div>
          <button onClick={handleScan} disabled={loading || !repoUrl.trim()} className="btn-primary flex items-center justify-center gap-2 shrink-0">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4.5 h-4.5" />
            )}
            {loading ? 'Scanning...' : 'Scan Repository'}
          </button>
        </div>
        {error && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </motion.p>
        )}
      </GlassCard>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && <LoadingSpinner text="Scanning repository" />}

        {scanResult && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <GlassCard delay={0.1}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                      <FileJson className="w-4 h-4 text-violet-400" />
                    </div>
                    <h2 className="text-lg font-semibold">{scanResult.repo_name || scanResult.repo_url}</h2>
                  </div>
                  {scanResult.license && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-400">License:</span>
                      <span className="text-slate-200 font-medium">{scanResult.license_name || scanResult.license}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge level={scanResult.risk_level || 'UNKNOWN'} />
                  {scanResult.repo_url && (
                    <a href={scanResult.repo_url} target="_blank" rel="noreferrer" className="btn-ghost flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Dependencies */}
            {scanResult.dependencies && scanResult.dependencies.length > 0 && (
              <GlassCard delay={0.15} hoverEffect={false}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-violet-400" />
                  Dependencies ({scanResult.dependencies.length})
                </h3>
                <div className="space-y-1.5">
                  {scanResult.dependencies.map((dep, i) => (
                    <motion.div
                      key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-500 group-hover:text-violet-400 transition-colors shrink-0">
                          <FileJson className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{dep.name}</p>
                          {dep.license && (
                            <p className="text-xs text-slate-500">License: {dep.license}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dep.risk_level && <RiskBadge level={dep.risk_level} />}
                        {dep.policy_action && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            dep.policy_action === 'allow' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            dep.policy_action === 'warn' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {dep.policy_action.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* No dependencies */}
            {(!scanResult.dependencies || scanResult.dependencies.length === 0) && (
              <GlassCard delay={0.15} hoverEffect={false}>
                <div className="text-center py-10">
                  <FileJson className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No dependencies found or extracted.</p>
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No scan yet */}
      {!scanResult && !loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <GlassCard delay={0.2} hoverEffect={false}>
            <div className="text-center py-16 lg:py-20">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/10 to-indigo-600/10 rounded-2xl flex items-center justify-center mb-5 border border-violet-500/10">
                <Search className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">Ready to scan</h3>
              <p className="text-sm text-slate-500 mb-2 max-w-md mx-auto">Enter a GitHub repository URL above and click <span className="text-violet-400 font-medium">Scan Repository</span> to check its license compliance.</p>
              <p className="text-xs text-slate-600">Example: https://github.com/facebook/react</p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default Scanner;
