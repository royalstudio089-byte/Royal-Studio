import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Lock, Mail, Shield, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@royalstudio.pk');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center p-4 bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 -z-10" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 mb-3">
            <Camera className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">ROYAL STUDIO</h1>
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mt-0.5">
            Enterprise Studio Manager
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Internal Operations, Bookings & Financial ERP (Pakistan)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="name@royalstudio.pk"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Studio ERP</span>
            )}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Demonstration Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@royalstudio.pk', 'admin123')}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-0.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </div>
              <div className="text-[11px] font-bold text-slate-100">Royal Studio</div>
              <div className="text-[10px] text-amber-400/90 font-medium">Administrator • Active</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('staff@royalstudio.pk', 'staff123')}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold mb-0.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff Login</span>
              </div>
              <div className="text-[11px] text-slate-300">Hamza Tariq</div>
              <div className="text-[10px] text-slate-500">Photographer / Crew</div>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          Royal Visual Studios PVT Ltd • Gulberg III, Lahore, Pakistan
        </div>
      </div>
    </div>
  );
};
