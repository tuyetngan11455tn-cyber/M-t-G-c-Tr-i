import React, { useMemo } from 'react';
import { GlobalSiteTheme } from '../types';

interface BackgroundEffectsProps {
  theme?: GlobalSiteTheme;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ theme = 'normal' }) => {
  // Generate theme-specific ambient floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      let color = '#f472b6';
      let shape = 'circle';
      
      if (theme === 'tet') {
        color = i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#f59e0b' : '#fb923c';
      } else if (theme === 'noel') {
        color = i % 3 === 0 ? '#f8fafc' : i % 3 === 1 ? '#10b981' : '#fbbf24';
      } else if (theme === 'trung_thu') {
        color = i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#a855f7' : '#818cf8';
      } else {
        // normal
        color = i % 4 === 0 ? '#f472b6' : i % 4 === 1 ? '#38bdf8' : i % 4 === 2 ? '#fef08a' : '#fed7aa';
      }

      return {
        id: i,
        left: `${(i * 13.7) % 100}%`,
        top: `${(i * 19.3) % 100}%`,
        size: `${2 + (i % 3) * 1.5}px`,
        color,
        delay: `${(i * 0.35) % 5}s`,
        duration: `${5 + (i % 4) * 2}s`
      };
    });
  }, [theme]);

  // Dynamic Theme Gradients
  const themeGradients = useMemo(() => {
    switch (theme) {
      case 'tet':
        return {
          blob1: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, rgba(245, 158, 11, 0.08) 60%, transparent 100%)',
          blob2: 'radial-gradient(circle, rgba(251, 146, 60, 0.2) 0%, rgba(220, 38, 38, 0.08) 60%, transparent 100%)',
          blob3: 'radial-gradient(circle, rgba(254, 240, 138, 0.15) 0%, transparent 100%)',
          baseBg: '#090506'
        };
      case 'noel':
        return {
          blob1: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(225, 29, 72, 0.08) 60%, transparent 100%)',
          blob2: 'radial-gradient(circle, rgba(248, 250, 252, 0.15) 0%, rgba(59, 130, 246, 0.08) 60%, transparent 100%)',
          blob3: 'radial-gradient(circle, rgba(251, 191, 36, 0.14) 0%, transparent 100%)',
          baseBg: '#050a0a'
        };
      case 'trung_thu':
        return {
          blob1: 'radial-gradient(circle, rgba(67, 56, 202, 0.25) 0%, rgba(139, 92, 246, 0.1) 60%, transparent 100%)',
          blob2: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(99, 102, 241, 0.08) 60%, transparent 100%)',
          blob3: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 100%)',
          baseBg: '#05060f'
        };
      case 'normal':
      default:
        return {
          blob1: 'radial-gradient(circle, rgba(244, 114, 182, 0.18) 0%, rgba(56, 189, 248, 0.08) 60%, transparent 100%)',
          blob2: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(254, 215, 170, 0.08) 60%, transparent 100%)',
          blob3: 'radial-gradient(circle, rgba(254, 243, 199, 0.12) 0%, transparent 100%)',
          baseBg: '#06070e'
        };
    }
  }, [theme]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-colors duration-700"
      style={{ backgroundColor: themeGradients.baseBg }}
    >
      {/* Dynamic ambient color gradients */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-80 animate-pulse transition-all duration-700"
        style={{
          background: themeGradients.blob1,
          animationDuration: '12s'
        }}
      />
      <div 
        className="absolute top-[20%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[140px] opacity-75 transition-all duration-700"
        style={{
          background: themeGradients.blob2,
        }}
      />
      <div 
        className="absolute bottom-[-15%] left-[25%] w-[65vw] h-[65vw] rounded-full blur-[150px] opacity-70 animate-pulse transition-all duration-700"
        style={{
          background: themeGradients.blob3,
          animationDuration: '14s'
        }}
      />

      {/* Subtle organic cloud texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Floating theme particles (petals / snowflakes / stardust) */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="floating-dot absolute rounded-full opacity-60"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
    </div>
  );
};
