import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, ExternalLink, Edit3, Sparkles, BookOpen, User, UserCheck, MessageCircle, Terminal } from 'lucide-react';
import { Character, DialogueStyle } from '../types';
import { getBorderRadiusClass, getGlowShadow, getFrameStyleClasses, getImageFilterClass } from '../utils/themeHelper';

interface CharacterDetailProps {
  character: Character;
  isOwner?: boolean;
  onBack: () => void;
  onEdit?: (character: Character) => void;
}

export const CharacterDetail: React.FC<CharacterDetailProps> = ({
  character,
  isOwner = false,
  onBack,
  onEdit
}) => {
  const { theme } = character;
  const radiusClass = getBorderRadiusClass(theme?.borderRadius || '2xl');
  const frameInfo = getFrameStyleClasses(theme?.frameStyle || 'glass');
  const glowShadow = getGlowShadow(theme?.glowColor || '#c084fc', theme?.glowIntensity || 'medium');
  const imageFilterClass = getImageFilterClass(theme?.imageFilter);

  // Allow toggling dialogue display modes
  const [selectedDialogueStyle, setSelectedDialogueStyle] = useState<DialogueStyle>(
    theme?.dialogueDisplay || 'visual_novel'
  );

  // Background styling calculation
  const getCustomBackground = () => {
    const opacity = theme?.backgroundOpacity ?? 0.85;
    const p = theme?.primaryColor || '#a855f7';
    const s = theme?.secondaryColor || '#ec4899';

    switch (theme?.backgroundStyle) {
      case 'cyber':
        return `linear-gradient(180deg, rgba(6, 182, 212, 0.15) 0%, rgba(10, 14, 28, ${opacity}) 80%)`;
      case 'aurora':
        return `radial-gradient(ellipse at top, ${p}30 0%, rgba(8, 10, 20, ${opacity}) 85%)`;
      case 'crimson_void':
        return `linear-gradient(135deg, rgba(153, 27, 27, 0.3) 0%, rgba(8, 8, 14, ${opacity}) 80%)`;
      case 'emerald_mist':
        return `linear-gradient(150deg, rgba(16, 185, 129, 0.22) 0%, rgba(6, 12, 18, ${opacity}) 85%)`;
      case 'deep_space':
        return `radial-gradient(circle at 50% 0%, ${p}35 0%, rgba(6, 7, 13, ${opacity}) 90%)`;
      default:
        return `linear-gradient(145deg, ${p}25 0%, ${s}18 50%, rgba(10, 12, 22, ${opacity}) 100%)`;
    }
  };

  // Sample dialogues for demonstration or owner-configured dialogues
  const dialogues = (character.sampleDialogues && character.sampleDialogues.length > 0)
    ? character.sampleDialogues
    : [
        {
          speaker: 'char' as const,
          text: character.tagline || `Chào mừng bạn đã đến. Ta là ${character.name}.`
        },
        {
          speaker: 'user' as const,
          text: 'Tôi rất vui được gặp bạn. Hãy kể cho tôi nghe thêm về câu chuyện của bạn nhé.'
        },
        {
          speaker: 'char' as const,
          text: 'Hãy đến đây, ta sẽ dẫn lối cho bạn qua từng bí mật chưa từng được hé lộ.'
        }
      ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về kho</span>
        </button>

        {isOwner && onEdit && (
          <button
            onClick={() => onEdit(character)}
            className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 backdrop-blur-md transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span>Chỉnh sửa nhân vật</span>
          </button>
        )}
      </div>

      {/* Main Character Showcase Container */}
      <div
        className={`${radiusClass} ${frameInfo.containerClass}`}
        style={{
          borderColor: theme?.borderColor || 'rgba(168, 85, 247, 0.4)',
          background: getCustomBackground(),
          boxShadow: glowShadow
        }}
      >
        {/* Large Cover Hero */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden bg-zinc-950">
          {character.cover ? (
            <img
              src={character.cover}
              alt={character.name}
              className={`w-full h-full object-cover object-center transition-all duration-300 ${imageFilterClass}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="100%" height="100%" fill="%23111320"/><text x="50%" y="50%" fill="%236b7280" font-family="sans-serif" font-size="18" text-anchor="middle">Ảnh bìa</text></svg>';
              }}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center opacity-70"
              style={{
                background: `linear-gradient(135deg, ${theme?.primaryColor || '#6366f1'}50 0%, ${theme?.secondaryColor || '#ec4899'}50 100%)`
              }}
            >
              <span className="text-sm uppercase tracking-widest text-white/60 font-poetic">Một Góc Trời</span>
            </div>
          )}

          {/* Deep gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-black/40 to-transparent" />

          {/* Floating Large Avatar */}
          <div className="absolute -bottom-10 sm:-bottom-12 left-6 sm:left-10 z-10">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 bg-zinc-900 shadow-2xl relative"
              style={{
                borderColor: theme?.primaryColor || '#a855f7',
                boxShadow: `0 0 25px ${theme?.glowColor || '#a855f7'}70`
              }}
            >
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className={`w-full h-full object-cover transition-all duration-300 ${imageFilterClass}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%23222538"/><text x="50%" y="55%" fill="%23a855f7" font-family="sans-serif" font-size="36" font-weight="bold" text-anchor="middle">' + encodeURIComponent(character.name.charAt(0)) + '</text></svg>';
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center font-poetic font-bold text-3xl sm:text-4xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme?.primaryColor || '#a855f7'}, ${theme?.secondaryColor || '#ec4899'})`
                  }}
                >
                  {character.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header Metadata Section */}
        <div className="pt-14 sm:pt-16 px-6 sm:px-10 pb-8 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="text-xs uppercase tracking-widest font-mono-code font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{
                    borderColor: `${theme?.primaryColor || '#a855f7'}60`,
                    color: theme?.primaryColor || '#c084fc',
                    backgroundColor: `${theme?.primaryColor || '#a855f7'}15`
                  }}
                >
                  Nhân vật độc quyền
                </span>
                {isOwner && !character.published && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    Bản nháp
                  </span>
                )}
              </div>

              <h2
                className="text-3xl sm:text-4xl font-extrabold font-cinzel tracking-wider leading-tight"
                style={{ color: theme?.textColor || '#ffffff' }}
              >
                {character.name}
              </h2>

              {character.tagline && (
                <p className="mt-2 text-base sm:text-lg text-zinc-300 italic font-light max-w-2xl leading-relaxed">
                  “{character.tagline}”
                </p>
              )}

              {/* Tags Badges */}
              {character.tags && character.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {character.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide uppercase border backdrop-blur-md"
                      style={{
                        borderColor: `${theme?.primaryColor || '#a855f7'}50`,
                        backgroundColor: `${theme?.primaryColor || '#a855f7'}18`,
                        color: theme?.primaryColor || '#c084fc'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Chat Button in Header */}
            {character.chatLink && character.chatLink.trim() !== '' && (
              <a
                href={character.chatLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-[0.98] shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${theme?.primaryColor || '#a855f7'}, ${theme?.secondaryColor || '#ec4899'})`,
                  boxShadow: `0 8px 25px ${(theme?.glowColor || '#a855f7')}50`
                }}
              >
                <MessageSquare className="w-5 h-5" />
                <span>CHAT VỚI NHÂN VẬT</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content Body: CỐT TRUYỆN, HỒ SƠ CHAR, HỒ SƠ NHÂN VẬT */}
        <div className="p-6 sm:p-10 space-y-10">
          {/* Section 1: CỐT TRUYỆN */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider font-cinzel" style={{ color: theme?.primaryColor || '#c084fc' }}>
              <BookOpen className="w-4 h-4" />
              <span>Cốt Truyện</span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/30 to-transparent ml-2" />
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-black/30 border border-white/5 text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
              {character.story ? (
                character.story
              ) : (
                <span className="text-zinc-500 italic">Chưa có thông tin cốt truyện.</span>
              )}
            </div>
          </section>

          {/* Section 2: HỒ SƠ CHAR & HỒ SƠ NHÂN VẬT (Side by side on desktop, stacked on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HỒ SƠ CHAR */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider font-cinzel" style={{ color: theme?.secondaryColor || '#f472b6' }}>
                <User className="w-4 h-4" />
                <span>Hồ Sơ Char</span>
              </div>

              <div className="p-5 rounded-2xl bg-black/30 border border-white/5 text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light min-h-[140px]">
                {character.charProfile ? (
                  character.charProfile
                ) : (
                  <span className="text-zinc-500 italic">Chưa có hồ sơ nhân vật.</span>
                )}
              </div>
            </section>

            {/* HỒ SƠ NHÂN VẬT */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider font-cinzel" style={{ color: theme?.glowColor || '#38bdf8' }}>
                <UserCheck className="w-4 h-4" />
                <span>Hồ Sơ Nhân Vật Đối Ứng</span>
              </div>

              <div className="p-5 rounded-2xl bg-black/30 border border-white/5 text-zinc-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light min-h-[140px]">
                {character.userProfile ? (
                  character.userProfile
                ) : (
                  <span className="text-zinc-500 italic">Chưa có thiết lập hồ sơ đối ứng.</span>
                )}
              </div>
            </section>
          </div>

          {/* Section 3: TÙY CHỌN HIỂN THỊ HỘI THOẠI ĐA DẠNG */}
          <section className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider font-cinzel" style={{ color: theme?.primaryColor || '#c084fc' }}>
                <Sparkles className="w-4 h-4" />
                <span>Hiển Thị Hội Thoại Đa Dạng</span>
              </div>

              {/* Interactive style switcher */}
              <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDialogueStyle('visual_novel')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedDialogueStyle === 'visual_novel'
                      ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Visual Novel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDialogueStyle('bubble')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedDialogueStyle === 'bubble'
                      ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Bong Bóng Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDialogueStyle('novel')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedDialogueStyle === 'novel'
                      ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tiểu Thuyết</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDialogueStyle('split')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    selectedDialogueStyle === 'split'
                      ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Đối Thoại Hai Phía</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Visual Novel Style */}
            {selectedDialogueStyle === 'visual_novel' && (
              <div 
                className="relative rounded-2xl border bg-black/60 backdrop-blur-xl p-5 sm:p-6 overflow-hidden shadow-2xl"
                style={{ borderColor: `${theme?.primaryColor || '#a855f7'}40` }}
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Character Avatar Sprite in VN Box */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 bg-zinc-900" style={{ borderColor: theme?.primaryColor || '#a855f7' }}>
                    {character.avatar ? (
                      <img src={character.avatar} alt={character.name} className={`w-full h-full object-cover ${imageFilterClass}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white font-cinzel">
                        {character.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* VN Dialogue Box */}
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-base sm:text-lg font-bold font-cinzel tracking-wider px-3 py-0.5 rounded-lg bg-black/60 border inline-block"
                        style={{ color: theme?.primaryColor || '#c084fc', borderColor: `${theme?.primaryColor || '#a855f7'}50` }}
                      >
                        {character.name}
                      </span>
                      <span className="text-[11px] font-mono-code text-zinc-500 uppercase tracking-widest">
                        Visual Novel Mode
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {dialogues.map((d, idx) => (
                        <div key={idx} className="text-sm sm:text-base leading-relaxed text-zinc-200">
                          <span className="font-semibold text-xs uppercase tracking-wider mr-2" style={{ color: d.speaker === 'char' ? theme?.primaryColor || '#a855f7' : '#38bdf8' }}>
                            {d.speaker === 'char' ? character.name : 'Bạn'}:
                          </span>
                          <span className="font-light italic">“{d.text}”</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Chat Bubbles Style */}
            {selectedDialogueStyle === 'bubble' && (
              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-5 space-y-4">
                {dialogues.map((d, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-end gap-2.5 ${d.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {d.speaker === 'char' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-purple-500/40 bg-zinc-800">
                        {character.avatar ? (
                          <img src={character.avatar} alt={character.name} className={`w-full h-full object-cover ${imageFilterClass}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                            {character.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}
                    <div 
                      className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        d.speaker === 'char'
                          ? 'bg-purple-950/60 text-purple-100 border border-purple-500/30 rounded-bl-none shadow-md'
                          : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/40 rounded-br-none shadow-md'
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-zinc-400 mb-1">
                        {d.speaker === 'char' ? character.name : 'Bạn'}
                      </div>
                      <p>{d.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mode 3: Novel Style */}
            {selectedDialogueStyle === 'novel' && (
              <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 sm:p-8 space-y-4 font-serif text-zinc-300 text-base sm:text-lg leading-relaxed">
                {dialogues.map((d, idx) => (
                  <p key={idx} className="indent-6 sm:indent-8 first:mt-0">
                    {d.speaker === 'char' ? (
                      <span>
                        <span className="font-sans text-xs uppercase tracking-wider text-purple-400 font-bold mr-2">[{character.name}]</span>
                        <span className="italic">“{d.text}”</span>
                      </span>
                    ) : (
                      <span>
                        <span className="font-sans text-xs uppercase tracking-wider text-cyan-400 font-bold mr-2">[Bạn]</span>
                        <span className="italic">“{d.text}”</span>
                      </span>
                    )}
                  </p>
                ))}
              </div>
            )}

            {/* Mode 4: Split Perspective Style */}
            {selectedDialogueStyle === 'split' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                    <User className="w-3.5 h-3.5" />
                    <span>Góc nhìn: {character.name}</span>
                  </div>
                  {dialogues.filter(d => d.speaker === 'char').map((d, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-xs sm:text-sm text-zinc-200">
                      “{d.text}”
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Góc nhìn: Bạn (Đối ứng)</span>
                  </div>
                  {dialogues.filter(d => d.speaker === 'user').map((d, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 text-xs sm:text-sm text-zinc-200">
                      “{d.text}”
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Bottom Chat CTA if link exists */}
          {character.chatLink && character.chatLink.trim() !== '' && (
            <div className="pt-6 border-t border-white/10 flex justify-center">
              <a
                href={character.chatLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold font-cinzel tracking-wider text-base sm:text-lg text-white shadow-2xl transition-all hover:scale-105 active:scale-[0.98] flex items-center justify-center gap-3"
                style={{
                  background: `linear-gradient(135deg, ${theme?.primaryColor || '#a855f7'}, ${theme?.secondaryColor || '#ec4899'})`,
                  boxShadow: `0 10px 35px ${(theme?.glowColor || '#a855f7')}60`
                }}
              >
                <MessageSquare className="w-5 h-5" />
                <span>[ CHAT VỚI NHÂN VẬT ]</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
