import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import type { Character } from './src/types.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Support large image payloads in base64
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Data directory setup
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CHARACTERS_FILE = path.join(DATA_DIR, 'characters.json');
const OWNER_FILE = path.join(DATA_DIR, 'owner.json');
const SITE_CONFIG_FILE = path.join(DATA_DIR, 'site_config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded assets
app.use('/uploads', express.static(UPLOADS_DIR));

// Ensure empty database exists without sample/demo characters (STRICT RULE #3, #17, #21)
if (!fs.existsSync(CHARACTERS_FILE)) {
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

interface OwnerConfig {
  id: string;
  isConfigured: boolean;
  email: string;
  role: 'admin';
  status: 'active' | 'suspended';
  passwordHash: string;
  salt: string;
  jwtSecret: string;
  lastLogin?: string;
  createdAt?: string;
}

interface SessionRecord {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

function getOwnerConfig(): OwnerConfig {
  const defaultOwnerId = 'usr_admin_01';
  if (!fs.existsSync(OWNER_FILE)) {
    const freshConfig: OwnerConfig = {
      id: defaultOwnerId,
      isConfigured: false,
      email: '',
      role: 'admin',
      status: 'active',
      passwordHash: '',
      salt: '',
      jwtSecret: crypto.randomBytes(32).toString('hex'),
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(OWNER_FILE, JSON.stringify(freshConfig, null, 2), 'utf-8');
    return freshConfig;
  }
  try {
    const raw = fs.readFileSync(OWNER_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id || defaultOwnerId,
      isConfigured: Boolean(parsed.isConfigured),
      email: parsed.email || '',
      role: 'admin',
      status: parsed.status || 'active',
      passwordHash: parsed.passwordHash || '',
      salt: parsed.salt || '',
      jwtSecret: parsed.jwtSecret || crypto.randomBytes(32).toString('hex'),
      lastLogin: parsed.lastLogin,
      createdAt: parsed.createdAt || new Date().toISOString()
    };
  } catch {
    const freshConfig: OwnerConfig = {
      id: defaultOwnerId,
      isConfigured: false,
      email: '',
      role: 'admin',
      status: 'active',
      passwordHash: '',
      salt: '',
      jwtSecret: crypto.randomBytes(32).toString('hex'),
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(OWNER_FILE, JSON.stringify(freshConfig, null, 2), 'utf-8');
    return freshConfig;
  }
}

function saveOwnerConfig(config: OwnerConfig): void {
  fs.writeFileSync(OWNER_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

// Persistent session management (survives app reloads and restarts)
function readSessions(): SessionRecord[] {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const list: SessionRecord[] = JSON.parse(raw);
    const now = Date.now();
    return Array.isArray(list) ? list.filter(s => s && s.token && s.expiresAt > now) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: SessionRecord[]): void {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving sessions:', err);
  }
}

function createSessionToken(email: string, secret: string): string {
  const token = crypto.randomBytes(32).toString('hex') + '.' + Date.now();
  const signature = crypto.createHmac('sha256', secret).update(token).digest('hex');
  const fullToken = `${token}.${signature}`;
  
  const sessions = readSessions();
  // 30 days lifetime for admin session
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  sessions.push({
    token: fullToken,
    email: email.toLowerCase(),
    createdAt: Date.now(),
    expiresAt: Date.now() + thirtyDaysMs
  });
  saveSessions(sessions);
  return fullToken;
}

function verifySessionToken(token: string, secret: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (signature !== expectedSignature) return false;

  const sessions = readSessions();
  const session = sessions.find(s => s.token === token);
  return Boolean(session && session.expiresAt > Date.now());
}

function invalidateSessionToken(token: string): void {
  const sessions = readSessions();
  const updated = sessions.filter(s => s.token !== token);
  saveSessions(updated);
}

// Helper to read and write characters safely
function readCharacters(): Character[] {
  try {
    const raw = fs.readFileSync(CHARACTERS_FILE, 'utf-8');
    return JSON.parse(raw) as Character[];
  } catch (err) {
    console.error('Error reading characters file:', err);
    return [];
  }
}

function saveCharacters(characters: Character[]): void {
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2), 'utf-8');
}

// --- SITE CONFIG API ROUTES (Persistent Website Avatar, Cover, Theme) ---
app.get('/api/site-config', (_req: Request, res: Response) => {
  if (fs.existsSync(SITE_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SITE_CONFIG_FILE, 'utf-8'));
      res.json(data);
      return;
    } catch (err) {
      console.error('Error reading site config:', err);
    }
  }
  res.json(null);
});

app.post('/api/site-config', (req: Request, res: Response) => {
  try {
    const config = req.body;
    if (!config || typeof config !== 'object') {
      res.status(400).json({ error: 'Dữ liệu cấu hình không hợp lệ.' });
      return;
    }
    // Block temporary blob URLs from being persisted
    if (typeof config.avatar === 'string' && config.avatar.startsWith('blob:')) {
      delete config.avatar;
    }
    if (typeof config.cover === 'string' && config.cover.startsWith('blob:')) {
      delete config.cover;
    }
    fs.writeFileSync(SITE_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    res.json({ success: true, config });
  } catch (err) {
    console.error('Error saving site config:', err);
    res.status(500).json({ error: 'Lỗi khi lưu cấu hình website vào máy chủ.' });
  }
});

// 1. Upload Image (Avatar or Cover)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { data, filename } = req.body;
    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Dữ liệu ảnh không hợp lệ.' });
      return;
    }

    // Parse base64
    const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Định dạng base64 không đúng.' });
      return;
    }

    const mimeType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, 'base64');

    let ext = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('gif')) ext = '.gif';

    const safeFilename = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);
    res.json({
      url: `/uploads/${safeFilename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Lỗi khi lưu ảnh máy chủ.' });
  }
});

// Helper to generate aesthetic character artwork when free tier quota limit is 0
function generateProceduralCharacterArt(prompt: string, aspectRatio: '1:1' | '16:9', style?: string): string {
  const isWide = aspectRatio === '16:9';
  const width = isWide ? 1280 : 800;
  const height = isWide ? 720 : 800;

  // Derive stable colors from prompt
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    { bg1: '#090514', bg2: '#1b0d36', accent1: '#a855f7', accent2: '#ec4899', glow: '#c084fc' },
    { bg1: '#040d1a', bg2: '#0b2342', accent1: '#06b6d4', accent2: '#3b82f6', glow: '#67e8f9' },
    { bg1: '#140509', bg2: '#360d1b', accent1: '#f43f5e', accent2: '#fb923c', glow: '#fda4af' },
    { bg1: '#05140d', bg2: '#0d3622', accent1: '#10b981', accent2: '#14b8a6', glow: '#6ee7b7' },
    { bg1: '#141005', bg2: '#362c0d', accent1: '#f59e0b', accent2: '#eab308', glow: '#fde047' }
  ];
  const p = palettes[Math.abs(hash) % palettes.length];
  const cx = width / 2;
  const cy = height / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${p.bg2}" />
      <stop offset="100%" stop-color="${p.bg1}" />
    </radialGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.accent1}" />
      <stop offset="100%" stop-color="${p.accent2}" />
    </linearGradient>
    <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="18" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)" />

  <!-- Grid overlay -->
  <g opacity="0.12" stroke="${p.accent1}" stroke-width="1">
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="${(width / 8) * i}" y1="0" x2="${(width / 8) * i}" y2="${height}" />`).join('')}
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="0" y1="${(height / 8) * i}" x2="${width}" y2="${(height / 8) * i}" />`).join('')}
  </g>

  <!-- Celestial Glow Rings -->
  <circle cx="${cx}" cy="${cy}" r="${isWide ? 220 : 250}" fill="none" stroke="${p.glow}" stroke-width="2" opacity="0.3" filter="url(#glowEffect)" />
  <circle cx="${cx}" cy="${cy}" r="${isWide ? 170 : 190}" fill="none" stroke="url(#primaryGrad)" stroke-width="3" opacity="0.7" stroke-dasharray="12 8" />
  <circle cx="${cx}" cy="${cy}" r="${isWide ? 120 : 140}" fill="${p.bg2}" stroke="${p.accent1}" stroke-width="1.5" opacity="0.85" />

  <!-- Silhouette / Hero Emblem -->
  <g transform="translate(${cx - 70}, ${cy - 85})" fill="url(#primaryGrad)" filter="url(#glowEffect)">
    <!-- Stylized Hooded Character Silhouette -->
    <path d="M 70 20 C 50 20, 35 38, 35 65 C 35 90, 48 110, 52 135 L 88 135 C 92 110, 105 90, 105 65 C 105 38, 90 20, 70 20 Z" />
    <!-- Shoulders & Coat -->
    <path d="M 20 145 C 35 125, 55 120, 70 120 C 85 120, 105 125, 120 145 L 135 180 C 105 185, 35 185, 5 180 Z" opacity="0.9" />
    <!-- Glowing Visor / Eyes -->
    <ellipse cx="60" cy="65" rx="5" ry="2.5" fill="#ffffff" filter="url(#glowEffect)" />
    <ellipse cx="80" cy="65" rx="5" ry="2.5" fill="#ffffff" filter="url(#glowEffect)" />
  </g>

  <!-- Floating Sparkles -->
  <circle cx="${cx - 150}" cy="${cy - 100}" r="2.5" fill="${p.glow}" opacity="0.8" />
  <circle cx="${cx + 170}" cy="${cy - 80}" r="3" fill="#ffffff" opacity="0.9" />
  <circle cx="${cx - 120}" cy="${cy + 130}" r="2" fill="${p.accent2}" opacity="0.7" />
  <circle cx="${cx + 140}" cy="${cy + 110}" r="2.5" fill="${p.accent1}" opacity="0.8" />

  <!-- Character Banner Badge -->
  <rect x="${cx - 160}" y="${height - 75}" width="320" height="42" rx="21" fill="#080b14" stroke="${p.accent1}" stroke-width="1.5" opacity="0.95" />
  <text x="${cx}" y="${height - 49}" text-anchor="middle" font-family="Cinzel, sans-serif" font-size="13" font-weight="bold" fill="#ffffff" letter-spacing="2">
    ${style ? style.toUpperCase() : 'AI CHARACTER ART'}
  </text>
</svg>`;
}

// 2. AI Character Image Generator (Imagen / Gemini Flash Image)
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio, style } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Vui lòng cung cấp mô tả (prompt) cho nhân vật.' });
      return;
    }

    const targetRatio: '1:1' | '16:9' = aspectRatio === '16:9' ? '16:9' : '1:1';
    let base64Data: string | null = null;
    let mimeType = 'image/png';
    let isAIModel = false;

    // Build enriched prompt for maximum artistic character quality
    const fullPrompt = `${prompt.trim()}${style ? `, art style: ${style}` : ''}, master character illustration, cinematic lighting, sharp focus, 8k resolution, elegant composition, trending on artstation`;

    // Try Google GenAI Image Models
    const modelsToTry = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: fullPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: targetRatio,
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
        if (part?.inlineData?.data) {
          base64Data = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          isAIModel = true;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} note:`, err.message?.substring(0, 100));
      }
    }

    // If quota is exhausted on free tier, generate high-res stylized vector art so the user is never blocked
    if (!base64Data) {
      const safeFilename = `char_art_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.svg`;
      const filePath = path.join(UPLOADS_DIR, safeFilename);
      const svgContent = generateProceduralCharacterArt(prompt, targetRatio, style);
      fs.writeFileSync(filePath, svgContent, 'utf-8');

      res.json({
        url: `/uploads/${safeFilename}`,
        isAIModel: false,
        quotaNotice: true,
        message: 'Đã tạo hình ảnh minh họa độc quyền cho nhân vật.'
      });
      return;
    }

    // Save AI generated image to uploads directory
    let ext = '.png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
    else if (mimeType.includes('webp')) ext = '.webp';

    const safeFilename = `ai_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    res.json({
      url: `/uploads/${safeFilename}`,
      isAIModel: true,
      quotaNotice: false,
      message: 'Tạo hình ảnh nhân vật bằng AI thành công!'
    });
  } catch (error: any) {
    console.error('AI image generation error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo hình ảnh AI' });
  }
});

// 3. Get Characters
// scope === 'admin' returns all characters (both published, draft, and hidden).
// default public scope returns ONLY published === true and not drafts.
app.get('/api/characters', (req: Request, res: Response) => {
  const allChars = readCharacters();
  const scope = req.query.scope;
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.toLowerCase().trim() : '';
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : '';
  const tag = typeof req.query.tag === 'string' ? req.query.tag.toLowerCase().trim() : '';

  let list = scope === 'admin' 
    ? allChars 
    : allChars.filter(c => c.published && !c.isDraft && c.status !== 'draft');

  if (scope === 'admin' && statusFilter) {
    if (statusFilter === 'draft') {
      list = list.filter(c => !c.published || c.isDraft || c.status === 'draft');
    } else if (statusFilter === 'published') {
      list = list.filter(c => c.published && !c.isDraft);
    }
  }

  if (search) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(search) || 
      c.tagline.toLowerCase().includes(search) ||
      (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(search)))
    );
  }

  if (tag && tag !== 'tất cả' && tag !== 'all') {
    list = list.filter(c => Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase() === tag));
  }

  // Sort latest first
  list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  res.json(list);
});

// 4. Get Character by ID
app.get('/api/characters/:id', (req: Request, res: Response) => {
  const allChars = readCharacters();
  const char = allChars.find(c => c.id === req.params.id);

  if (!char) {
    res.status(404).json({ error: 'Không tìm thấy nhân vật này.' });
    return;
  }

  res.json(char);
});

// 5. Create Character (or Draft)
app.post('/api/characters', (req: Request, res: Response) => {
  const {
    name,
    avatar,
    cover,
    tagline,
    story,
    charProfile,
    userProfile,
    profile,
    tags,
    chatLink,
    chatUrl,
    theme,
    sampleDialogues,
    published,
    status,
    isDraft
  } = req.body;

  const isPublishing = Boolean(published);
  const resolvedName = (typeof name === 'string' ? name.trim() : '');

  // If publishing, character must have a name. If saving as draft, fallback to default title
  if (isPublishing && !resolvedName) {
    res.status(400).json({ error: 'Tên nhân vật không được để trống khi xuất bản.' });
    return;
  }

  const finalName = resolvedName || 'Bản nháp chưa đặt tên';

  const defaultTheme = {
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    textColor: '#ffffff',
    glowColor: '#c084fc',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    frameStyle: 'glass',
    borderRadius: '2xl',
    backgroundOpacity: 0.85,
    backgroundStyle: 'gradient',
    glowIntensity: 'medium',
    dialogueDisplay: 'bubble',
    imageFilter: 'none'
  };

  const resolvedChat = (chatLink || chatUrl || '').trim();
  const resolvedProfile = (charProfile || profile || '').trim();
  const normalizedTags = Array.isArray(tags) 
    ? tags.map(t => String(t).trim()).filter(Boolean)
    : [];

  const finalIsDraft = isDraft !== undefined ? Boolean(isDraft) : !isPublishing;
  const finalStatus: 'published' | 'draft' | 'hidden' = status || (isPublishing ? 'published' : 'draft');

  const newChar: Character = {
    id: `char_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    name: finalName,
    avatar: avatar || '',
    cover: cover || '',
    tagline: tagline || '',
    story: story || '',
    charProfile: resolvedProfile,
    profile: resolvedProfile,
    userProfile: userProfile || '',
    tags: normalizedTags,
    chatLink: resolvedChat,
    chatUrl: resolvedChat,
    theme: { ...defaultTheme, ...(theme || {}) },
    sampleDialogues: Array.isArray(sampleDialogues) ? sampleDialogues : [],
    published: isPublishing,
    status: finalStatus,
    isDraft: finalIsDraft,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const characters = readCharacters();
  characters.push(newChar);
  saveCharacters(characters);

  res.status(201).json(newChar);
});

// 6. Update Character (or Draft)
app.put('/api/characters/:id', (req: Request, res: Response) => {
  const characters = readCharacters();
  const index = characters.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Không tìm thấy nhân vật để chỉnh sửa.' });
    return;
  }

  const existing = characters[index];
  const {
    name,
    avatar,
    cover,
    tagline,
    story,
    charProfile,
    userProfile,
    profile,
    tags,
    chatLink,
    chatUrl,
    theme,
    sampleDialogues,
    published,
    status,
    isDraft
  } = req.body;

  const isPublishing = published !== undefined ? Boolean(published) : existing.published;

  if (name !== undefined) {
    const trimmed = name.trim();
    if (isPublishing && !trimmed) {
      res.status(400).json({ error: 'Tên nhân vật không được để trống khi xuất bản.' });
      return;
    }
  }

  const resolvedChat = chatLink !== undefined ? chatLink.trim() : (chatUrl !== undefined ? chatUrl.trim() : (existing.chatLink || existing.chatUrl || ''));
  const resolvedProfile = charProfile !== undefined ? charProfile : (profile !== undefined ? profile : existing.charProfile);
  const normalizedTags = tags !== undefined 
    ? (Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [])
    : (existing.tags || []);

  const finalIsDraft = isDraft !== undefined 
    ? Boolean(isDraft) 
    : (published !== undefined ? !isPublishing : (existing.isDraft ?? !existing.published));

  const finalStatus: 'published' | 'draft' | 'hidden' = status !== undefined 
    ? status 
    : (published !== undefined ? (isPublishing ? 'published' : 'draft') : (existing.status || (existing.published ? 'published' : 'draft')));

  const updatedChar: Character = {
    ...existing,
    name: name !== undefined ? (name.trim() || (isPublishing ? existing.name : 'Bản nháp chưa đặt tên')) : existing.name,
    avatar: avatar !== undefined ? avatar : existing.avatar,
    cover: cover !== undefined ? cover : existing.cover,
    tagline: tagline !== undefined ? tagline : existing.tagline,
    story: story !== undefined ? story : existing.story,
    charProfile: resolvedProfile,
    profile: resolvedProfile,
    userProfile: userProfile !== undefined ? userProfile : existing.userProfile,
    tags: normalizedTags,
    chatLink: resolvedChat,
    chatUrl: resolvedChat,
    theme: theme !== undefined ? { ...existing.theme, ...theme } : existing.theme,
    sampleDialogues: sampleDialogues !== undefined ? sampleDialogues : existing.sampleDialogues,
    published: isPublishing,
    status: finalStatus,
    isDraft: finalIsDraft,
    updatedAt: new Date().toISOString()
  };

  characters[index] = updatedChar;
  saveCharacters(characters);

  res.json(updatedChar);
});

// 7. Toggle Publish Status
app.patch('/api/characters/:id/toggle-publish', (req: Request, res: Response) => {
  const characters = readCharacters();
  const char = characters.find(c => c.id === req.params.id);

  if (!char) {
    res.status(404).json({ error: 'Không tìm thấy nhân vật.' });
    return;
  }

  char.published = !char.published;
  if (char.published) {
    char.status = 'published';
    char.isDraft = false;
  } else {
    char.status = 'hidden';
  }
  char.updatedAt = new Date().toISOString();
  saveCharacters(characters);

  res.json({ success: true, published: char.published, status: char.status });
});

// 8. Delete Character
app.delete('/api/characters/:id', (req: Request, res: Response) => {
  const characters = readCharacters();
  const index = characters.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Không tìm thấy nhân vật để xóa.' });
    return;
  }

  characters.splice(index, 1);
  saveCharacters(characters);

  res.json({ success: true, message: 'Đã xóa nhân vật thành công.' });
});

// Dev and Prod Vite serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
