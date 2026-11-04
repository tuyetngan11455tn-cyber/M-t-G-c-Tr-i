import React, { useState, useMemo } from 'react';
import { Search, Sparkles, FolderOpen, Heart, Lock, Tag, Feather, CloudSun } from 'lucide-react';
import { Character, SiteConfig } from '../types';
import { CharacterCard } from './CharacterCard';
import { ProfileHeader } from './ProfileHeader';

interface PublicGalleryProps {
  characters: Character[];
  onSelectCharacter: (char: Character) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isOwner?: boolean;
  onEdit?: (char: Character) => void;
  onDelete?: (char: Character) => void;
  onTogglePublish?: (char: Character) => void;
  onOpenAdminLogin?: () => void;
  siteConfig: SiteConfig;
  onOpenAdminSettings?: () => void;
}

export const PublicGallery: React.FC<PublicGalleryProps> = ({
  characters,
  onSelectCharacter,
  searchQuery,
  onSearchChange,
  isOwner = false,
  onEdit,
  onDelete,
  onTogglePublish,
  onOpenAdminLogin,
  siteConfig,
  onOpenAdminSettings
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract unique tags and counts from characters
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    characters.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          const norm = t.trim();
          if (norm) {
            counts[norm] = (counts[norm] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [characters]);

  const uniqueTags = useMemo(() => Object.keys(tagCounts), [tagCounts]);

  // Filter displayed characters by selected tag
  const filteredCharacters = useMemo(() => {
    if (selectedTag === 'all') return characters;
    return characters.filter(c => 
      Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [characters, selectedTag]);

  return (
    <div className="w-full pb-20 animate-in fade-in duration-500">
      {/* 1. SOCIAL PROFILE HEADER BANNER */}
      <ProfileHeader
        siteConfig={siteConfig}
        isOwner={isOwner}
        onOpenAdminSettings={onOpenAdminSettings}
      />

      {/* 2. CHARACTER GALLERY SECTION */}
      <section id="characters-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 scroll-mt-24">
        {/* Section Header: Exact requested title & subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-400/25 text-pink-200 text-xs font-medium mb-3.5 backdrop-blur-md shadow-sm">
            <Feather className="w-3.5 h-3.5 text-pink-300" />
            <span className="font-poetic tracking-wider">Bộ Sưu Tập Nhân Vật</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-poetic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-100 via-purple-100 to-sky-200 mb-3 drop-shadow-[0_2px_20px_rgba(244,114,182,0.2)]">
            Một Góc Trời
          </h2>

          <p className="text-sm sm:text-base text-zinc-300/85 font-garamond italic font-light max-w-xl mx-auto leading-relaxed">
            “Những câu chuyện được treo lại giữa một khoảng trời.”
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-sky-500/40 rounded-full blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative flex items-center bg-[#0d1020]/90 rounded-full border border-white/15 focus-within:border-pink-400/60 px-5 py-3 shadow-2xl backdrop-blur-xl">
                <Search className="w-4 h-4 text-pink-300/80 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Tìm kiếm nhân vật theo tên, phong cách, câu chuyện..."
                  className="w-full bg-transparent text-white text-xs sm:text-sm placeholder:text-zinc-500 placeholder:italic focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tag Filter Chip Bar */}
          {uniqueTags.length > 0 && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 pt-1 px-2 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedTag('all')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedTag === 'all'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 border border-pink-400/50'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  Tất cả ({characters.length})
                </button>

                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedTag === tag
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/25 border border-pink-400/50'
                        : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Tag className="w-3 h-3 opacity-60" />
                    <span>#{tag}</span>
                    <span className="text-[10px] opacity-70">({tagCounts[tag]})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Characters Grid or Empty State */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-20 px-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl max-w-xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 flex items-center justify-center mx-auto mb-4 text-pink-300 shadow-[0_0_20px_rgba(244,114,182,0.2)]">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-poetic text-zinc-100">
              {searchQuery || selectedTag !== 'all' ? 'Không tìm thấy nhân vật nào.' : 'Chưa có nhân vật nào.'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 max-w-md mx-auto leading-relaxed font-garamond italic">
              {searchQuery || selectedTag !== 'all'
                ? `Không có nhân vật nào khớp với bộ lọc tìm kiếm hiện tại. Vui lòng chọn nhãn khác hoặc làm mới từ khóa.` 
                : 'Chủ kho hiện chưa lưu giữ nhân vật nào vào không gian công khai.'}
            </p>
            {(searchQuery || selectedTag !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setSelectedTag('all');
                }}
                className="mt-5 px-5 py-2 rounded-2xl bg-pink-600/25 hover:bg-pink-600/40 text-pink-200 text-xs font-semibold border border-pink-500/30 transition-all cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          /* Cards Grid: Prominent character visuals, responsive on all devices */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCharacters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                isOwner={isOwner}
                onSelect={onSelectCharacter}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePublish={onTogglePublish}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-24 pt-10 border-t border-white/[0.06] text-center text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="font-poetic font-semibold text-zinc-300">Một Góc Trời</span>
            <span>·</span>
            <span className="font-garamond italic text-zinc-400">“Hồn treo theo gió, chuyện nằm lại giữa một góc trời.”</span>
            {onOpenAdminLogin && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="text-zinc-500 hover:text-pink-300 transition-colors inline-flex items-center gap-1 cursor-pointer underline-offset-4 hover:underline"
                  title="Cổng Quản Trị (/admin/login)"
                >
                  <Lock className="w-3 h-3" />
                  <span>Cổng Quản Trị</span>
                </button>
              </>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};
