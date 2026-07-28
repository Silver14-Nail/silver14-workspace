'use client';

import { type FormEvent, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, user, isInitialized } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const destination = searchParams.get('from') || '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInitialized && user) {
      router.replace(destination);
    }
  }, [isInitialized, user, router, destination]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const result = await login(email.trim(), password);
    if (result.ok) {
      router.replace(destination);
    } else {
      setError(result.error ?? 'Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8F8FA' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating circles */}
        <div
          className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C0C0C0, transparent)' }}
        />
        <div
          className="absolute bottom-32 left-8 w-48 h-48 rounded-full"
          style={{ opacity: 0.08, background: 'radial-gradient(circle, #E8E8E8, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #C0C0C0, transparent)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span className="text-white font-semibold text-sm tracking-widest">S</span>
            </div>
            <div>
              <span className="text-white text-sm font-light tracking-[0.3em] uppercase block">
                Silver14
              </span>
              <span className="text-[#9A9A9A] text-xs tracking-widest">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#C0C0C0]" />
              <span className="text-[#9A9A9A] text-xs tracking-[0.2em] uppercase">
                Management Suite
              </span>
            </div>
            <h1
              className="text-white font-light leading-tight mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '3.5rem',
                letterSpacing: '0.02em',
              }}
            >
              Manage your
              <br />
              <span style={{ color: '#C0C0C0', fontStyle: 'italic' }}>boutique</span> with
              <br />
              elegance.
            </h1>
            <p
              className="text-[#6B6B6B] text-sm leading-relaxed max-w-xs"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Full control over your Silver14 storefront — products, orders, customers, analytics,
              and more.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['12 Modules', 'Real-time Analytics', 'Order Management', 'Multi-language'].map(
              (f) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#9A9A9A',
                    letterSpacing: '0.05em',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {f}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[#4A4A4A] text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            &copy; 2026 Silver14. Secure admin access.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-semibold tracking-widest">S</span>
            </div>
            <span
              className="text-[#1A1A1A] text-sm font-light tracking-[0.25em] uppercase"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Silver14
            </span>
          </Link>
        </div>

        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Header */}
          <div className="mb-10">
            <h2
              className="text-[#1A1A1A] font-light mb-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '2.25rem',
                letterSpacing: '0.02em',
              }}
            >
              Welcome back
            </h2>
            <p className="text-[#9A9A9A] text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              Sign in to your admin dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-widest text-[#6B6B6B]"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="admin@silver14.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: '#FFFFFF',
                  border: error ? '1.5px solid #E53E3E' : '1.5px solid #E8E8E8',
                  color: '#1A1A1A',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.border = '1.5px solid #1A1A1A';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.border = '1.5px solid #E8E8E8';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-2 uppercase tracking-widest text-[#6B6B6B]"
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.12em' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: error ? '1.5px solid #E53E3E' : '1.5px solid #E8E8E8',
                    color: '#1A1A1A',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onFocus={(e) => {
                    if (!error) e.target.style.border = '1.5px solid #1A1A1A';
                  }}
                  onBlur={(e) => {
                    if (!error) e.target.style.border = '1.5px solid #E8E8E8';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{
                  background: 'rgba(229,62,62,0.06)',
                  border: '1px solid rgba(229,62,62,0.2)',
                }}
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group mt-2"
              style={{
                background: isLoading ? '#4A4A4A' : '#1A1A1A',
                color: '#FFFFFF',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.06em',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.background = '#2D2D2D';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.background = '#1A1A1A';
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-[#E8E8E8]">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-xs text-[#9A9A9A] hover:text-[#1A1A1A] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                &larr; Return to Store
              </Link>
              <p className="text-xs text-[#C0C0C0]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Silver14 &copy; 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
