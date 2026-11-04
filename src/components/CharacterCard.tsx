import React, { useState } from 'react';
import { MessageSquare, ExternalLink, Edit3, Trash2, Eye, EyeOff, Sparkles, Feather } from 'lucide-react';
import { Character } from '../types';
import { FALLBACK_AVATAR_SVG } from '../services/siteConfig';

interface CharacterCardProps {
  character: Character;
  isOwner?: boolean;
  onSelect: (char: Character) => void;
  onEdit?: (char: Character) => void;
  onDelete?: (char: Character) => void;
  onTogglePublish?: (char: Character) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isOwner = false,
  onSelect,
  onEdit,
  onDelete,
  onTogglePublish
}) => {
  const [coverError, setCoverError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { theme } = character;
  const primaryColor = theme?.primaryColor || '#c084fc';
  const secondaryColor = theme?.secondaryColor || '#f472b6';

  // Aesthetic fallback vector SVG for character cover (never dark black)
  const defaultCardCover = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%232e1065"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="600" height="340" fill="url(%23g)"/><circle cx="300" cy="170" r="100" fill="%23f472b6" opacity="0.15" filter="blur(20px)"/><text x="50%" y="50%" fill="%23e2e8f0" font-family="serif" font-size="20" font-style="italic" text-anchor="middle" opacity="0.75">${encodeURIComponent(character.name)}</text></svg>`;

  const resolvedCover = coverError || !character.cover ? defaultCardCover : character.cover;
  const resolvedAvatar = avatarError || !character.avatar ? FALLBACK_AVATAR_SVG : character.avatar;

  return (
    <div
      onClick={() => onSelect(character)}
      className="group relative flex flex-col rounded-[2rem] overflow-hidden border border-white/10 hover:border-pink-400/40 transition-all duration-500 hover:-translate-y-2 bg-[#0d0f1e]/85 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(244,114,182,0.18)] cursor-pointer"
    >
      {/* Cover Artwork Container */}
      <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-gradient-to-b from-[#16192e] to-[#0c0e1a]">
        <img
          src={resolvedCover}
          alt={character.name}
          onError={() => setCoverError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out"
          loading="lazy"
        />

        {/* Soft atmospheric gradient over cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1e] via-[#0d0f1e]/40 to-transparent" />

        {/* Owner status badge (Admin ONLY) */}
        {isOwner && (
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-20">
            <span 
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border backdrop-blur-md shadow-lg flex items-center gap-1.5 ${
                character.published
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              {character.published ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-amber-400" />}
              {character.published ? 'Công khai' : 'Bản nháp / Ẩn'}
            </span>
          </div>
        )}

        {/* Owner Quick Action Buttons on Cover (Admin ONLY) */}
        {isOwner && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-20"
          >
            {onTogglePublish && (
              <button
                type="button"
                onClick={() => onTogglePublish(character)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
                title={character.published ? 'Ẩn nhân vật khỏi kho' : 'Xuất bản ra kho công khai'}
              >
                {character.published ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5 text-emerald-300" />}
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(character)}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
                title="Chỉnh sửa hồ sơ nhân vật"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-300" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(character)}
                className="p-2 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-red-100 border border-red-500/30 backdrop-blur-md transition-colors"
                title="Xóa nhân vật vĩnh viễn"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Circular Avatar overlapping cover */}
        <div className="absolute -bottom-6 left-6 z-10">
          <div 
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 shadow-xl transition-transform duration-500 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, #fbcfe8, ${primaryColor}, #38bdf8)`
            }}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0c16] border-2 border-[#0d0f1e]">
              <img
                src={resolvedAvatar}
                alt={character.name}
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover transition-all duration-300"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="pt-8 px-6 pb-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Character Name in poetic typography */}
          <h3 className="text-xl sm:text-2xl font-bold font-poetic text-white group-hover:text-pink-200 transition-colors line-clamp-1 mb-1.5">
            {character.name}
          </h3>

          {/* Poetic Tagline */}
          <p className="text-xs sm:text-sm text-zinc-300/85 font-garamond italic line-clamp-2 min-h-[2.5rem] mb-3 leading-relaxed">
            {character.tagline ? `“${character.tagline}”` : 'Một câu chuyện chưa kể giữa khoảng trời...'}
          </p>

          {/* Tags */}
          {character.tags && character.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {character.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-pink-500/10 border border-pink-400/20 text-pink-300/90"
                >
                  #{tag}
                </span>
              ))}
              {character.tags.length > 3 && (
                <span className="text-[10px] text-zinc-500 self-center font-mono">
                  +{character.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="flex items-center gap-2 pt-3 border-t border-white/[0.06] mt-auto"
        >
          <button
            type="button"
            onClick={() => onSelect(character)}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-white bg-gradient-to-r from-pink-500/90 via-purple-600/90 to-sky-500/90 hover:from-pink-500 hover:to-sky-500 shadow-md shadow-pink-600/20 cursor-pointer active:scale-95"
          >
            <span>Khám Phá</span>
          </button>

          {/* Chat Link (if present) */}
          {character.chatLink && character.chatLink.trim() !== '' && (
            <a
              href={character.chatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border border-white/10 hover:border-pink-400/40 bg-white/[0.03] hover:bg-white/[0.08] text-pink-200 transition-all flex items-center justify-center gap-1.5"
              title="Trò chuyện với nhân vật"
            >
              <MessageSquare className="w-3.5 h-3.5 text-pink-300" />
              <span>Chat</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
