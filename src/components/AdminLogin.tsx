import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { loginAdminAccount, setupAdminAccount } from '../services/api';
import { getStoredAdminAccount } from '../services/adminAuth';

interface AdminLoginProps {
  isConfigured: boolean;
  onLoginSuccess: (email: string) => void;
  onBackToPublic: () => void;
  onSetupSuccess?: (email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  isConfigured,
  onLoginSuccess,
  onBackToPublic,
  onSetupSuccess
}) => {
  const [mode, setMode] = useState<'setup' | 'login'>(isConfigured ? 'login' : 'setup');
  
  // Prefill existing admin email if already configured
  const existingAccount = getStoredAdminAccount();
  const [email, setEmail] = useState(existingAccount?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode if parent state updates
  useEffect(() => {
    if (isConfigured) {
      setMode('login');
      const account = getStoredAdminAccount();
      if (account?.email && !email) {
        setEmail(account.email);
      }
    } else {
      setMode('setup');
    }
  }, [isConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    const isSetupMode = mode === 'setup' && !isConfigured;

    if (isSetupMode) {
      if (password.length < 6) {
        setError('Mật khẩu Admin cần ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSetupMode) {
        const res = await setupAdminAccount(cleanEmail, password);
        const registeredEmail = (res as any).email || (res as any).user?.email || cleanEmail;
        setSuccessNotice('Khởi tạo tài khoản Admin duy nhất thành công! Chức năng khởi tạo đã được khóa vĩnh viễn.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        if (onSetupSuccess) {
          onSetupSuccess(registeredEmail);
        }
        onLoginSuccess(registeredEmail);
      } else {
        const res = await loginAdminAccount(cleanEmail, password);
        const loggedEmail = (res as any).email || (res as any).user?.email || cleanEmail;
        onLoginSuccess(loggedEmail);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi khi xác thực tài khoản Admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSetupActive = mode === 'setup' && !isConfigured;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative animate-in fade-in duration-300">
      <div 
        className="w-full max-w-md bg-[#0c0e1b]/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative"
        style={{ boxShadow: '0 0 50px rgba(168, 85, 247, 0.25)' }}
      >
        {/* Back Link */}
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang Kho Char</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 p-[1.5px] shadow-[0_0_20px_rgba(168,85,247,0.4)] shrink-0">
            <div className="w-full h-full bg-[#0a0c16] rounded-[14px] flex items-center justify-center">
              {isSetupActive ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-fuchsia-400" />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white">
              {isSetupActive ? 'Khởi Tạo Admin Đầu Tiên' : 'Đăng Nhập Admin'}
            </h2>
            <p className="text-xs text-zinc-400 font-light mt-0.5">
              {isSetupActive 
                ? 'Thiết lập tài khoản quản trị DUY NHẤT của hệ thống' 
                : 'Cổng truy cập khu vực quản lý Kho Char'}
            </p>
          </div>
        </div>

        {/* Success Notice if just transitioned from Setup */}
        {successNotice && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs leading-relaxed animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Informative Security Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200/90 leading-relaxed">
          {isSetupActive ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Quy tắc bảo mật Admin duy nhất:</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-normal">
                Hệ thống chỉ cho phép tạo duy nhất 1 tài khoản Admin. Sau khi tạo thành công, chức năng khởi tạo sẽ tự động khóa vĩnh viễn.
              </p>
            </div>
          ) : (
            <p>
              Hệ thống chỉ cấp quyền quản trị cho <strong>duy nhất 1 tài khoản Admin</strong> đã được thiết lập. Người dùng thường không thể đăng ký hay truy cập vào Dashboard.
            </p>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs leading-relaxed animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Email Quản Trị
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
                autoComplete="email"
                autoFocus={!email}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Mật Khẩu
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
                autoComplete={isSetupActive ? 'new-password' : 'current-password'}
                autoFocus={Boolean(email)}
                required
              />
            </div>
          </div>

          {/* Confirm Password (only for first-time initialization) */}
          {isSetupActive && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu để xác nhận..."
                  className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl font-bold font-cinzel text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isSetupActive
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-600/30'
              }`}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSetupActive ? (
                <span>Khởi Tạo & Kích Hoạt Admin</span>
              ) : (
                <span>Đăng Nhập Quản Trị</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer note */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-zinc-500">
          <span>Quyền Quản Trị Duy Nhất · Bảo Vệ Hệ Thống</span>
        </div>
      </div>
    </div>
  );
};
