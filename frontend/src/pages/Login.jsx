import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center marble-texture py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block w-24 h-24 rounded-full overflow-hidden border-4 border-navy bg-white mb-4">
            <img 
              src="/logo.jpg" 
              alt="Lyceum" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-5xl font-serif italic text-navy mb-2">Welcome Back</h1>
          <p className="text-navy/60 text-lg">Enter the halls of wisdom</p>
        </div>

        <div className="greek-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border-2 border-red-600 bg-red-50 text-red-600 px-4 py-3">
                <p className="font-serif italic">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-navy font-serif italic text-lg mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="greek-input w-full"
                placeholder="philosopher@lyceum.com"
                required
              />
            </div>

            <div>
              <label className="block text-navy font-serif italic text-lg mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="greek-input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            {/* ✅ NEW: Forgot Password + Remember Me */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 w-4 h-4 text-navy bg-gray-100 border-gray-300 rounded focus:ring-navy focus:ring-2" />
                <span className="text-navy/60 text-sm font-serif italic">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-navy/60 text-sm font-serif italic hover:underline hover:text-navy"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="w-full greek-button disabled:opacity-50">
              {loading ? 'Entering...' : 'Enter Lyceum'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-stone text-center">
            <p className="text-navy/60">
              New to Lyceum?{' '}
              <Link to="/register" className="text-navy font-serif italic underline hover:no-underline">
                Join the discourse
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-navy/60 italic text-lg">"The unexamined life is not worth living"</p>
          <p className="text-navy/40 text-sm mt-1">— Socrates</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
