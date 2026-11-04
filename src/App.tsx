import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Character, AdminAccountInfo, SiteConfig } from './types';
import { 
  fetchCharacters, 
  createCharacter, 
  updateCharacter, 
  togglePublishCharacter, 
  deleteCharacter
} from './services/api';
import { 
  getAdminSession, 
  isSystemAdminConfigured, 
  getAdminAccountDetails, 
  logoutSoleAdmin 
} from './services/adminAuth';
import { getSiteConfig, saveSiteConfig, syncSiteConfigWithServer } from './services/siteConfig';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Navbar } from './components/Navbar';
import { PublicGallery } from './components/PublicGallery';
import { CharacterDetail } from './components/CharacterDetail';
import { CharacterForm } from './components/CharacterForm';
import { OwnerManageView } from './components/OwnerManageView';
import { AdminLogin } from './components/AdminLogin';
import { AdminAppearanceModal } from './components/AdminAppearanceModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

type ViewMode = 'public' | 'manage' | 'create' | 'edit' | 'detail' | 'login';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  const [activeView, setActiveView] = useState<ViewMode>('public');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronous Admin authentication state from persistent storage
  const [isOwner, setIsOwner] = useState<boolean>(() => {
    const session = getAdminSession();
    return Boolean(session?.isLoggedIn);
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    const session = getAdminSession();
    return session?.email || '';
  });
  const [adminAccount, setAdminAccount] = useState<AdminAccountInfo | null>(() => {
    return getAdminAccountDetails();
  });
  const [isConfigured, setIsConfigured] = useState<boolean>(() => {
    return isSystemAdminConfigured();
  });

  // Website Global Site Appearance Config (Shared for site, editable by Admin only)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Sync siteConfig reactively across the app
  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      if (e.detail) {
        setSiteConfig(e.detail);
      }
    };
    window.addEventListener('mot_goc_troi_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('mot_goc_troi_config_updated', handleConfigUpdate);
  }, []);

  const handleSaveSiteConfig = (updates: Partial<SiteConfig>) => {
    const updated = saveSiteConfig(updates);
    setSiteConfig(updated);
    showToast('Đã lưu và cập nhật diện mạo website thành công!');
  };

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const initialRouteHandled = useRef(false);

  // URL router navigation helper with safe View Transitions support
  const navigate = useCallback((path: string, view: ViewMode) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }

    if (typeof document !== 'undefined' && 'startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      try {
        const transition = (document as any).startViewTransition(() => {
          setActiveView(view);
        });
        if (transition) {
          transition.finished?.catch?.(() => {});
          transition.ready?.catch?.(() => {});
          transition.updateCallbackDone?.catch?.(() => {});
        }
      } catch {
        setActiveView(view);
      }
    } else {
      setActiveView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load characters with correct scope (admin sees all, public sees published)
  const loadCharacters = useCallback(async () => {
    try {
      const scope = isOwner ? 'admin' : 'public';
      const list = await fetchCharacters(searchQuery, undefined, scope);
      setCharacters(list);
    } catch (err) {
      console.error('Error loading characters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, isOwner]);

  // Handle initial page load & routing
  useEffect(() => {
    let isMounted = true;
    async function init() {
      // 1. Sync admin status from local storage
      const session = getAdminSession();
      const configured = isSystemAdminConfigured();
      if (isMounted) {
        setIsConfigured(configured);
        setIsOwner(Boolean(session?.isLoggedIn));
        if (session?.email) {
          setAdminEmail(session.email);
        }
        setAdminAccount(getAdminAccountDetails());
      }

      // Sync persistent site config with server file (/api/site-config)
      syncSiteConfigWithServer().then(conf => {
        if (isMounted && conf) {
          setSiteConfig(conf);
        }
      }).catch(() => {});

      // 2. Fetch characters
      const scope = session?.isLoggedIn ? 'admin' : 'public';
      const list = await fetchCharacters('', undefined, scope);
      if (isMounted) {
        setCharacters(list);
        setIsLoading(false);
      }

      // 3. Resolve initial route
      if (!initialRouteHandled.current) {
        initialRouteHandled.current = true;
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);

        const isLoginIntent = currentPath === '/admin/login' || currentHash === '#/admin/login' || currentHash === '#admin' || searchParams.get('admin') === 'login';
        const isManageIntent = currentPath === '/admin' || currentPath.startsWith('/admin/') || currentHash === '#/admin' || searchParams.get('admin') === 'manage';

        if (isLoginIntent) {
          if (session?.isLoggedIn) {
            navigate('/admin', 'manage');
          } else {
            setActiveView('login');
          }
        } else if (isManageIntent) {
          if (!session?.isLoggedIn) {
            navigate('/admin/login', 'login');
          } else {
            setActiveView('manage');
          }
        } else {
          setActiveView('public');
        }
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Update characters when search query or admin status changes
  useEffect(() => {
    let isCurrent = true;
    const scope = isOwner ? 'admin' : 'public';
    fetchCharacters(searchQuery, undefined, scope)
      .then((list) => {
        if (isCurrent) setCharacters(list);
      })
      .catch((err) => {
        console.error('Error filtering characters:', err);
      });
    return () => {
      isCurrent = false;
    };
  }, [searchQuery, isOwner]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/login') {
        if (isOwner) {
          navigate('/admin', 'manage');
        } else {
          setActiveView('login');
        }
      } else if (path === '/admin' || path.startsWith('/admin/')) {
        if (!isOwner) {
          navigate('/admin/login', 'login');
        } else {
          setActiveView('manage');
        }
      } else {
        setActiveView('public');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOwner, navigate]);

  // Search input handler
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Select character to view detail
  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start editing a character
  const handleEditCharacter = (char: Character) => {
    if (!isOwner) {
      navigate('/admin/login', 'login');
      return;
    }
    setEditingCharacter(char);
    navigate('/admin/edit', 'edit');
  };

  // Start creating a new character
  const handleCreateNew = () => {
    if (!isOwner) {
      navigate('/admin/login', 'login');
      return;
    }
    setEditingCharacter(null);
    navigate('/admin/create', 'create');
  };

  // Save character (create or update, with draft support and duplicate prevention)
  const handleSaveCharacter = async (
    data: Partial<Character>, 
    publish: boolean, 
    targetId?: string | null
  ): Promise<Character> => {
    try {
      const charId = targetId || editingCharacter?.id;
      let result: Character;
      if (charId) {
        result = await updateCharacter(charId, data);
        showToast(publish ? 'Đã xuất bản nhân vật thành công!' : 'Đã lưu bản nháp thành công!');
        if (selectedCharacter && selectedCharacter.id === result.id) {
          setSelectedCharacter(result);
        }
      } else {
        result = await createCharacter(data);
        showToast(publish ? 'Đã tạo và xuất bản nhân vật mới!' : 'Đã lưu nhân vật nháp mới!');
      }

      await loadCharacters();
      navigate('/admin', 'manage');
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, 'error');
      } else {
        showToast('Có lỗi xảy ra khi lưu nhân vật', 'error');
      }
      throw err;
    }
  };

  // Toggle publish / hide status
  const handleTogglePublish = async (char: Character) => {
    try {
      const res = await togglePublishCharacter(char.id);
      showToast(res.published ? `Đã xuất bản "${char.name}" ra kho công khai` : `Đã ẩn "${char.name}"`);
      await loadCharacters();
      if (selectedCharacter && selectedCharacter.id === char.id) {
        setSelectedCharacter(prev => prev ? { ...prev, published: res.published } : null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message, 'error');
      else showToast('Lỗi khi thay đổi trạng thái', 'error');
    }
  };

  // Prompt delete confirmation modal
  const handleRequestDelete = (char: Character) => {
    setCharacterToDelete(char);
  };

  // Execute deletion upon confirmation
  const handleConfirmDelete = async () => {
    if (!characterToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCharacter(characterToDelete.id);
      showToast(`Đã xóa nhân vật "${characterToDelete.name}" thành công!`);
      setCharacterToDelete(null);

      if (selectedCharacter && selectedCharacter.id === characterToDelete.id) {
        setSelectedCharacter(null);
        navigate(isOwner ? '/admin' : '/', isOwner ? 'manage' : 'public');
      }

      await loadCharacters();
    } catch (err: unknown) {
      if (err instanceof Error) showToast(err.message, 'error');
      else showToast('Không thể xóa nhân vật', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Initial Admin Setup success handler
  const handleSetupSuccess = (email: string) => {
    setIsConfigured(true);
    setAdminEmail(email);
    setAdminAccount(getAdminAccountDetails());
    showToast(`Khởi tạo Admin đầu tiên thành công!`);
  };

  // Admin Login success handler
  const handleLoginSuccess = (email: string) => {
    setIsOwner(true);
    setIsConfigured(true);
    setAdminEmail(email);
    setAdminAccount(getAdminAccountDetails());
    showToast(`Đăng nhập thành công với tài khoản Admin: ${email}!`);
    navigate('/admin', 'manage');
    loadCharacters();
  };

  // Logout handler
  const handleLogout = () => {
    logoutSoleAdmin();
    setIsOwner(false);
    setAdminEmail('');
    showToast('Đã kết thúc phiên làm việc Admin.');
    navigate('/admin/login', 'login');
    loadCharacters();
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-purple-500 selection:text-white flex flex-col relative">
      {/* Dynamic Background Effects */}
      <BackgroundEffects theme={siteConfig.theme} />

      {/* Top Navigation */}
      {activeView !== 'login' && (
        <Navbar
          isOwner={isOwner}
          adminEmail={adminEmail}
          activeView={activeView}
          onNavigate={(view) => {
            if (view === 'public') {
              navigate('/', 'public');
            } else if (view === 'manage') {
              if (isOwner) navigate('/admin', 'manage');
              else navigate('/admin/login', 'login');
            } else if (view === 'create') {
              if (isOwner) {
                setEditingCharacter(null);
                navigate('/admin/create', 'create');
              } else {
                navigate('/admin/login', 'login');
              }
            }
          }}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          characterCount={characters.length}
          onOpenAppearanceModal={() => setIsAppearanceModalOpen(true)}
          onOpenAboutModal={() => setIsAboutModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <div className="w-10 h-10 border-2 border-pink-400/30 border-t-pink-300 rounded-full animate-spin" />
            <span className="text-xs font-poetic text-pink-200 tracking-widest">Đang kết nối một khoảng trời...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* View 1: Public Gallery (Home) */}
            {activeView === 'public' && (
              <motion.div
                key="public"
                initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <PublicGallery
                  characters={characters}
                  onSelectCharacter={handleSelectCharacter}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  isOwner={isOwner}
                  onEdit={handleEditCharacter}
                  onDelete={handleRequestDelete}
                  onTogglePublish={handleTogglePublish}
                  onOpenAdminLogin={() => navigate('/admin/login', 'login')}
                  siteConfig={siteConfig}
                  onOpenAdminSettings={() => setIsAppearanceModalOpen(true)}
                />
              </motion.div>
            )}

            {/* View 2: Character Detail */}
            {activeView === 'detail' && (
              selectedCharacter ? (
                <motion.div
                  key={`detail_${selectedCharacter.id}`}
                  initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CharacterDetail
                    character={selectedCharacter}
                    isOwner={isOwner}
                    onBack={() => {
                      navigate(isOwner ? '/admin' : '/', isOwner ? 'manage' : 'public');
                    }}
                    onEdit={(char) => handleEditCharacter(char)}
                  />
                </motion.div>
              ) : (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <p className="text-zinc-400 text-sm">Không tìm thấy thông tin nhân vật hoặc nhân vật đã bị xóa.</p>
                  <button
                    onClick={() => navigate('/', 'public')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại Kho Nhân Vật</span>
                  </button>
                </div>
              )
            )}

            {/* View 3: Dedicated Admin Login Page at /admin/login */}
            {activeView === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <AdminLogin
                  isConfigured={isConfigured}
                  onLoginSuccess={handleLoginSuccess}
                  onSetupSuccess={handleSetupSuccess}
                  onBackToPublic={() => navigate('/', 'public')}
                />
              </motion.div>
            )}

            {/* View 4: Owner Manage View at /admin (Protected) */}
            {activeView === 'manage' && (
              isOwner ? (
                <motion.div
                  key="manage"
                  initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <OwnerManageView
                    characters={characters}
                    onCreateNew={handleCreateNew}
                    onEdit={handleEditCharacter}
                    onSelect={handleSelectCharacter}
                    onTogglePublish={handleTogglePublish}
                    onRequestDelete={handleRequestDelete}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    adminAccount={adminAccount}
                    adminEmail={adminEmail}
                    siteConfig={siteConfig}
                    onOpenAppearanceModal={() => setIsAppearanceModalOpen(true)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="unauthorized_manage"
                  initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AdminLogin
                    isConfigured={isConfigured}
                    onLoginSuccess={handleLoginSuccess}
                    onSetupSuccess={handleSetupSuccess}
                    onBackToPublic={() => navigate('/', 'public')}
                  />
                </motion.div>
              )
            )}

            {/* View 5: Create or Edit Character (Protected) */}
            {(activeView === 'create' || activeView === 'edit') && (
              isOwner ? (
                <motion.div
                  key={activeView === 'edit' ? `edit_${editingCharacter?.id}` : 'create'}
                  initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CharacterForm
                    initialData={activeView === 'edit' ? editingCharacter : null}
                    onSave={handleSaveCharacter}
                    onCancel={() => {
                      navigate('/admin', 'manage');
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="unauthorized_form"
                  initial={{ opacity: 0, y: 16, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -16, filter: 'blur(3px)' }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AdminLogin
                    isConfigured={isConfigured}
                    onLoginSuccess={handleLoginSuccess}
                    onSetupSuccess={handleSetupSuccess}
                    onBackToPublic={() => navigate('/', 'public')}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 text-sm animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/60'
              : 'bg-red-950/90 text-red-200 border-red-500/40 shadow-red-950/60'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Strict Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(characterToDelete)}
        characterName={characterToDelete?.name || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCharacterToDelete(null)}
      />

      {/* Admin Appearance Modal (Admin Exclusive) */}
      {isOwner && (
        <AdminAppearanceModal
          isOpen={isAppearanceModalOpen}
          onClose={() => setIsAppearanceModalOpen(false)}
          siteConfig={siteConfig}
          onSave={handleSaveSiteConfig}
        />
      )}

      {/* Poetic Sanctuary Info Modal (Trang Giới Thiệu) */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#0d0f22] border border-pink-400/30 rounded-[2.5rem] p-7 sm:p-9 shadow-2xl relative text-left">
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-sky-400 p-[1.5px] shadow-lg mb-5">
              <div className="w-full h-full bg-[#0a0c18] rounded-[14px] flex items-center justify-center text-pink-300 font-bold">
                ✦
              </div>
            </div>
            <h3 className="text-2xl font-bold font-poetic text-white mb-1">
              Một Góc Trời
            </h3>
            <p className="text-xs uppercase tracking-widest text-pink-300 font-poetic mb-4">
              Không gian sáng tạo của Hồn treo gió
            </p>
            <div className="space-y-3.5 text-xs sm:text-sm text-zinc-300/90 font-garamond leading-relaxed">
              <p className="italic text-base text-pink-100">
                “Hồn treo theo gió, chuyện nằm lại giữa một góc trời.”
              </p>
              <p>
                Đây là một góc nhỏ bình yên giữa bầu trời số. Nơi lưu giữ những nhân vật, những hình bóng và mẩu chuyện được dệt nên từ tâm tưởng của chủ kho.
              </p>
              <p>
                Mỗi nhân vật mang một số phận, một sắc diện và những dòng thoại riêng biệt. Bạn có thể tự do khám phá hồ sơ, tìm hiểu câu chuyện hoặc bước vào trò chuyện trực tiếp.
              </p>
            </div>
            <div className="mt-7 pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 text-white font-poetic text-xs font-semibold shadow-lg hover:brightness-110 cursor-pointer active:scale-95"
              >
                Trở Về Kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
