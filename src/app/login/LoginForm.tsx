'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DarkModeToggle from '@/components/DarkModeToggle';

interface FormData {
  identifier: string;
  password: string;
}

interface FormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [formData, setFormData] = useState<FormData>({ identifier: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const validateField = (name: string, value: string): string => {
    if (name === 'identifier') {
      if (!value.trim()) return 'Email atau username wajib diisi';
      if (value.trim().length < 3) return 'Minimal 3 karakter';
    }
    if (name === 'password') {
      if (!value) return 'Password wajib diisi';
      if (value.length < 6) return 'Password minimal 6 karakter';
    }
    return '';
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError || undefined, general: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    if (fieldError) setErrors((prev) => ({ ...prev, [name]: fieldError }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdown > 0) return;

    const identifierError = validateField('identifier', formData.identifier);
    const passwordError = validateField('password', formData.password);
    if (identifierError || passwordError) {
      setErrors({ identifier: identifierError || undefined, password: passwordError || undefined });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 429) {
        const secs = data.retryAfter || 60;
        setCountdown(secs);
        setErrors({ general: data.message });
        return;
      }

      if (!data.success) {
        setErrors({ general: data.message || 'Login gagal. Periksa kembali data Anda.' });
        return;
      }

      setIsSuccess(true);
      setTimeout(() => router.push(redirectTo), 1000);
    } catch {
      setErrors({ general: 'Koneksi gagal. Periksa koneksi internet Anda.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
         style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 dark:opacity-5"
             style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 dark:opacity-5"
             style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
      </div>

      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Javis Auth
          </span>
        </div>
        <DarkModeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2 tracking-tight"
                style={{ color: 'var(--text-primary)' }}>
              Selamat Datang
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            {isSuccess && (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600 dark:text-green-400">Login Berhasil!</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Mengalihkan ke dashboard...</p>
                </div>
              </div>
            )}

            {!isSuccess && (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {errors.general && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">{errors.general}</p>
                      {countdown > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          Coba lagi dalam <span className="font-mono font-bold">{countdown}s</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Email atau Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <input
                      id="identifier" name="identifier" type="text" autoComplete="username"
                      placeholder="nama@email.com atau username"
                      value={formData.identifier} onChange={handleChange} onBlur={handleBlur}
                      disabled={isLoading || countdown > 0}
                      className={`input-field pl-10 ${errors.identifier ? 'error' : ''}`}
                    />
                  </div>
                  {errors.identifier && <p className="text-xs text-red-500 dark:text-red-400">{errors.identifier}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input
                      id="password" name="password" type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password" placeholder="Masukkan password Anda"
                      value={formData.password} onChange={handleChange} onBlur={handleBlur}
                      disabled={isLoading || countdown > 0}
                      className={`input-field pl-10 pr-12 ${errors.password ? 'error' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                      {showPassword ? (
                        <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
                </div>

                <button type="submit" disabled={isLoading || countdown > 0}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : countdown > 0 ? (
                    <span>Tunggu {countdown}s</span>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="mt-4 p-3.5 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    🔑 Kredensial Demo:
                  </p>
                  <div className="space-y-0.5 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                    <p><span style={{ color: 'var(--text-secondary)' }}>Email:</span> demo@javis.com</p>
                    <p><span style={{ color: 'var(--text-secondary)' }}>Pass:</span> Password123!</p>
                  </div>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
            PT. Javis Teknologi Albarokah &copy; {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}
