import React, { useState } from 'react';
import { Camera, Sparkles, Wind, CloudSun, Palette, Cloud, Sun } from 'lucide-react';
import { SiteConfig } from '../types';
import { FALLBACK_AVATAR_SVG, FALLBACK_COVER_SVG, THEME_PRESETS_INFO } from '../services/siteConfig';

interface ProfileHeaderProps {
  siteConfig: SiteConfig;
  isOwner: boolean;
  onOpenAdminSettings?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  siteConfig,
  isOwner,
  onOpenAdminSettings
}) => {
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const themeInfo = THEME_PRESETS_INFO[siteConfig.theme || 'normal'];

  // Resolve cover and avatar source safely
  const resolvedCover = coverError || !siteConfig.cover ? FALLBACK_COVER_SVG : siteConfig.cover;
  const resolvedAvatar = avatarError || !siteConfig.avatar ? FALLBACK_AVATAR_SVG : siteConfig.avatar;

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
      {/* Outer sanctuary wrapper with organic soft styling */}
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl bg-white/[0.02]">
        
        {/* 1. PANORAMIC COVER BANNER */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[26rem] overflow-hidden bg-gradient-to-b from-[#12162a] via-[#1a1936] to-[#0c0e1a]">
          {/* Poetic sky & cloud background placeholder (never black) */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              background: `linear-gradient(135deg, ${themeInfo.colors[0]}15 0%, ${themeInfo.colors[2]}20 40%, #0d1020 100%)`
            }}
          />

          {/* Gentle moving cloud layer */}
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -left-10 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
            <div className="absolute top-20 right-10 w-[30rem] h-[30rem] rounded-full bg-pink-300/10 blur-3xl" />
          </div>

          <img
            src={resolvedCover}
            alt="Ảnh bìa Một Góc Trời"
            onLoad={() => setCoverLoaded(true)}
            onError={() => {
              setCoverError(true);
              setCoverLoaded(true);
            }}
            className={`w-full h-full object-cover object-center transition-all duration-1000 ${
              coverLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-80 blur-sm'
            }`}
          />

          {/* Ethereal bottom blend & radial soft lighting */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-[#090b14]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

          {/* Poetic space badge in cover */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs text-white/90 shadow-xl">
            <CloudSun className="w-4 h-4 text-pink-300 animate-pulse" />
            <span className="font-poetic tracking-wider text-xs sm:text-sm font-medium">Không Gian Một Góc Trời</span>
          </div>

          {/* Admin Cover Quick Action (Admin ONLY - strictly hidden from public visitors) */}
          {isOwner && onOpenAdminSettings && (
            <button
              onClick={onOpenAdminSettings}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-pink-400/30 hover:border-pink-300 text-xs text-pink-100 flex items-center gap-2 transition-all shadow-xl cursor-pointer group hover:scale-[1.02]"
              title="Chỉnh sửa Avatar, Cover hoặc Chủ đề website (Chỉ dành cho Admin)"
            >
              <Palette className="w-3.5 h-3.5 text-pink-300 group-hover:rotate-12 transition-transform" />
              <span className="font-medium hidden sm:inline">Chỉnh Diện Mạo</span>
            </button>
          )}
        </div>

        {/* 2. PROFILE SECTION (Avatar + Name + Tagline) */}
        <div className="relative px-6 sm:px-12 pb-10 pt-0 bg-gradient-to-b from-[#090b14] via-[#0c0e1b] to-[#0e1122]">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-20 sm:-mt-24 md:-mt-28">
            
            {/* AVATAR: Circular, prominent, luminous glow ring */}
            <div className="relative group shrink-0">
              {/* Outer soft aura pulse */}
              <div 
                className="absolute -inset-1 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${themeInfo.colors[1]}, ${themeInfo.colors[2]})`
                }}
              />

              <div 
                className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full p-1.5 transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, #fbcfe8 0%, #c084fc 50%, #38bdf8 100%)`
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0c16] border-4 border-[#090b14] shadow-2xl relative">
                  {/* Soft loading shimmer */}
                  {!avatarLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 to-purple-900/30 animate-pulse flex items-center justify-center">
                      <Wind className="w-8 h-8 text-pink-300/40 animate-spin" />
                    </div>
                  )}

                  <img
                    src={resolvedAvatar}
                    alt={siteConfig.profileName}
                    onLoad={() => setAvatarLoaded(true)}
                    onError={() => {
                      setAvatarError(true);
                      setAvatarLoaded(true);
                    }}
                    className={`w-full h-full object-cover object-center transition-all duration-700 ${
                      avatarLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                    }`}
                  />
                </div>
              </div>

              {/* Admin Avatar Quick Action icon (Admin ONLY) */}
              {isOwner && onOpenAdminSettings && (
                <button
                  onClick={onOpenAdminSettings}
                  className="absolute bottom-2 right-2 z-20 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-[#090b14] flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Thay đổi ảnh đại diện độc quyền của website"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* NAME, SPACE TITLE & TAGLINE */}
            <div className="flex-1 text-center sm:text-left space-y-2 mt-1 sm:mt-0 sm:mb-2">
              
              {/* Space Name & Profile Badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-pink-500/10 border border-pink-400/30 text-pink-200 font-poetic">
                  {siteConfig.siteName || 'Một Góc Trời'}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-light">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kho nhân vật & Những mẩu chuyện được lưu giữ</span>
                </span>
              </div>

              {/* 3. TÊN: "Hồn treo gió" */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-poetic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-100 via-purple-100 to-sky-200 drop-shadow-[0_4px_25px_rgba(244,114,182,0.25)]">
                {siteConfig.profileName || 'Hồn treo gió'}
              </h1>

              {/* 4. TAGLINE: “Hồn treo theo gió, chuyện nằm lại giữa một góc trời.” */}
              <p className="text-sm sm:text-base text-zinc-300/90 font-garamond italic font-light max-w-2xl leading-relaxed sm:leading-loose">
                “{siteConfig.tagline || 'Hồn treo theo gió, chuyện nằm lại giữa một góc trời.'}”
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
