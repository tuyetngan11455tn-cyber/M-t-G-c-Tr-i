import { CharTheme, FrameStyle, GlowIntensity, BorderRadiusSize, ImageFilter } from '../types';

export const IMAGE_FILTERS: { id: ImageFilter; label: string; description: string }[] = [
  { id: 'none', label: 'Mặc định', description: 'Giữ nguyên màu gốc' },
  { id: 'grayscale', label: 'Trắng đen', description: 'Đơn sắc cổ điển' },
  { id: 'sepia', label: 'Sepia', description: 'Tông nâu hoài niệm' },
  { id: 'contrast', label: 'Tương phản', description: 'Nổi bật sắc cạnh' },
  { id: 'vibrant', label: 'Rực rỡ', description: 'Màu sắc sống động' },
  { id: 'noir', label: 'Noir', description: 'Điện ảnh tương phản tối' },
  { id: 'warm', label: 'Tông ấm', description: 'Ấm áp hoàng hôn' }
];

export function getImageFilterClass(filter?: ImageFilter): string {
  switch (filter) {
    case 'grayscale':
      return 'grayscale';
    case 'sepia':
      return 'sepia';
    case 'contrast':
      return 'contrast-150';
    case 'vibrant':
      return 'saturate-150 contrast-110';
    case 'noir':
      return 'grayscale contrast-125 brightness-90';
    case 'warm':
      return 'sepia-50 saturate-125';
    case 'none':
    default:
      return '';
  }
}


export const THEME_PRESETS: { name: string; theme: Partial<CharTheme> }[] = [
  {
    name: 'Cyber Neon (Tím & Hồng Glass)',
    theme: {
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
      dialogueDisplay: 'bubble'
    }
  },
  {
    name: 'Crimson Abyss (Đỏ & Đen Cinematic)',
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#991b1b',
      textColor: '#ffffff',
      glowColor: '#f87171',
      borderColor: 'rgba(239, 68, 68, 0.5)',
      frameStyle: 'dark',
      borderRadius: 'xl',
      backgroundOpacity: 0.92,
      backgroundStyle: 'crimson_void',
      glowIntensity: 'high',
      dialogueDisplay: 'novel'
    }
  },
  {
    name: 'Futuristic Cyan (Xanh & Cyan Sci-Fi)',
    theme: {
      primaryColor: '#06b6d4',
      secondaryColor: '#3b82f6',
      textColor: '#ffffff',
      glowColor: '#22d3ee',
      borderColor: 'rgba(6, 182, 212, 0.55)',
      frameStyle: 'neon',
      borderRadius: 'xl',
      backgroundOpacity: 0.88,
      backgroundStyle: 'cyber',
      glowIntensity: 'high',
      dialogueDisplay: 'visual_novel'
    }
  },
  {
    name: 'Ethereal Aurora (Ngọc Bích & Xanh Biển)',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
      textColor: '#ffffff',
      glowColor: '#34d399',
      borderColor: 'rgba(16, 185, 129, 0.45)',
      frameStyle: 'glowing',
      borderRadius: '2xl',
      backgroundOpacity: 0.82,
      backgroundStyle: 'emerald_mist',
      glowIntensity: 'medium',
      dialogueDisplay: 'split'
    }
  },
  {
    name: 'Royal Amethyst (Tím Hoàng Gia & Vàng)',
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#eab308',
      textColor: '#ffffff',
      glowColor: '#a78bfa',
      borderColor: 'rgba(234, 179, 8, 0.4)',
      frameStyle: 'glass',
      borderRadius: '2xl',
      backgroundOpacity: 0.86,
      backgroundStyle: 'deep_space',
      glowIntensity: 'medium',
      dialogueDisplay: 'novel'
    }
  },
  {
    name: 'Soft Pastel Neon (Hồng Mềm & Tím Mơ Mộng)',
    theme: {
      primaryColor: '#f472b6',
      secondaryColor: '#c084fc',
      textColor: '#ffffff',
      glowColor: '#fbcfe8',
      borderColor: 'rgba(244, 114, 182, 0.4)',
      frameStyle: 'soft',
      borderRadius: '3xl',
      backgroundOpacity: 0.8,
      backgroundStyle: 'aurora',
      glowIntensity: 'low',
      dialogueDisplay: 'bubble'
    }
  }
];

export function getBorderRadiusClass(radius: BorderRadiusSize): string {
  switch (radius) {
    case 'sm': return 'rounded-sm';
    case 'md': return 'rounded-md';
    case 'lg': return 'rounded-lg';
    case 'xl': return 'rounded-xl';
    case '2xl': return 'rounded-2xl';
    case '3xl': return 'rounded-3xl';
    default: return 'rounded-2xl';
  }
}

export function getGlowShadow(glowColor: string, intensity: GlowIntensity): string {
  switch (intensity) {
    case 'none':
      return 'none';
    case 'low':
      return `0 0 14px ${glowColor}25, 0 4px 20px rgba(0, 0, 0, 0.6)`;
    case 'medium':
      return `0 0 24px ${glowColor}40, 0 0 8px ${glowColor}30, 0 8px 30px rgba(0, 0, 0, 0.7)`;
    case 'high':
      return `0 0 38px ${glowColor}60, 0 0 15px ${glowColor}45, 0 10px 40px rgba(0, 0, 0, 0.8)`;
    case 'ultra':
      return `0 0 55px ${glowColor}80, 0 0 25px ${glowColor}60, 0 12px 50px rgba(0, 0, 0, 0.9)`;
    default:
      return `0 0 20px ${glowColor}30`;
  }
}

export function getFrameStyleClasses(frameStyle: FrameStyle): {
  containerClass: string;
  badgeClass: string;
} {
  switch (frameStyle) {
    case 'glass':
      return {
        containerClass: 'backdrop-blur-xl border bg-black/40 shadow-2xl relative overflow-hidden',
        badgeClass: 'backdrop-blur-md bg-white/10'
      };
    case 'neon':
      return {
        containerClass: 'backdrop-blur-md border-2 bg-[#090b14]/90 relative overflow-hidden',
        badgeClass: 'bg-black/70 border border-cyan-400/40'
      };
    case 'soft':
      return {
        containerClass: 'backdrop-blur-lg border bg-gradient-to-b from-[#121422]/90 to-[#0b0c16]/90 relative overflow-hidden',
        badgeClass: 'bg-white/10'
      };
    case 'dark':
      return {
        containerClass: 'border bg-[#07080e]/95 shadow-2xl relative overflow-hidden',
        badgeClass: 'bg-black/90 border border-zinc-700'
      };
    case 'glowing':
      return {
        containerClass: 'backdrop-blur-md border-2 bg-black/60 relative overflow-hidden transition-all duration-300',
        badgeClass: 'bg-black/50 border border-white/20'
      };
    case 'minimal':
      return {
        containerClass: 'border bg-[#0a0c16]/80 relative overflow-hidden',
        badgeClass: 'bg-zinc-900/80 border border-zinc-700/50'
      };
    default:
      return {
        containerClass: 'backdrop-blur-md border bg-black/60 relative overflow-hidden',
        badgeClass: 'bg-black/50'
      };
  }
}
