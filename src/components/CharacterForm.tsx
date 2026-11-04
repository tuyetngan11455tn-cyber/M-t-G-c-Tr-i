import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Save, 
  Send, 
  X, 
  Palette, 
  Layers, 
  Sliders, 
  Eye, 
  Link as LinkIcon, 
  Plus, 
  Trash2,
  Check,
  Wand2,
  RefreshCw,
  Sparkle,
  Tag
} from 'lucide-react';
import { Character, CharTheme, FrameStyle, DialogueStyle, BackgroundStyle, GlowIntensity, BorderRadiusSize, DialogueSample, ImageFilter } from '../types';
import { THEME_PRESETS, IMAGE_FILTERS, getImageFilterClass } from '../utils/themeHelper';
import { uploadImageFile, generateAIImage } from '../services/api';
import { CharacterCard } from './CharacterCard';

interface CharacterFormProps {
  initialData?: Character | null;
  onSave: (data: Partial<Character>, publish: boolean, targetId?: string | null) => Promise<Character | void>;
  onCancel: () => void;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const isEditing = Boolean(initialData);
  const [currentId, setCurrentId] = useState<string | null>(initialData?.id || null);

  // Form Fields
  const [name, setName] = useState(initialData?.name || '');
  const [avatar, setAvatar] = useState(initialData?.avatar || '');
  const [cover, setCover] = useState(initialData?.cover || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [story, setStory] = useState(initialData?.story || '');
  const [charProfile, setCharProfile] = useState(initialData?.charProfile || '');
  const [userProfile, setUserProfile] = useState(initialData?.userProfile || '');
  const [chatLink, setChatLink] = useState(initialData?.chatLink || '');

  // Theme Fields
  const defaultTheme: CharTheme = {
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    textColor: '#ffffff',
    glowColor: '#c084fc',
    borderColor: 'rgba(168, 85, 247, 0.45)',
    frameStyle: 'glass',
    borderRadius: '2xl',
    backgroundOpacity: 0.85,
    backgroundStyle: 'gradient',
    glowIntensity: 'medium',
    dialogueDisplay: 'visual_novel',
    imageFilter: 'none'
  };

  const [theme, setTheme] = useState<CharTheme>({
    ...defaultTheme,
    ...(initialData?.theme || {})
  });

  // Sample Dialogues
  const [dialogues, setDialogues] = useState<DialogueSample[]>(
    initialData?.sampleDialogues && initialData.sampleDialogues.length > 0
      ? initialData.sampleDialogues
      : [
          { speaker: 'char', text: 'Chào mừng bạn đã đến. Ta đã chờ đợi khoảnh khắc này.' },
          { speaker: 'user', text: 'Hãy cho tôi biết lý do bạn lại ở nơi này.' }
        ]
  );

  // Uploading state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar upload
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      setAvatar(url);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Lỗi khi tải ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle cover upload
  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setError(null);
    try {
      const url = await uploadImageFile(file);
      setCover(url);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Lỗi khi tải ảnh bìa');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // AI Image Generation state
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('Anime Kỳ Ảo (Fantasy)');
  const [aiTarget, setAiTarget] = useState<'avatar' | 'cover'>('avatar');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedUrl, setAiGeneratedUrl] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Auto-generate a creative prompt based on Character Name and Tagline
  const handleAutoSuggestPrompt = () => {
    const charName = name.trim() || 'Nhân vật';
    const tag = tagline.trim();
    let suggested = `Chân dung nghệ thuật của ${charName}`;
    if (tag) {
      suggested += `, mang phong thái "${tag}"`;
    }
    suggested += `, phong cách ${aiStyle}, ánh mắt sắc sảo, trang phục tinh tế, ánh sáng điện ảnh kỳ ảo, chi tiết cực cao`;
    setAiPrompt(suggested);
  };

  // Trigger AI Image Generation
  const handleGenerateAI = async () => {
    let finalPrompt = aiPrompt.trim();
    if (!finalPrompt) {
      const charName = name.trim() || 'Nhân vật huyền bí';
      const tag = tagline.trim();
      finalPrompt = `Chân dung nghệ thuật của ${charName}${tag ? `, ${tag}` : ''}, phong cách ${aiStyle}, ánh sáng điện ảnh, độ phân giải 8k`;
      setAiPrompt(finalPrompt);
    }

    setIsGeneratingAI(true);
    setAiNotice(null);
    setError(null);
    try {
      const ratio = aiTarget === 'avatar' ? '1:1' : '16:9';
      const result = await generateAIImage(finalPrompt, ratio, aiStyle);
      setAiGeneratedUrl(result.url);
      setAiNotice(result.message);

      // Auto apply to chosen target
      if (aiTarget === 'avatar') {
        setAvatar(result.url);
      } else {
        setCover(result.url);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Lỗi khi tạo ảnh bằng AI');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyPreset = (presetTheme: Partial<CharTheme>) => {
    setTheme(prev => ({
      ...prev,
      ...presetTheme
    }));
  };

  // Tag System Handlers
  const handleAddTag = (tagToAdd?: string) => {
    const t = (tagToAdd || newTagInput).trim();
    if (!t) return;
    if (!tags.includes(t)) {
      setTags([...tags, t]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addDialogueLine = () => {
    setDialogues(prev => [...prev, { speaker: 'char', text: '' }]);
  };

  const updateDialogueLine = (index: number, field: 'speaker' | 'text', val: string) => {
    setDialogues(prev => {
      const next = [...prev];
      if (field === 'speaker') {
        next[index].speaker = val as 'char' | 'user';
      } else {
        next[index].text = val;
      }
      return next;
    });
  };

  const removeDialogueLine = (index: number) => {
    setDialogues(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (publish: boolean) => {
    setError(null);
    let finalName = name.trim();
    if (publish && !finalName) {
      setError('Vui lòng nhập tên nhân vật trước khi xuất bản ra kho công khai.');
      return;
    }
    if (!publish && !finalName) {
      finalName = 'Bản nháp chưa đặt tên';
      setName(finalName);
    }

    setIsSaving(true);
    try {
      const saved = await onSave(
        {
          name: finalName,
          avatar,
          cover,
          tagline: tagline.trim(),
          tags,
          story: story.trim(),
          charProfile: charProfile.trim(),
          profile: charProfile.trim(),
          userProfile: userProfile.trim(),
          chatLink: chatLink.trim(),
          chatUrl: chatLink.trim(),
          theme,
          sampleDialogues: dialogues.filter(d => d.text.trim() !== ''),
          published: publish,
          status: publish ? 'published' : 'draft',
          isDraft: !publish
        },
        publish,
        currentId
      );
      if (saved && typeof saved === 'object' && saved.id) {
        setCurrentId(saved.id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Đã có lỗi xảy ra khi lưu nhân vật.');
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview character object
  const previewCharacter: Character = {
    id: initialData?.id || 'preview_id',
    name: name.trim() || 'Tên Nhân Vật',
    avatar,
    cover,
    tagline: tagline.trim() || 'Một câu nói mang tính thương hiệu của nhân vật...',
    tags,
    story: story.trim(),
    charProfile: charProfile.trim(),
    profile: charProfile.trim(),
    userProfile: userProfile.trim(),
    chatLink: chatLink.trim(),
    chatUrl: chatLink.trim(),
    theme,
    sampleDialogues: dialogues,
    published: initialData?.published ?? false,
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-fuchsia-400" />
            {isEditing ? `Chỉnh Sửa Nhân Vật: ${initialData?.name}` : 'Tạo Nhân Vật Mới'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Chủ kho toàn quyền quyết định nội dung, hình ảnh và phong cách giao diện riêng biệt.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Thông tin cơ bản & Ảnh */}
          <div className="p-6 rounded-2xl bg-[#0b0e1a]/90 border border-purple-500/20 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-cinzel flex items-center gap-2 text-purple-300">
              <ImageIcon className="w-4 h-4" />
              1. Thông Tin Nhận Diện & Hình Ảnh
            </h3>

            {/* Tên nhân vật */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Tên nhân vật <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên nhân vật (ví dụ: Lumina, Dạ Nguyệt, Alex...)"
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600 font-cinzel"
                required
              />
            </div>

            {/* AI Image Generator Panel (Imagen / Gemini Flash) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-fuchsia-950/40 via-purple-950/30 to-slate-900/60 border border-fuchsia-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
                    <Wand2 className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-cinzel flex items-center gap-1.5">
                      Tạo Ảnh Minh Họa Bằng AI (Imagen)
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 lowercase font-normal">
                        chủ kho
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Tạo nhanh ảnh đại diện hoặc ảnh bìa độc quyền cho nhân vật mà không cần tìm file ngoài.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAIGenerator(!showAIGenerator)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                >
                  {showAIGenerator ? 'Thu gọn' : 'Mở công cụ AI'}
                </button>
              </div>

              {showAIGenerator && (
                <div className="space-y-3 pt-2 border-t border-white/10 animate-in fade-in duration-200">
                  {/* Select target & Style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Target selector */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                        Mục Tiêu Áp Dụng
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAiTarget('avatar')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            aiTarget === 'avatar'
                              ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-200'
                              : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          Ảnh Đại Diện (1:1)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiTarget('cover')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                            aiTarget === 'cover'
                              ? 'bg-fuchsia-600/30 border-fuchsia-400 text-fuchsia-200'
                              : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          Ảnh Bìa (16:9)
                        </button>
                      </div>
                    </div>

                    {/* Style selector */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                        Phong Cách Nghệ Thuật
                      </label>
                      <select
                        value={aiStyle}
                        onChange={(e) => setAiStyle(e.target.value)}
                        className="w-full bg-[#131728] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-fuchsia-400"
                      >
                        <option value="Anime Kỳ Ảo (Fantasy)">Anime Kỳ Ảo (Fantasy)</option>
                        <option value="Cyberpunk Neon Viễn Tưởng">Cyberpunk Neon Viễn Tưởng</option>
                        <option value="Dark Gothic Huyền Bí">Dark Gothic U Tối & Ma Mị</option>
                        <option value="Digital Painting Webtoon">Digital Painting / Webtoon</option>
                        <option value="Vũ Trụ Huyền Ảo (Celestial)">Vũ Trụ Huyền Ảo (Celestial)</option>
                        <option value="Cổ Trang Huyền Huyễn">Cổ Trang Huyền Huyễn</option>
                      </select>
                    </div>
                  </div>

                  {/* Prompt input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold uppercase text-zinc-300">
                        Mô Tả Nhân Vật (Prompt)
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoSuggestPrompt}
                        className="text-[11px] text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Sparkle className="w-3 h-3 text-fuchsia-400" />
                        Gợi ý prompt từ Tên & Tagline
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ví dụ: Chân dung chiến binh tóc bạc, ánh mắt vàng phát sáng, áo choàng bóng tối..."
                      className="w-full bg-[#131728] border border-white/10 focus:border-fuchsia-400 text-white rounded-lg p-2.5 text-xs focus:outline-none placeholder:text-zinc-600 resize-none"
                    />
                  </div>

                  {/* Actions & Feedback */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={handleGenerateAI}
                      className="py-2 px-4 rounded-xl font-semibold font-cinzel text-xs text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-md shadow-fuchsia-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tạo ảnh AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Tạo Ảnh Ngay</span>
                        </>
                      )}
                    </button>

                    {aiGeneratedUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Đã tạo & áp dụng vào {aiTarget === 'avatar' ? 'Ảnh đại diện' : 'Ảnh bìa'}!
                        </span>
                        <button
                          type="button"
                          onClick={() => setAvatar(aiGeneratedUrl)}
                          className="px-2 py-1 rounded bg-purple-500/20 text-purple-200 text-[10px] hover:bg-purple-500/30"
                        >
                          Dùng làm Avatar
                        </button>
                        <button
                          type="button"
                          onClick={() => setCover(aiGeneratedUrl)}
                          className="px-2 py-1 rounded bg-purple-500/20 text-purple-200 text-[10px] hover:bg-purple-500/30"
                        >
                          Dùng làm Bìa
                        </button>
                      </div>
                    )}
                  </div>

                  {aiNotice && (
                    <div className="p-2.5 rounded-lg bg-black/40 border border-fuchsia-500/20 text-[11px] text-zinc-300 leading-relaxed">
                      {aiNotice}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ảnh đại diện & Ảnh bìa upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ảnh đại diện */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Ảnh Đại Diện
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-purple-500/40 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className={`w-full h-full object-cover transition-all duration-300 ${getImageFilterClass(theme.imageFilter)}`}
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => avatarInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh lên'}
                    </button>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Hoặc dán URL ảnh..."
                      className="w-full bg-[#131728] border border-white/10 text-zinc-300 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Ảnh bìa */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                  Ảnh Bìa
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-xl border border-purple-500/40 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                    {cover ? (
                      <img
                        src={cover}
                        alt="Cover"
                        className={`w-full h-full object-cover transition-all duration-300 ${getImageFilterClass(theme.imageFilter)}`}
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingCover}
                      onClick={() => coverInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingCover ? 'Đang tải lên...' : 'Tải ảnh bìa'}
                    </button>
                    <input
                      type="text"
                      value={cover}
                      onChange={(e) => setCover(e.target.value)}
                      placeholder="Hoặc dán URL ảnh bìa..."
                      className="w-full bg-[#131728] border border-white/10 text-zinc-300 rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bộ Lọc Hình Ảnh (Image Filter Option) */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Bộ Lọc Hình Ảnh (Áp dụng cho Ảnh đại diện & Ảnh bìa)
                </label>
                <span className="text-[11px] text-purple-300 font-mono-code">
                  {IMAGE_FILTERS.find(f => f.id === (theme.imageFilter || 'none'))?.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {IMAGE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTheme(prev => ({ ...prev, imageFilter: f.id }))}
                    className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      (theme.imageFilter || 'none') === f.id
                        ? 'border-purple-400 bg-purple-950/50 text-purple-200 shadow-md shadow-purple-950/60'
                        : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="font-semibold">{f.label}</span>
                    <span className="text-[10px] text-zinc-500 font-normal truncate mt-0.5">{f.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Tagline (Một ô nhập duy nhất)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Câu nói ấn tượng, câu khẩu hiệu ngắn của nhân vật..."
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600 italic"
              />
            </div>

            {/* Tag System (Labels / Thẻ thể loại) */}
            <div className="pt-2 border-t border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hệ Thống Thẻ & Nhãn (Tags)</span>
                </label>
                <span className="text-[11px] text-zinc-500">
                  {tags.length} nhãn đã chọn
                </span>
              </div>

              {/* Tag Input Field & Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Nhập nhãn mới (ví dụ: Protagonist, Dark, Sci-Fi, Fantasy...)"
                    className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/20 placeholder:text-zinc-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddTag()}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm thẻ</span>
                </button>
              </div>

              {/* Selected tags chip bar */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-black/30 border border-white/5 min-h-[38px] items-center">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/70 text-purple-200 border border-purple-500/40 shadow-sm"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-purple-400 hover:text-red-400 transition-colors"
                        title="Xóa nhãn"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick suggestions */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">
                  Gợi ý nhãn nhanh:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Protagonist', 'Dark', 'Sci-Fi', 'Fantasy', 'Cyberpunk', 'Villain', 'Anti-Hero', 'Mystery', 'Romance', 'Action'].map((sug) => {
                    const isAdded = tags.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleAddTag(sug)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-purple-900/30 border-purple-500/20 text-purple-400/50 cursor-default'
                            : 'bg-white/[0.03] hover:bg-white/10 border-white/10 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        +{sug}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Cốt truyện & Hồ sơ */}
          <div className="p-6 rounded-2xl bg-[#0b0e1a]/90 border border-purple-500/20 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-cinzel flex items-center gap-2 text-fuchsia-300">
              <Layers className="w-4 h-4" />
              2. Nội Dung Cốt Truyện & Hồ Sơ
            </h3>

            {/* Cốt truyện */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Cốt Truyện (Khu vực nhập nội dung dài)
              </label>
              <textarea
                rows={5}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Viết câu chuyện về nguồn gốc, xuất thân, biến cố, hành trình của nhân vật..."
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600 leading-relaxed font-light"
              />
            </div>

            {/* Hồ sơ Char */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Hồ Sơ Char (Thông tin của nhân vật do chủ kho tự viết)
              </label>
              <textarea
                rows={4}
                value={charProfile}
                onChange={(e) => setCharProfile(e.target.value)}
                placeholder="Tính cách, ngoại hình, sở thích, điểm yếu, sức mạnh, thông tin bổ sung..."
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600 leading-relaxed font-light"
              />
            </div>

            {/* Hồ sơ Nhân vật (Đối ứng / User) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Hồ Sơ Nhân Vật Đối Ứng (Thông tin về nhân vật/user mà chủ kho muốn thiết lập)
              </label>
              <textarea
                rows={4}
                value={userProfile}
                onChange={(e) => setUserProfile(e.target.value)}
                placeholder="Mối quan hệ giữa nhân vật đối ứng với Char, góc nhìn, bối cảnh nhập vai..."
                className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600 leading-relaxed font-light"
              />
            </div>

            {/* Link Chat */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center justify-between">
                <span>Link Chat (Tùy chọn)</span>
                <span className="text-[11px] text-zinc-500 lowercase font-normal">Nếu để trống, nút Chat sẽ tự động ẩn</span>
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  value={chatLink}
                  onChange={(e) => setChatLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#131728] border border-white/10 focus:border-purple-400 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Box 3: Thiết Kế Giao Diện Riêng Cho Nhân Vật (Requirement 9 & 10) */}
          <div className="p-6 rounded-2xl bg-[#0b0e1a]/90 border border-cyan-500/20 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-cinzel flex items-center gap-2 text-cyan-300">
                <Palette className="w-4 h-4" />
                3. Thiết Kế Giao Diện Riêng Cho Nhân Vật
              </h3>
              <span className="text-xs text-cyan-400/80 font-mono-code">Custom Theme</span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                Mẫu Phối Màu Nhanh
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEME_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p.theme)}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-cyan-400/60 bg-white/[0.02] hover:bg-white/5 transition-all text-left text-xs"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: p.theme.primaryColor }} />
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: p.theme.secondaryColor }} />
                    </div>
                    <span className="text-zinc-200 font-medium block truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Style (Kiểu Khung) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Kiểu Khung (Frame Style)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(
                  [
                    { id: 'soft', label: 'Khung mềm' },
                    { id: 'glass', label: 'Khung glass' },
                    { id: 'neon', label: 'Khung neon' },
                    { id: 'dark', label: 'Khung tối' },
                    { id: 'glowing', label: 'Phát sáng' },
                    { id: 'minimal', label: 'Tối giản' }
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTheme(prev => ({ ...prev, frameStyle: f.id as FrameStyle }))}
                    className={`p-2 rounded-xl text-xs font-medium border transition-all text-center ${
                      theme.frameStyle === f.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-950'
                        : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors picker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Màu Chủ Đạo
                </label>
                <div className="flex items-center gap-2 bg-[#131728] border border-white/10 rounded-xl p-1.5">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono-code text-zinc-300">{theme.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Màu Phụ
                </label>
                <div className="flex items-center gap-2 bg-[#131728] border border-white/10 rounded-xl p-1.5">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono-code text-zinc-300">{theme.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Màu Glow
                </label>
                <div className="flex items-center gap-2 bg-[#131728] border border-white/10 rounded-xl p-1.5">
                  <input
                    type="color"
                    value={theme.glowColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, glowColor: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono-code text-zinc-300">{theme.glowColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
                  Màu Chữ
                </label>
                <div className="flex items-center gap-2 bg-[#131728] border border-white/10 rounded-xl p-1.5">
                  <input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono-code text-zinc-300">{theme.textColor}</span>
                </div>
              </div>
            </div>

            {/* Kiểu Nền, Cường Độ Glow & Bo Góc */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Kiểu Nền
                </label>
                <select
                  value={theme.backgroundStyle}
                  onChange={(e) => setTheme(prev => ({ ...prev, backgroundStyle: e.target.value as BackgroundStyle }))}
                  className="w-full bg-[#131728] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="gradient">Gradient Chuyển Màu</option>
                  <option value="cyber">Cyberpunk Matrix</option>
                  <option value="aurora">Cực Quang (Aurora)</option>
                  <option value="deep_space">Vũ Trụ Sâu (Deep Space)</option>
                  <option value="crimson_void">Hư Không Đỏ (Crimson Void)</option>
                  <option value="emerald_mist">Sương Mù Ngọc Bích</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Cường Độ Glow
                </label>
                <select
                  value={theme.glowIntensity}
                  onChange={(e) => setTheme(prev => ({ ...prev, glowIntensity: e.target.value as GlowIntensity }))}
                  className="w-full bg-[#131728] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="none">Không Glow</option>
                  <option value="low">Glow Nhẹ</option>
                  <option value="medium">Glow Vừa Phải</option>
                  <option value="high">Glow Mạnh</option>
                  <option value="ultra">Glow Cực Đại</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Độ Bo Góc
                </label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme(prev => ({ ...prev, borderRadius: e.target.value as BorderRadiusSize }))}
                  className="w-full bg-[#131728] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="sm">Bo nhẹ (sm)</option>
                  <option value="md">Bo vừa (md)</option>
                  <option value="lg">Bo lớn (lg)</option>
                  <option value="xl">Bo rất lớn (xl)</option>
                  <option value="2xl">Bo tròn mềm (2xl)</option>
                  <option value="3xl">Bo tròn tối đa (3xl)</option>
                </select>
              </div>
            </div>

            {/* Hiển Thị Hội Thoại Mặc Định */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Kiểu Hiển Thị Hội Thoại Mặc Định
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'visual_novel', label: 'Visual Novel' },
                    { id: 'bubble', label: 'Bong bóng chat' },
                    { id: 'novel', label: 'Tiểu thuyết' },
                    { id: 'split', label: 'Đối thoại 2 phía' }
                  ] as const
                ).map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTheme(prev => ({ ...prev, dialogueDisplay: m.id as DialogueStyle }))}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                      theme.dialogueDisplay === m.id
                        ? 'border-purple-400 bg-purple-950/50 text-purple-200'
                        : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dialogue lines input for demonstration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Câu Thoại Mẫu Minh Họa (Tùy chọn)
                </label>
                <button
                  type="button"
                  onClick={addDialogueLine}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm câu thoại</span>
                </button>
              </div>

              <div className="space-y-2">
                {dialogues.map((d, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={d.speaker}
                      onChange={(e) => updateDialogueLine(index, 'speaker', e.target.value)}
                      className="bg-[#131728] border border-white/10 text-zinc-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="char">Char</option>
                      <option value="user">Bạn / User</option>
                    </select>
                    <input
                      type="text"
                      value={d.text}
                      onChange={(e) => updateDialogueLine(index, 'text', e.target.value)}
                      placeholder="Nội dung câu thoại..."
                      className="flex-1 bg-[#131728] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeDialogueLine(index)}
                      className="p-1.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="p-4 rounded-2xl bg-[#0b0e1a]/80 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Eye className="w-3.5 h-3.5" />
                  Xem Trước Trực Tiếp (Live Card Preview)
                </span>
                <span className="font-mono-code text-[11px] text-zinc-500">Real-time</span>
              </div>

              {/* Render actual card with real-time reactive theme */}
              <div className="max-w-sm mx-auto">
                <CharacterCard
                  character={previewCharacter}
                  isOwner={true}
                  onSelect={() => {}}
                />
              </div>

              <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-400 leading-relaxed text-center">
                Màu sắc, viền, hiệu ứng phát sáng và khung giao diện sẽ hiển thị y hệt như trên cho bất kỳ ai truy cập website.
              </div>
            </div>

            {/* Bottom Form Actions: [LƯU BẢN NHÁP] [XUẤT BẢN NGAY] (Requirement 15) */}
            <div className="p-5 rounded-2xl bg-[#0e1122] border border-pink-500/30 shadow-2xl space-y-3">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSubmit(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold font-poetic text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>[ XUẤT BẢN RA KHO CÔNG KHAI ]</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSubmit(false)}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isSaving ? (
                  <span className="inline-block w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-amber-300" />
                )}
                <span>[ LƯU BẢN NHÁP RIÊNG TƯ ]</span>
              </button>

              <div className="text-[11px] text-zinc-400 text-center font-garamond italic">
                Bản nháp được lưu riêng tư cho Admin, khách truy cập không thể nhìn thấy.
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={onCancel}
                className="w-full py-2 px-4 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Hủy thay đổi & Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
