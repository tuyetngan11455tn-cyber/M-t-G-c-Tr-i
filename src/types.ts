export type FrameStyle = 'soft' | 'glass' | 'neon' | 'dark' | 'glowing' | 'minimal';
export type DialogueStyle = 'bubble' | 'visual_novel' | 'novel' | 'split';
export type BackgroundStyle = 'gradient' | 'cyber' | 'aurora' | 'deep_space' | 'crimson_void' | 'emerald_mist';
export type GlowIntensity = 'none' | 'low' | 'medium' | 'high' | 'ultra';
export type BorderRadiusSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'contrast' | 'vibrant' | 'noir' | 'warm';

export interface DialogueSample {
  speaker: 'char' | 'user';
  text: string;
}

export interface CharTheme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  glowColor: string;
  borderColor: string;
  frameStyle: FrameStyle;
  borderRadius: BorderRadiusSize;
  backgroundOpacity: number; // 0.1 to 0.95
  backgroundStyle: BackgroundStyle;
  glowIntensity: GlowIntensity;
  dialogueDisplay: DialogueStyle;
  imageFilter?: ImageFilter;
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  cover: string;
  tagline: string;
  story: string;
  charProfile: string;
  userProfile?: string;
  profile?: string; // alias for charProfile
  tags?: string[];
  chatLink?: string;
  chatUrl?: string; // alias for chatLink
  theme: CharTheme;
  sampleDialogues?: DialogueSample[];
  published: boolean;
  status?: 'published' | 'draft' | 'hidden';
  isDraft?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccountInfo {
  id: string;
  email: string;
  role: 'admin';
  status: 'active' | 'suspended';
  lastLogin?: string;
  totalAdminAccounts: number;
}

export interface AdminUser {
  email: string;
  role: 'admin';
}

export interface OwnerStatusResponse {
  isConfigured: boolean;
  isAuthenticated: boolean;
  email?: string;
  role?: string;
  adminAccount?: AdminAccountInfo;
}

export type GlobalSiteTheme = 'normal' | 'tet' | 'noel' | 'trung_thu';

export interface SiteConfig {
  siteName: string;
  profileName: string;
  tagline: string;
  avatar: string;
  cover: string;
  theme: GlobalSiteTheme;
}

