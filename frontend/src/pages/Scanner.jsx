import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, CheckCircle, Shield, AlertTriangle, ExternalLink, Download } from 'lucide-react';
import axios from 'axios';

const Scanner = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

const handleScan = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/api/scan/', {
        repo_url: repoUrl
      });
      console.log("API Response:", response.data);
      setResult(response.data);
    } catch (err) {
      console.log("API Error:", err);
      setError(err.response?.data?.message || 'Something went wrong. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'LOW': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'HIGH': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch(level) {
      case 'LOW': return <CheckCircle className="w-5 h-5" />;
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5" />;
      case 'HIGH': return <Shield className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">License Scanner</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Enter a GitHub repository URL to check license compatibility
        </p>
      </div>

      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/facebook/react"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Repository
              </>
            )}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Repository Info */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📦 Repository Information</h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">URL:</span>{' '}
                <a href={result.repo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  {result.repo_url} <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Repository:</span> {result.repo_name}
              </p>
            </div>
          </div>

          {/* License Info */}
          <div className="rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📜 License Information</h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Main License</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{result.license?.name || 'Not Found'}</p>
                {result.license?.key && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">SPDX: {result.license.key}</p>
                )}
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getRiskColor(result.risk_level)}`}>
                {getRiskIcon(result.risk_level)}
                <span className="font-medium">Risk: {result.risk_level}</span>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          {(result.recommendation || result.recommendations) && (
            <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">💡 Recommendation</h3>
              <p className="text-gray-700 dark:text-gray-300">{result.recommendation || result.recommendations}</p>
            </div>
          )}

          {/* Download PDF Button */}
          <div className="flex justify-end">
            <button
              onClick={async () => {
                try {
                  const response = await axios.post('/api/export-pdf/', {
                    scan_data: result
                  }, {
                    responseType: 'blob'
                  });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `license_report_${new Date().toISOString().slice(0,19)}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('PDF export failed:', error);
                  alert('Failed to generate PDF');
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
          </div>

          {/* Raw JSON */}
          <details className="rounded-2xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">Show Raw Response</summary>
            <pre className="mt-3 text-xs overflow-auto p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </motion.div>
      )}
    </div>
  );
};

export default Scanner;