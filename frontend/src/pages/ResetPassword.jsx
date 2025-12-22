import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Verify token is valid
    const verifyToken = async () => {
      try {
        await API.get(`/auth/reset-password/${token}`);
        setValidToken(true);
      } catch (err) {
        setError('Invalid or expired reset link');
        setValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, {
        password
      });
      setMessage(data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-navy font-serif italic">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="greek-card p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-serif italic text-navy mb-4">
            Invalid Link
          </h1>
          <p className="text-navy/60 mb-6">
            This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="greek-button"
          >
            Request New Link
          </button>
          <div className="mt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-navy font-serif italic hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="greek-card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-serif italic text-navy mb-2">
            Reset Password
          </h1>
          <p className="text-navy/60">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div className="border-2 border-green-600 bg-green-50 p-4 mb-6 rounded">
            <p className="text-green-800 font-serif italic text-center">
              ✅ {message}
            </p>
            <p className="text-green-600 text-sm text-center mt-2">
              Redirecting to login...
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

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-navy font-serif italic mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="greek-input w-full"
                placeholder="At least 6 characters"
                required
                minLength={6}
                disabled={loading}
              />
              <p className="text-navy/40 text-sm mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-navy font-serif italic mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="greek-input w-full"
                placeholder="Re-enter your password"
                required
                minLength={6}
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
                  Resetting...
                </span>
              ) : (
                '🔒 Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
