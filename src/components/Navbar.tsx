import React, { useState } from 'react';
import { Sparkles, Shield, LogOut, PlusCircle, LayoutGrid, Eye, Search, X, Palette, Feather, Info, Menu } from 'lucide-react';

interface NavbarProps {
  isOwner: boolean;
  adminEmail?: string;
  activeView: 'public' | 'manage' | 'create' | 'edit' | 'detail' | 'login';
  onNavigate: (view: 'public' | 'manage' | 'create') => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  characterCount: number;
  onOpenAppearanceModal?: () => void;
  onOpenAboutModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isOwner,
  adminEmail,
  activeView,
  onNavigate,
  onLogout,
  searchQuery,
  onSearchChange,
  characterCount,
  onOpenAppearanceModal,
  onOpenAboutModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToCharacters = () => {
    if (activeView !== 'public') {
      onNavigate('public');
    }
    setTimeout(() => {
      const el = document.getElementById('characters-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#070812]/80 border-b border-white/[0.08] transition-all">
      {/* Top Banner when in Admin Mode (Elegantly styled in dreamy tones) */}
      {isOwner && (
        <div className="bg-gradient-to-r from-purple-950/70 via-pink-950/70 to-sky-950/70 border-b border-pink-500/20 px-4 py-1.5 text-xs flex items-center justify-between text-pink-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="font-medium tracking-wide text-white/90 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-pink-300" />
              <span>Admin:</span>
              <span className="font-mono text-cyan-200 font-normal">{adminEmail || 'admin'}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-pink-900/50 border border-pink-400/30 text-pink-200">
                Chủ Kho
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenAppearanceModal && (
              <button
                onClick={onOpenAppearanceModal}
                className="text-xs text-pink-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-pink-900/30 hover:bg-pink-900/50 px-2.5 py-0.5 rounded-lg border border-pink-400/30"
                title="Thay đổi Avatar, Cover và Theme toàn trang"
              >
                <Palette className="w-3.5 h-3.5 text-pink-300" />
                <span className="hidden sm:inline">Diện Mạo</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="text-xs text-red-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-red-950/40 hover:bg-red-900/60 px-2.5 py-0.5 rounded-lg border border-red-500/30"
              title="Đăng xuất khỏi phiên quản trị"
            >
              <LogOut className="w-3 h-3" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand: Một Góc Trời */}
        <div 
          onClick={() => onNavigate('public')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-sky-400 p-[1.5px] shadow-[0_0_20px_rgba(244,114,182,0.3)] group-hover:shadow-[0_0_25px_rgba(244,114,182,0.6)] transition-all duration-300">
            <div className="w-full h-full bg-[#0a0c18] rounded-[14px] flex items-center justify-center">
              <Feather className="w-5 h-5 text-pink-300 group-hover:-rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wider font-poetic text-transparent bg-clip-text bg-gradient-to-r from-pink-100 via-purple-100 to-sky-200 group-hover:from-white group-hover:to-pink-200 transition-colors">
              MỘT GÓC TRỜI
            </h1>
            <p className="text-[11px] text-zinc-400 font-garamond italic hidden sm:block">
              Hồn treo gió · Không gian lưu giữ nhân vật
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Trang chủ · Nhân vật · Giới thiệu) */}
        <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => onNavigate('public')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'public'
                ? 'text-pink-200 bg-white/[0.06] font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            Trang Chủ
          </button>

          <button
            type="button"
            onClick={scrollToCharacters}
            className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer"
          >
            Kho Nhân Vật ({characterCount})
          </button>

          {onOpenAboutModal && (
            <button
              type="button"
              onClick={onOpenAboutModal}
              className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Giới Thiệu</span>
            </button>
          )}
        </nav>

        {/* Search Bar for Public & Manage views */}
        {(activeView === 'public' || activeView === 'manage') && (
          <div className="flex-1 max-w-xs sm:max-w-sm mx-1 sm:mx-2 relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300/60 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm nhân vật..."
                className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-400/60 text-white rounded-full pl-9.5 pr-8 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-zinc-500 placeholder:italic"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Navigation & Owner Controls */}
        <div className="flex items-center gap-2">
          {isOwner ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onNavigate('public')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'public'
                    ? 'bg-pink-600/25 text-pink-200 border border-pink-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Xem giao diện công khai"
              >
                <Eye className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">Khách</span>
              </button>

              <button
                onClick={() => onNavigate('manage')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'manage'
                    ? 'bg-purple-600/25 text-purple-200 border border-purple-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                title="Bảng điều khiển quản lý nhân vật"
              >
                <LayoutGrid className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Quản Lý</span>
              </button>

              <button
                onClick={() => onNavigate('create')}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 hover:from-pink-400 hover:to-sky-400 text-white shadow-lg shadow-pink-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Tạo nhân vật mới"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Tạo Char</span>
              </button>
            </div>
          ) : (
            /* Mobile menu button for public users */
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-white/5 space-y-1 bg-[#090b16]">
          <button
            onClick={() => {
              onNavigate('public');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5"
          >
            Trang Chủ
          </button>
          <button
            onClick={() => {
              scrollToCharacters();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5"
          >
            Kho Nhân Vật ({characterCount})
          </button>
          {onOpenAboutModal && (
            <button
              onClick={() => {
                onOpenAboutModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/5"
            >
              Giới Thiệu Không Gian
            </button>
          )}
        </div>
      )}
    </header>
  );
};
