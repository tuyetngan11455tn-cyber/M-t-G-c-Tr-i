import React, { useState, useRef } from 'react';
import { 
  X, 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  CloudSun, 
  Moon, 
  Flame, 
  Snowflake,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { SiteConfig, GlobalSiteTheme } from '../types';
import { uploadImageFile } from '../services/api';
import { THEME_PRESETS_INFO, FALLBACK_AVATAR_SVG, FALLBACK_COVER_SVG } from '../services/siteConfig';

interface AdminAppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteConfig: SiteConfig;
  onSave: (updates: Partial<SiteConfig>) => void;
}

export const AdminAppearanceModal: React.FC<AdminAppearanceModalProps> = ({
  isOpen,
  onClose,
  siteConfig,
  onSave
}) => {
  const [avatar, setAvatar] = useState(siteConfig.avatar || '');
  const [cover, setCover] = useState(siteConfig.cover || '');
  const [theme, setTheme] = useState<GlobalSiteTheme>(siteConfig.theme || 'normal');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle avatar file upload via server persistent uploads
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      setAvatar(url);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh đại diện lên máy chủ');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle cover file upload via server persistent uploads
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      setCover(url);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh bìa lên máy chủ');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleApply = () => {
    // Check against temporary blob URLs
    if (avatar.startsWith('blob:')) {
      setError('Vui lòng tải ảnh đại diện lên bằng nút "Tải từ máy" hoặc nhập URL hợp lệ. Blob URL tạm thời không tồn tại sau khi đóng trang.');
      return;
    }
    if (cover.startsWith('blob:')) {
      setError('Vui lòng tải ảnh bìa lên bằng nút "Tải từ máy" hoặc nhập URL hợp lệ. Blob URL tạm thời không tồn tại sau khi đóng trang.');
      return;
    }

    onSave({
      avatar: avatar.trim() || siteConfig.avatar,
      cover: cover.trim() || siteConfig.cover,
      theme
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-[#0c0e1e] border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
        style={{ boxShadow: '0 0 60px rgba(244, 114, 182, 0.2)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-sky-400 p-[1.5px] shadow-lg">
            <div className="w-full h-full bg-[#0a0c16] rounded-[14px] flex items-center justify-center">
              <Palette className="w-6 h-6 text-pink-300" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-poetic text-white">
              Cài Đặt Diện Mạo Website
            </h2>
            <p className="text-xs text-zinc-400 font-garamond italic mt-0.5">
              Độc quyền Admin · Lưu trữ bền vững Avatar, Ảnh bìa & Chủ đề toàn trang
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 1. THEME SELECTION (4 GLOBAL THEMES) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300 mb-1.5 font-poetic">
              1. Chủ Đề Toàn Trang (Global Theme)
            </label>
            <p className="text-[11px] text-zinc-400 mb-3 font-garamond italic">
              Chỉ Admin được đổi. Chủ đề sẽ được lưu trên máy chủ và tự động đồng bộ cho mọi độc giả.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Normal */}
              <div 
                onClick={() => setTheme('normal')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'normal'
                    ? 'bg-pink-950/30 border-pink-400 ring-2 ring-pink-500/25 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-pink-300" />
                    <span className="text-sm font-bold font-poetic text-white">Bình thường</span>
                  </div>
                  {theme === 'normal' && <Check className="w-4 h-4 text-pink-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
                  Tone be, kem, hồng hoa anh đào, xanh trời nhạt, mây trời thơ mộng.
                </p>
                <div className="flex gap-1.5">
                  {THEME_PRESETS_INFO.normal.colors.map((c, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Tết */}
              <div 
                onClick={() => setTheme('tet')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'tet'
                    ? 'bg-red-950/30 border-red-400 ring-2 ring-red-500/25 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold font-poetic text-white">Tết</span>
                  </div>
                  {theme === 'tet' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
                  Đỏ thắm, vàng kim, hoa mai hoa đào, đèn lồng, khí sắc mùa xuân.
                </p>
                <div className="flex gap-1.5">
                  {THEME_PRESETS_INFO.tet.colors.map((c, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Noel */}
              <div 
                onClick={() => setTheme('noel')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'noel'
                    ? 'bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-500/25 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-sky-300" />
                    <span className="text-sm font-bold font-poetic text-white">Noel</span>
                  </div>
                  {theme === 'noel' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
                  Đỏ noel, xanh lá thông, tuyết trắng tinh khôi, đèn ấm áp.
                </p>
                <div className="flex gap-1.5">
                  {THEME_PRESETS_INFO.noel.colors.map((c, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Trung Thu */}
              <div 
                onClick={() => setTheme('trung_thu')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  theme === 'trung_thu'
                    ? 'bg-indigo-950/30 border-indigo-400 ring-2 ring-indigo-500/25 shadow-lg'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-bold font-poetic text-white">Trung Thu</span>
                  </div>
                  {theme === 'trung_thu' && <Check className="w-4 h-4 text-yellow-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed mb-2.5">
                  Xanh đêm, tím nhẹ, vàng ánh trăng, trăng tròn vằng vặc, đèn lồng.
                </p>
                <div className="flex gap-1.5">
                  {THEME_PRESETS_INFO.trung_thu.colors.map((c, i) => (
                    <span key={i} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. AVATAR WEBSITE */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300 mb-2 font-poetic">
              2. Avatar Độc Quyền Của Website
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-400/60 p-0.5 shrink-0 bg-gradient-to-br from-pink-900/40 to-purple-900/40 shadow-xl">
                <img 
                  src={avatar || FALLBACK_AVATAR_SVG} 
                  alt="Avatar Preview" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_AVATAR_SVG;
                  }}
                  className="w-full h-full object-cover rounded-full" 
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="URL ảnh đại diện hoặc tải tệp lên..."
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="px-3 py-1.5 rounded-xl bg-pink-600/25 hover:bg-pink-600/40 text-pink-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingAvatar ? 'Đang lưu vào máy chủ...' : 'Tải ảnh từ máy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatar('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs cursor-pointer transition-colors"
                  >
                    Mẫu mặc định
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatar(FALLBACK_AVATAR_SVG)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs cursor-pointer transition-colors"
                  >
                    Họa tiết Vector
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ẢNH BÌA WEBSITE (Cover) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300 mb-2 font-poetic">
              3. Ảnh Bìa (Cover) Website
            </label>
            <div className="space-y-2.5">
              <div className="h-32 w-full rounded-2xl overflow-hidden border border-white/15 relative bg-gradient-to-br from-pink-950/40 via-purple-950/40 to-sky-950/40 shadow-inner">
                <img 
                  src={cover || FALLBACK_COVER_SVG} 
                  alt="Cover Preview" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_COVER_SVG;
                  }}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                  <span className="text-[11px] text-zinc-200 font-poetic">Xem trước ảnh bìa toàn chiều ngang</span>
                </div>
              </div>
              <input
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="URL ảnh bìa hoặc tải tệp lên..."
                className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="px-3 py-1.5 rounded-xl bg-pink-600/25 hover:bg-pink-600/40 text-pink-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingCover ? 'Đang lưu vào máy chủ...' : 'Tải ảnh từ máy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCover(THEME_PRESETS_INFO[theme].coverPreset)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs cursor-pointer transition-colors"
                >
                  Gợi ý theo Theme {THEME_PRESETS_INFO[theme].name}
                </button>
                <button
                  type="button"
                  onClick={() => setCover(FALLBACK_COVER_SVG)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs cursor-pointer transition-colors"
                >
                  Tranh Mây Trời Vector
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl font-bold font-poetic text-xs text-white bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 hover:from-pink-400 hover:to-sky-400 shadow-lg shadow-pink-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Lưu & Áp Dụng Bền Vững</span>
          </button>
        </div>
      </div>
    </div>
  );
};
