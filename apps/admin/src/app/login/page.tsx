'use client';

import { useActionState, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { loginAction } from '@/services/auth.actions';

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
          <span className="text-white text-base font-semibold">L</span>
        </div>
        <h1
          className="text-sm font-semibold tracking-widest uppercase text-[#1A1A1A]"
          style={{ letterSpacing: '0.2em' }}
        >
          Lunelle Admin
        </h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <form action={action} className="space-y-4">
          {/* Error */}
          {state?.error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2.5 text-sm">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{state.error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#374151] mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@example.com"
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[#374151] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-10 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-[#2D2D2D] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-[#9CA3AF]">
        Silver14 Nail — Internal Admin Panel
      </p>
    </div>
  );
}
