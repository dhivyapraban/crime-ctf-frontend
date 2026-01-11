import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import chiefImage from '../assets/images/chief.png';
import { chiefAPI } from '../api/auth';

const ChiefLogin: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('userRole');
      
      if (token && role === 'chief') {
        try {
          // Verify token is valid
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chief/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            // Token is valid, redirect to dashboard
            navigate('/chief-dashboard');
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
        }
      }
    };
    
    checkAuth();
    setMounted(true);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Login via API
      const response = await chiefAPI.login(form.username, form.password);

      if (response.success) {
        // Store token and role in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.role || 'chief');
        
        // Store user data in sessionStorage
        sessionStorage.setItem('chiefData', JSON.stringify(response.user));

        // Navigate to dashboard
        setTimeout(() => {
          navigate('/chief-dashboard');
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${chiefImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Subtle dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Main form container - styled as document on desk */}
      <div className="relative w-screen h-screen flex items-center justify-center p-8">
        <div
          className={`relative bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 border-4 border-amber-800 p-10 shadow-2xl max-w-md w-full transition-all duration-700 ${
            mounted ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 -rotate-1'
          }`}
          style={{
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(139, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          {/* Paper texture overlay */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='paper' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23000' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23paper)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Document header with official seal look */}
          <div className="relative mb-6 pb-4 border-b-2 border-amber-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-amber-900 opacity-60 tracking-widest uppercase">
                Authorization Form
              </div>
              <div className="w-12 h-12 border-4 border-amber-800 rounded-full flex items-center justify-center bg-amber-100">
                <div className="text-amber-900 font-bold text-lg">🔪</div>
              </div>
            </div>
            <h1
              className={`text-3xl font-serif font-bold text-amber-900 text-shadow transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              CHIEF LOGIN
            </h1>
            <div className="text-xs font-mono text-amber-700 mt-2 italic">
              Restricted Access - Administrative Only
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className={`transition-all duration-700 delay-100 ${
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <label className="block text-amber-900 mb-2 font-serif text-sm font-semibold">
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-white border-2 border-amber-700 text-amber-900 px-4 py-2.5 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 focus:shadow-lg transition-all duration-300 font-serif"
                placeholder="Enter username"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                required
              />
            </div>

            <div className={`transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <label className="block text-amber-900 mb-2 font-serif text-sm font-semibold">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white border-2 border-amber-700 text-amber-900 px-4 py-2.5 focus:outline-none focus:border-amber-900 focus:ring-2 focus:ring-amber-600 focus:shadow-lg transition-all duration-300 font-serif"
                placeholder="Enter password"
                style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                required
              />
            </div>

            {error && (
              <div className="text-red-700 bg-red-100 border border-red-300 px-3 py-2 text-sm font-serif">
                {error}
              </div>
            )}

            <div className={`pt-4 transition-all duration-700 delay-300 ${
              mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-800 text-amber-50 font-serif font-bold text-lg py-3 px-6 hover:bg-amber-900 hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group border-2 border-amber-900"
                style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              >
                <span className="relative z-10">{isSubmitting ? 'AUTHORIZING...' : 'ENTER DASHBOARD'}</span>
                <div className="absolute inset-0 bg-amber-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </div>
          </form>

          {/* Official stamp - bottom right */}
          <div className="absolute bottom-6 right-6 text-noir-red text-xs font-mono font-bold opacity-60 transform rotate-12 border-2 border-noir-red px-3 py-1.5 bg-white bg-opacity-90">
            TOP SECRET
          </div>

          {/* Corner fold effect - top right */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-amber-200 border-b-4 border-l-4 border-amber-600 transform rotate-45 translate-x-4 -translate-y-4 opacity-60"></div>

          {/* Typed text lines effect - like document lines */}
          <div className="absolute bottom-24 left-10 right-10 h-px bg-amber-300 opacity-20"></div>
          <div className="absolute bottom-20 left-10 right-16 h-px bg-amber-300 opacity-20"></div>
          <div className="absolute bottom-16 left-10 right-12 h-px bg-amber-300 opacity-20"></div>

          {/* Map pin/paperclip effect */}
          <div className="absolute top-4 left-4 w-6 h-8 border-2 border-amber-700 rounded-sm opacity-40"></div>
          <div className="absolute top-6 left-5 w-4 h-6 border-2 border-amber-700 rounded-sm opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default ChiefLogin;
