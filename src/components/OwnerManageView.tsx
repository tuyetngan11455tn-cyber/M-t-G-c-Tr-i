import React, { useState } from 'react';
import { 
  PlusCircle, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search, 
  MessageSquare,
  Shield,
  Layers,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Clock,
  Key,
  Users,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Palette,
  CloudSun,
  Flame,
  Snowflake,
  Moon,
  Feather,
  FileText,
  Send,
  BookOpen
} from 'lucide-react';
import { Character, AdminAccountInfo, SiteConfig } from '../types';
import { THEME_PRESETS_INFO, FALLBACK_AVATAR_SVG, FALLBACK_COVER_SVG } from '../services/siteConfig';

interface OwnerManageViewProps {
  characters: Character[];
  onCreateNew: () => void;
  onEdit: (character: Character) => void;
  onSelect: (character: Character) => void;
  onTogglePublish: (character: Character) => void;
  onRequestDelete: (character: Character) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  adminAccount?: AdminAccountInfo | null;
  adminEmail?: string;
  siteConfig?: SiteConfig;
  onOpenAppearanceModal?: () => void;
}

export const OwnerManageView: React.FC<OwnerManageViewProps> = ({
  characters,
  onCreateNew,
  onEdit,
  onSelect,
  onTogglePublish,
  onRequestDelete,
  searchQuery,
  onSearchChange,
  adminAccount,
  adminEmail,
  siteConfig,
  onOpenAppearanceModal
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'drafts' | 'appearance' | 'account'>('characters');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const publishedCharacters = characters.filter(c => c.published && !c.isDraft && c.status !== 'draft');
  const draftCharacters = characters.filter(c => !c.published || c.isDraft || c.status === 'draft');

  const publishedCount = publishedCharacters.length;
  const draftCount = draftCharacters.length;

  const filtered = characters.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q)));

    if (!matchesSearch) return false;
    if (filterStatus === 'published') return c.published && !c.isDraft && c.status !== 'draft';
    if (filterStatus === 'draft') return !c.published || c.isDraft || c.status === 'draft';
    return true;
  });

  const filteredDrafts = draftCharacters.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) ||
      c.tagline.toLowerCase().includes(q) ||
      (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q)));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-pink-300 mb-1.5 font-poetic">
            <Feather className="w-4 h-4 text-pink-300" />
            <span>Khu Vực Quản Trị · Một Góc Trời</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-poetic text-white">
            {activeTab === 'characters' 
              ? 'Quản Lý Kho Nhân Vật' 
              : activeTab === 'drafts'
                ? 'Khu Vực Bản Nháp & Soạn Thảo'
                : activeTab === 'appearance' 
                  ? 'Cài Đặt Diện Mạo Website'
                  : 'Thông Tin Tài Khoản Quản Trị'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-garamond italic mt-1 max-w-2xl leading-relaxed">
            {activeTab === 'characters' 
              ? 'Thêm, sửa, đổi giao diện, xuất bản hoặc xóa nhân vật trong kho lưu trữ trực tuyến.'
              : activeTab === 'drafts'
                ? 'Tập hợp các bản nháp đang sáng tác, lưu trữ bền vững và ẩn hoàn toàn với khách truy cập.'
                : activeTab === 'appearance'
                  ? 'Tùy biến Avatar, Ảnh bìa cover và 4 Chủ đề toàn trang của không gian Một Góc Trời.'
                  : 'Kiểm soát tài khoản Admin duy nhất, theo dõi trạng thái bảo mật và phiên làm việc bền vững.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenAppearanceModal && (
            <button
              onClick={onOpenAppearanceModal}
              className="px-4 py-2.5 rounded-2xl font-poetic text-xs sm:text-sm text-pink-200 bg-pink-950/40 hover:bg-pink-900/60 border border-pink-400/30 shadow-lg shadow-pink-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              title="Đổi Avatar, Cover và Theme"
            >
              <Palette className="w-4 h-4 text-pink-300" />
              <span>Chỉnh Diện Mạo</span>
            </button>
          )}

          {(activeTab === 'characters' || activeTab === 'drafts') && (
            <button
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-2xl font-poetic font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 hover:from-pink-400 hover:to-sky-400 shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Nhân Vật Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher: Kho Nhân Vật vs Bản Nháp vs Diện Mạo Website vs Quản Lý Tài Khoản */}
      <div className="flex items-center gap-2 sm:gap-3 my-6 pb-2 border-b border-white/[0.08] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('characters')}
          className={`px-4 py-2.5 rounded-2xl font-poetic text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'characters'
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-400/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4 text-pink-400" />
          <span>Kho Nhân Vật ({characters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drafts')}
          className={`px-4 py-2.5 rounded-2xl font-poetic text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'drafts'
              ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-200 border border-amber-400/50 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Bản Nháp ({draftCount})</span>
          {draftCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2.5 rounded-2xl font-poetic text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-400/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Diện Mạo Website</span>
          {siteConfig?.theme && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 uppercase font-mono font-bold">
              {THEME_PRESETS_INFO[siteConfig.theme]?.name || siteConfig.theme}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2.5 rounded-2xl font-poetic text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'account'
              ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 border border-pink-400/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Tài Khoản Admin</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
            1/1
          </span>
        </button>
      </div>

      {/* TAB 1: KHO NHÂN VẬT */}
      {activeTab === 'characters' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Status filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-2xl text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-pink-600/30 text-pink-200 border border-pink-400/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tất cả ({characters.length})
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  filterStatus === 'published'
                    ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Công khai ({publishedCount})
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  filterStatus === 'draft'
                    ? 'bg-amber-600/30 text-amber-200 border border-amber-400/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Bản nháp / Ẩn ({draftCount})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Lọc nhân vật theo tên..."
                className="w-full bg-white/[0.04] border border-white/10 focus:border-pink-400/50 text-white rounded-full pl-9.5 pr-4 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Character Cards List in Admin Mode */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl border border-white/10 bg-white/[0.02] text-zinc-400">
              <p className="font-poetic text-lg text-zinc-200">Không có nhân vật nào trong bộ lọc này.</p>
              <button
                onClick={onCreateNew}
                className="mt-4 px-4 py-2 rounded-xl bg-pink-600/25 hover:bg-pink-600/40 text-pink-200 text-xs font-semibold border border-pink-500/30 transition-all cursor-pointer"
              >
                Tạo Nhân Vật Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((char) => (
                <div
                  key={char.id}
                  className="rounded-3xl border border-white/10 hover:border-pink-400/30 bg-[#0d0f1e]/90 p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-zinc-900 shadow-md">
                      <img
                        src={char.avatar || FALLBACK_AVATAR_SVG}
                        alt={char.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_AVATAR_SVG;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold font-poetic text-white truncate">
                          {char.name}
                        </h4>
                        <span 
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border shrink-0 ${
                            char.published && !char.isDraft && char.status !== 'draft'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                              : (char.isDraft || char.status === 'draft'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                  : 'bg-purple-950/80 text-purple-300 border-purple-500/40')
                          }`}
                        >
                          {char.published && !char.isDraft && char.status !== 'draft'
                            ? 'Công khai'
                            : (char.isDraft || char.status === 'draft' ? 'Bản nháp' : 'Đã ẩn')}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-garamond italic truncate mt-0.5">
                        {char.tagline || 'Không có mô tả'}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">
                        Cập nhật: {new Date(char.updatedAt || char.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                    <button
                      onClick={() => onSelect(char)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      Xem chi tiết
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTogglePublish(char)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                        title={char.published ? 'Ẩn khỏi kho công khai' : 'Xuất bản ra kho công khai'}
                      >
                        {char.published ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5 text-emerald-300" />}
                      </button>

                      <button
                        onClick={() => onEdit(char)}
                        className="p-2 rounded-xl bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 border border-pink-500/30 transition-colors"
                        title="Chỉnh sửa nhân vật"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onRequestDelete(char)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-colors"
                        title="Xóa nhân vật"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KHU VỰC BẢN NHÁP (Requirement 15) */}
      {activeTab === 'drafts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Drafts Tab Header & Quick Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-poetic text-amber-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Danh Sách Bản Nháp ({draftCount})</span>
              </h3>
              <p className="text-xs text-zinc-400 font-garamond italic mt-0.5">
                Các bản nháp đang soạn dở được lưu trữ an toàn và 100% ẩn khỏi người xem công khai.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Tìm kiếm bản nháp..."
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-amber-400/50 text-white rounded-full pl-9.5 pr-4 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                onClick={onCreateNew}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-400/40 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Soạn mới</span>
              </button>
            </div>
          </div>

          {/* Drafts Cards Grid */}
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl border border-dashed border-amber-500/20 bg-amber-500/[0.02] text-zinc-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="font-poetic text-lg text-amber-200">
                {searchQuery ? 'Không tìm thấy bản nháp phù hợp từ khóa.' : 'Hiện chưa có bản nháp nào đang lưu.'}
              </p>
              <p className="text-xs text-zinc-400 font-garamond italic max-w-md mx-auto leading-relaxed">
                Khi tạo nhân vật hoặc chỉnh sửa, bạn có thể nhấn <span className="text-amber-300 font-semibold">[LƯU BẢN NHÁP]</span> để lưu lại tiến trình mà không lo người ngoài nhìn thấy.
              </p>
              <button
                onClick={onCreateNew}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 text-xs font-semibold border border-amber-500/40 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Bắt Đầu Soạn Bản Nháp Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrafts.map((char) => (
                <div
                  key={char.id}
                  className="rounded-3xl border border-amber-500/25 hover:border-amber-400/50 bg-[#0d0f1e]/95 p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/30 shrink-0 bg-zinc-900 shadow-md">
                      <img
                        src={char.avatar || FALLBACK_AVATAR_SVG}
                        alt={char.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_AVATAR_SVG;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-bold font-poetic text-amber-100 truncate">
                          {char.name || 'Bản nháp chưa đặt tên'}
                        </h4>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 shrink-0 uppercase tracking-wider">
                          Bản Nháp
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-garamond italic truncate mt-0.5">
                        {char.tagline || 'Chưa có lời tựa / mô tả...'}
                      </p>
                      <p className="text-[10px] text-amber-400/70 font-mono mt-1">
                        Cập nhật: {new Date(char.updatedAt || char.createdAt).toLocaleDateString('vi-VN')} {new Date(char.updatedAt || char.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Draft Tags */}
                  {Array.isArray(char.tags) && char.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {char.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-zinc-400 border border-white/5 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                      {char.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-500">+{char.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Draft Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onEdit(char)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        title="Mở form để tiếp tục chỉnh sửa bản nháp"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                        <span>Tiếp Tục Soạn</span>
                      </button>

                      <button
                        onClick={() => onTogglePublish(char)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        title="Chuyển bản nháp thành nhân vật chính thức công khai"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Xuất Bản Ngay</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onSelect(char)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>Xem trước chi tiết</span>
                      </button>

                      <button
                        onClick={() => onRequestDelete(char)}
                        className="text-xs text-red-400/80 hover:text-red-300 transition-colors flex items-center gap-1"
                        title="Xóa vĩnh viễn bản nháp này"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                        <span>Xóa bản nháp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIỆN MẠO WEBSITE */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0c0e1e]/90 border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xl font-bold font-poetic text-white">
                  Quản Lý Diện Mạo & Không Gian
                </h3>
                <p className="text-xs text-zinc-400 font-garamond italic mt-0.5">
                  Thay đổi Avatar, Ảnh bìa cover và Chủ đề hiển thị toàn trang của Một Góc Trời
                </p>
              </div>

              {onOpenAppearanceModal && (
                <button
                  type="button"
                  onClick={onOpenAppearanceModal}
                  className="px-5 py-2.5 rounded-2xl font-poetic font-bold text-xs text-white bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 hover:from-pink-400 hover:to-sky-400 shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Palette className="w-4 h-4" />
                  <span>Mở Trình Chỉnh Sửa Diện Mạo</span>
                </button>
              )}
            </div>

            {/* Current Assets Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-300 font-poetic">
                  Ảnh Bìa Hiện Tại
                </span>
                <div className="h-36 rounded-xl overflow-hidden border border-white/15 relative bg-[#121422]">
                  <img
                    src={siteConfig?.cover || FALLBACK_COVER_SVG}
                    alt="Current Cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_COVER_SVG;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <p className="text-xs text-white font-poetic">Một Góc Trời · Cover</p>
                  </div>
                </div>
              </div>

              {/* Avatar Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-pink-300 font-poetic">
                  Avatar Độc Quyền
                </span>
                <div className="h-36 rounded-xl border border-white/15 bg-[#121422] flex items-center justify-center gap-4 p-4">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-pink-400 via-purple-400 to-sky-400 shadow-xl shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-black/80">
                      <img
                        src={siteConfig?.avatar || FALLBACK_AVATAR_SVG}
                        alt="Current Avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_AVATAR_SVG;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white text-base font-poetic">Hồn treo gió</p>
                    <p className="text-zinc-400 text-xs italic font-garamond leading-tight">
                      “Hồn treo theo gió, chuyện nằm lại giữa một góc trời.”
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Themes List */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-pink-300 font-poetic">
                4 Chủ Đề Toàn Trang (Global Themes)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(THEME_PRESETS_INFO).map(([key, info]) => {
                  const isActive = siteConfig?.theme === key;
                  return (
                    <div
                      key={key}
                      onClick={onOpenAppearanceModal}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-950/30 border-pink-400 ring-2 ring-pink-500/25 shadow-lg'
                          : 'bg-black/30 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold font-poetic text-white flex items-center gap-1.5">
                          {key === 'normal' && <CloudSun className="w-4 h-4 text-pink-300" />}
                          {key === 'tet' && <Flame className="w-4 h-4 text-amber-400" />}
                          {key === 'noel' && <Snowflake className="w-4 h-4 text-sky-300" />}
                          {key === 'trung_thu' && <Moon className="w-4 h-4 text-yellow-300" />}
                          {info.name}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] bg-pink-500/20 text-pink-300 border border-pink-400/30 uppercase font-mono font-bold">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                        {info.description}
                      </p>
                      <div className="flex gap-1.5">
                        {info.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TÀI KHOẢN ADMIN */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0c0e1e]/90 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-white/[0.08]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-sky-400 flex items-center justify-center text-white font-bold font-poetic text-2xl shadow-lg">
                {adminAccount?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="text-lg font-bold font-poetic text-white flex items-center gap-2">
                  <span>{adminAccount?.email || adminEmail || 'Admin Chủ Kho'}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    Admin Duy Nhất (1/1)
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  User ID: {adminAccount?.id || 'usr_admin_01'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 font-medium">Quyền hạn</span>
                <p className="text-white font-semibold text-sm">Chủ kho độc quyền (Sole Administrator)</p>
                <p className="text-[11px] text-zinc-400 font-garamond italic">Toàn quyền thêm, sửa, xóa, xuất bản nhân vật và thay đổi diện mạo website</p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-zinc-500 font-medium">Phiên làm việc</span>
                <p className="text-white font-semibold text-sm">Persistent Session (Bền vững)</p>
                <p className="text-[11px] text-zinc-400 font-garamond italic">Duy trì trạng thái đăng nhập sau khi đóng trình duyệt hoặc reload trang</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
