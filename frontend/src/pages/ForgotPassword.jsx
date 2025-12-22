import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="greek-card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif italic text-navy mb-2">
            Forgot Password?
          </h1>
          <p className="text-navy/60">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {message && (
          <div className="border-2 border-green-600 bg-green-50 p-4 mb-6 rounded">
            <p className="text-green-800 font-serif italic text-center">
              📧 {message}
            </p>
            <p className="text-green-600 text-sm text-center mt-2">
              Check your inbox and spam folder!
            </p>
          </div>
        )}

        {error && (
          <div className="border-2 border-red-600 bg-red-50 p-4 mb-6 rounded">
            <p className="text-red-800 font-serif italic text-center">
              ⚠️ {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-navy font-serif italic mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="greek-input w-full"
              placeholder="philosopher@lyceum.com"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="greek-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </span>
            ) : (
              '📨 Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            to="/login"
            className="block text-navy font-serif italic hover:underline"
          >
            ← Back to Login
          </Link>
          <p className="text-navy/40 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-navy hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
