import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-5xl font-serif italic text-navy mb-2">Join Lyceum</h1>
          <p className="text-navy/60 text-lg">Begin your philosophical journey</p>
        </div>

        <div className="greek-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border-2 border-red-600 bg-red-50 text-red-600 px-4 py-3">
                <p className="font-serif italic">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-navy font-serif italic text-lg mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="greek-input w-full"
                placeholder="aristotle"
                minLength={3}
                required
              />
            </div>

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
                minLength={6}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="w-full greek-button disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Join Lyceum'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-stone text-center">
            <p className="text-navy/60">
              Already a member?{' '}
              <Link to="/login" className="text-navy font-serif italic underline">Enter here</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-navy/60 italic text-lg">"Wonder is the beginning of wisdom"</p>
          <p className="text-navy/40 text-sm mt-1">— Socrates</p>
        </div>
      </div>
    </div>
  );
};

export default Register;