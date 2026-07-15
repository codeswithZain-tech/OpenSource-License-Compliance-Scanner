import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import api from '../utils/api';
import ParticleBackground from '../components/ParticleBackground';
import { useToast } from '../components/Toast';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 0) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(formData.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.password_confirm) {
      addToast('Please fill in all fields', 'error'); return;
    }
    if (formData.password !== formData.password_confirm) { addToast('Passwords do not match', 'error'); return; }
    if (strength < 3) { addToast('Please use a stronger password', 'error'); return; }

    setLoading(true);
    try {
      const payload = { username: formData.username, email: formData.email, password: formData.password, password2: formData.password_confirm };
      const response = await api.post('/auth/register/', payload);
      if (response.data.status === 'success') {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        addToast('Account created successfully!', 'success');
        navigate('/');
      }
    } catch (error) { addToast(error.response?.data?.message || 'Failed to register', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-strong p-8 lg:p-10 rounded-3xl shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1.5">Create Account</h1>
            <p className="text-sm text-slate-500">Join to start scanning repositories</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 ml-1 mb-1.5 block">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="johndoe" value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-icon pl-11 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 ml-1 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" placeholder="john@example.com" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-icon pl-11 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 ml-1 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-icon pl-11 pr-12 text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="flex gap-1 mt-2 px-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= strength ? (strength < 3 ? 'bg-red-500' : strength < 5 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-white/[0.06]'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 ml-1 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  className="input-icon pl-11 pr-12 text-sm" />
                {formData.password_confirm.length > 0 && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {formData.password === formData.password_confirm ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <button type="submit"
              disabled={loading || (formData.password_confirm.length > 0 && formData.password !== formData.password_confirm)}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 group">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
