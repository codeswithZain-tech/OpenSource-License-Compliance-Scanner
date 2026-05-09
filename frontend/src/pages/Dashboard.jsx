import { useState, useEffect } from 'react';
import { Code2, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_scans: 0,
    total_conflicts: 0,
    clean_repos: 0,
    avg_time: '0s'
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const historyResponse = await axios.get('/api/history/');
      const scans = historyResponse.data.scans;
      
      const completedScans = scans.filter(s => s.status === 'completed');
      const totalScans = completedScans.length;
      
      setStats({
        total_scans: totalScans,
        total_conflicts: 0, // Will update after real conflict detection
        clean_repos: totalScans,
        avg_time: '~5s'
      });
      
      setRecentScans(scans.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const statCards = [
    { name: 'Total Scans', value: stats.total_scans, icon: Code2, color: 'blue' },
    { name: 'Conflicts Found', value: stats.total_conflicts, icon: AlertTriangle, color: 'red' },
    { name: 'Clean Repos', value: stats.clean_repos, icon: CheckCircle, color: 'green' },
    { name: 'Avg Time', value: stats.avg_time, icon: Clock, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's your license compliance overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Scans */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Scans</h3>
          <a href="/history" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all →
          </a>
        </div>

        {loading ? (
          <div className="rounded-2xl p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : recentScans.length === 0 ? (
          <div className="rounded-2xl p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <Code2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No scans yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start by scanning your first repository
            </p>
            <a
              href="/scanner"
              className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Start Scanning
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-between flex-wrap gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">
                      {scan.repo_name || scan.repo_url.split('/').slice(-2).join('/')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(scan.created_at)}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded-full ${
                        scan.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={scan.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                  <a
                    href={`/scanner?repo=${encodeURIComponent(scan.repo_url)}`}
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Scan Again
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;