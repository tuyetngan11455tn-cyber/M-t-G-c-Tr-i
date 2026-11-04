import { SiteConfig, GlobalSiteTheme } from '../types';

const SITE_CONFIG_KEY = 'mot_goc_troi_site_config';

// Safe poetic vector artwork fallbacks (never 404, never turn black)
export const FALLBACK_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><defs><radialGradient id="avGrad" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="%23fbcfe8"/><stop offset="50%" stop-color="%23c084fc"/><stop offset="100%" stop-color="%2338bdf8"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="100" cy="100" r="96" fill="%230c0e1b" stroke="url(%23avGrad)" stroke-width="4"/><circle cx="100" cy="100" r="88" fill="url(%23avGrad)" opacity="0.25"/><path d="M 60 110 C 60 85, 80 65, 100 65 C 120 65, 140 85, 140 110 C 140 120, 130 125, 120 125 C 110 125, 105 115, 100 115 C 95 115, 90 125, 80 125 C 70 125, 60 120, 60 110 Z" fill="white" opacity="0.85" filter="url(%23glow)"/><circle cx="100" cy="85" r="7" fill="white" opacity="0.9"/><circle cx="125" cy="75" r="3" fill="%23fef08a" opacity="0.9"/><circle cx="75" cy="80" r="2.5" fill="%23fbcfe8" opacity="0.8"/><text x="100" y="155" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="%23e2e8f0" letter-spacing="2">HỒN TREO GIÓ</text></svg>`;

export const FALLBACK_COVER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" width="1600" height="600"><defs><linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a102f"/><stop offset="40%" stop-color="%232e1847"/><stop offset="70%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><radialGradient id="sunGlow" cx="60%" cy="35%" r="40%"><stop offset="0%" stop-color="%23fed7aa" stop-opacity="0.45"/><stop offset="40%" stop-color="%23f472b6" stop-opacity="0.25"/><stop offset="100%" stop-color="%2338bdf8" stop-opacity="0"/></radialGradient><linearGradient id="cloudGrad" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="%230f172a" stop-opacity="0.95"/><stop offset="60%" stop-color="%23334155" stop-opacity="0.4"/><stop offset="100%" stop-color="%23cbd5e1" stop-opacity="0.2"/></linearGradient></defs><rect width="1600" height="600" fill="url(%23skyGrad)"/><circle cx="960" cy="220" r="280" fill="url(%23sunGlow)"/><g opacity="0.6"><path d="M 0 450 Q 250 380 500 440 T 1000 420 T 1600 460 L 1600 600 L 0 600 Z" fill="url(%23cloudGrad)"/><path d="M 0 500 Q 350 430 700 490 T 1400 470 T 1600 510 L 1600 600 L 0 600 Z" fill="%230b0f19" opacity="0.9"/></g><circle cx="320" cy="140" r="2" fill="white" opacity="0.7"/><circle cx="480" cy="80" r="1.5" fill="%23fed7aa" opacity="0.8"/><circle cx="820" cy="110" r="2.5" fill="%23fbcfe8" opacity="0.8"/><circle cx="1240" cy="95" r="2" fill="white" opacity="0.9"/><circle cx="1420" cy="160" r="1.5" fill="%2338bdf8" opacity="0.7"/><text x="120" y="520" font-family="serif" font-size="28" font-weight="bold" fill="%23f1f5f9" letter-spacing="4" opacity="0.85">MỘT GÓC TRỜI</text><text x="120" y="555" font-family="sans-serif" font-size="14" font-style="italic" fill="%2394a3b8" opacity="0.8">Hồn treo theo gió, chuyện nằm lại giữa một góc trời.</text></svg>`;

// Curated aesthetic presets for Dreamy Sky / Cloud / Nature / Poetic profile
export const DEFAULT_COVER_URL = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop';
export const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop';

export const THEME_PRESETS_INFO: Record<GlobalSiteTheme, {
  name: string;
  badge: string;
  description: string;
  colors: string[];
  coverPreset: string;
  bgGlow: string;
}> = {
  normal: {
    name: 'Bình thường',
    badge: 'Mây Trời & Hoa Đào',
    description: 'Tone be, kem, hồng hoa anh đào, xanh trời nhạt, mây trời thơ mộng và cây cỏ nhẹ nhàng.',
    colors: ['#fdf2f8', '#fed7aa', '#f472b6', '#38bdf8'],
    coverPreset: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop',
    bgGlow: 'radial-gradient(circle, rgba(244,114,182,0.18) 0%, rgba(56,189,248,0.12) 50%, transparent 100%)'
  },
  tet: {
    name: 'Tết',
    badge: 'Xuân Giáp & Đèn Lồng',
    description: 'Tone đỏ thắm, vàng kim, cam ấm, hoa đào, hoa mai, lồng đèn rực rỡ đón xuân.',
    colors: ['#ef4444', '#f59e0b', '#fb923c', '#fef08a'],
    coverPreset: 'https://images.unsplash.com/photo-1514894780887-121968d00567?q=80&w=2000&auto=format&fit=crop',
    bgGlow: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(245,158,11,0.15) 50%, transparent 100%)'
  },
  noel: {
    name: 'Noel',
    badge: 'Mùa Đông & Tuyết Trắng',
    description: 'Tone đỏ giáng sinh, xanh lá thông, tuyết trắng tinh khôi, ánh đèn vàng ấm áp.',
    colors: ['#10b981', '#e11d48', '#f8fafc', '#fbbf24'],
    coverPreset: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=2000&auto=format&fit=crop',
    bgGlow: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(225,29,72,0.15) 50%, transparent 100%)'
  },
  trung_thu: {
    name: 'Trung Thu',
    badge: 'Dạ Nguyệt & Trăng Rằm',
    description: 'Tone xanh đêm, tím huyền ảo, vàng ánh trăng, trăng tròn vằng vặc, mây đêm và đèn hoa đăng.',
    colors: ['#4338ca', '#8b5cf6', '#fbbf24', '#e0e7ff'],
    coverPreset: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop',
    bgGlow: 'radial-gradient(circle, rgba(67,56,202,0.22) 0%, rgba(251,191,36,0.15) 50%, transparent 100%)'
  }
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Một Góc Trời',
  profileName: 'Hồn treo gió',
  tagline: 'Hồn treo theo gió, chuyện nằm lại giữa một góc trời.',
  avatar: DEFAULT_AVATAR_URL,
  cover: DEFAULT_COVER_URL,
  theme: 'normal'
};

/**
 * Clean & validate image URL so temporary blob URLs are never persisted
 */
export function sanitizeImageUrl(url: string | undefined | null, fallback: string): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:')) {
    // Blob URLs expire when window is closed, cannot be used as permanent storage
    return fallback;
  }
  return trimmed || fallback;
}

/**
 * Retrieve current Site Config synchronously from storage with resilient fallback
 */
export function getSiteConfig(): SiteConfig {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SITE_CONFIG_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        siteName: 'Một Góc Trời',
        profileName: parsed.profileName || 'Hồn treo gió',
        tagline: parsed.tagline || 'Hồn treo theo gió, chuyện nằm lại giữa một góc trời.',
        avatar: sanitizeImageUrl(parsed.avatar, DEFAULT_AVATAR_URL),
        cover: sanitizeImageUrl(parsed.cover, DEFAULT_COVER_URL),
        theme: (['normal', 'tet', 'noel', 'trung_thu'].includes(parsed.theme) ? parsed.theme : 'normal') as GlobalSiteTheme
      };
    }
  } catch (err) {
    console.warn('Error reading site config from storage:', err);
  }
  return DEFAULT_SITE_CONFIG;
}

/**
 * Fetch persistent Site Config from backend server and sync with local storage
 */
export async function syncSiteConfigWithServer(): Promise<SiteConfig> {
  const current = getSiteConfig();
  try {
    const res = await fetch('/api/site-config');
    if (res.ok) {
      const remoteConfig = await res.json();
      if (remoteConfig && typeof remoteConfig === 'object') {
        const merged: SiteConfig = {
          ...current,
          ...remoteConfig,
          siteName: 'Một Góc Trời',
          profileName: remoteConfig.profileName || current.profileName || 'Hồn treo gió',
          tagline: remoteConfig.tagline || current.tagline || 'Hồn treo theo gió, chuyện nằm lại giữa một góc trời.',
          avatar: sanitizeImageUrl(remoteConfig.avatar, current.avatar),
          cover: sanitizeImageUrl(remoteConfig.cover, current.cover),
          theme: (['normal', 'tet', 'noel', 'trung_thu'].includes(remoteConfig.theme) ? remoteConfig.theme : current.theme) as GlobalSiteTheme
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('mot_goc_troi_config_updated', { detail: merged }));
          } catch {
            // Ignore quota
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not sync site config from server, using local copy:', err);
  }
  return current;
}

/**
 * Update and persist Site Config to BOTH LocalStorage and Server File (Admin only)
 */
export function saveSiteConfig(updates: Partial<SiteConfig>): SiteConfig {
  const current = getSiteConfig();
  const nextConfig: SiteConfig = {
    ...current,
    ...updates,
    siteName: 'Một Góc Trời',
    avatar: sanitizeImageUrl(updates.avatar !== undefined ? updates.avatar : current.avatar, current.avatar),
    cover: sanitizeImageUrl(updates.cover !== undefined ? updates.cover : current.cover, current.cover)
  };

  // 1. Save synchronously to localStorage
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(nextConfig));
      window.dispatchEvent(new CustomEvent('mot_goc_troi_config_updated', { detail: nextConfig }));
    }
  } catch (err) {
    console.error('Error saving site config to local storage:', err);
  }

  // 2. Persist to server backend JSON file
  if (typeof fetch !== 'undefined') {
    fetch('/api/site-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig)
    }).catch(err => {
      console.warn('Failed to sync site config to server file:', err);
    });
  }

  return nextConfig;
}
