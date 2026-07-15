import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, ShieldCheck, ShieldAlert, Download, AlertTriangle, Layers, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import GlassCard from '../components/GlassCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const BatchScan = () => {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
      setUrls(lines.join('\n'));
      addToast(`Loaded ${lines.length} URLs from file`, 'success');
    };
    reader.readAsText(file);
  };

  const handleScan = async () => {
    const urlList = urls.split('\n').map(u => u.trim()).filter(u => u);
    if (urlList.length === 0) { addToast('Please enter at least one URL', 'error'); return; }
    if (urlList.length > 10) { addToast('Maximum 10 URLs per batch', 'error'); return; }
    setScanning(true);
    setResults(null);
    try {
      const res = await api.post('/scan/batch/', { urls: urlList });
      if (res.data.status === 'success') setResults(res.data.results);
      else addToast(res.data.message || 'Scan failed', 'error');
    } catch { addToast('Batch scan failed', 'error'); }
    finally { setScanning(false); }
  };

  const exportResults = () => {
    if (!results) return;
    const csv = ['Repository,License,Risk Level,Status'];
    results.forEach(r => csv.push(`${r.repo_name},${r.license},${r.risk_level},${r.policy?.action || 'unknown'}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'batch-scan-results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl lg:text-3xl font-bold">Batch Scan</h1>
        </div>
        <p className="text-sm text-slate-500 ml-11">Scan multiple repositories at once. Upload a CSV or paste URLs.</p>
      </motion.div>

      {/* Input */}
      <GlassCard delay={0.05} hoverEffect={false}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder={`Paste GitHub URLs (one per line):\nhttps://github.com/facebook/react\nhttps://github.com/vuejs/vue`}
              rows={5}
              className="input-field flex-1 font-mono text-xs lg:text-sm resize-none"
            />
            <div className="flex sm:flex-col gap-2 shrink-0">
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="btn-ghost flex items-center justify-center gap-2 px-4 py-3">
                <Upload className="w-4 h-4" /> Upload
              </button>
              {urls && (
                <button onClick={() => setUrls('')} className="btn-ghost flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleScan} disabled={scanning} className="btn-primary flex items-center gap-2">
              {scanning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4.5 h-4.5" />}
              {scanning ? 'Scanning...' : 'Scan All'}
            </button>
            {results && (
              <button onClick={exportResults} className="btn-ghost flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Results */}
      <AnimatePresence>
        {scanning && (
          <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner text="Scanning repositories..." />
          </motion.div>
        )}

        {results && !scanning && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <GlassCard delay={0.1} hoverEffect={false}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-violet-400" />
                  <h2 className="text-base font-semibold">Results ({results.length} repos)</h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-400">{results.filter(r => r.risk_level === 'LOW').length} safe</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-400">{results.filter(r => r.risk_level === 'MEDIUM').length} medium</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-red-400">{results.filter(r => r.risk_level === 'HIGH').length} high</span>
                </div>
              </div>

              <div className="space-y-2">
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      r.error ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {r.error ? (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      ) : r.risk_level === 'LOW' ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : r.risk_level === 'HIGH' ? (
                        <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{r.repo_name || r.repo_url}</p>
                        {r.repo_url && r.repo_name && <p className="text-xs text-slate-600 truncate">{r.repo_url}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {r.error ? (
                        <span className="text-xs font-medium text-red-400">Error</span>
                      ) : (
                        <>
                          <span className="text-xs text-slate-500 hidden sm:block">{r.license}</span>
                          <RiskBadge level={r.risk_level} />
                          {r.policy?.action && (
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              r.policy.action === 'allow' ? 'badge-allow' : r.policy.action === 'block' ? 'badge-block' : 'badge-warn'
                            }`}>
                              {r.policy.action}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!results && !scanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <GlassCard delay={0.15} hoverEffect={false}>
            <div className="text-center py-16 lg:py-20">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500/10 to-indigo-600/10 rounded-2xl flex items-center justify-center mb-5 border border-violet-500/10">
                <Layers className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5">No batch scans yet</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">Paste URLs or upload a CSV file above, then click <span className="text-violet-400 font-medium">Scan All</span> to start.</p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default BatchScan;
