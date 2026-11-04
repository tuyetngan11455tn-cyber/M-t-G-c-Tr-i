import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
const isProd = process.env.NODE_ENV === "production";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const CHARACTERS_FILE = path.join(DATA_DIR, "characters.json");
const OWNER_FILE = path.join(DATA_DIR, "owner.json");
const SITE_CONFIG_FILE = path.join(DATA_DIR, "site_config.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));
if (!fs.existsSync(CHARACTERS_FILE)) {
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify([], null, 2), "utf-8");
}
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
}
function getOwnerConfig() {
  const defaultOwnerId = "usr_admin_01";
  if (!fs.existsSync(OWNER_FILE)) {
    const freshConfig = {
      id: defaultOwnerId,
      isConfigured: false,
      email: "",
      role: "admin",
      status: "active",
      passwordHash: "",
      salt: "",
      jwtSecret: crypto.randomBytes(32).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    fs.writeFileSync(OWNER_FILE, JSON.stringify(freshConfig, null, 2), "utf-8");
    return freshConfig;
  }
  try {
    const raw = fs.readFileSync(OWNER_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id || defaultOwnerId,
      isConfigured: Boolean(parsed.isConfigured),
      email: parsed.email || "",
      role: "admin",
      status: parsed.status || "active",
      passwordHash: parsed.passwordHash || "",
      salt: parsed.salt || "",
      jwtSecret: parsed.jwtSecret || crypto.randomBytes(32).toString("hex"),
      lastLogin: parsed.lastLogin,
      createdAt: parsed.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    const freshConfig = {
      id: defaultOwnerId,
      isConfigured: false,
      email: "",
      role: "admin",
      status: "active",
      passwordHash: "",
      salt: "",
      jwtSecret: crypto.randomBytes(32).toString("hex"),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    fs.writeFileSync(OWNER_FILE, JSON.stringify(freshConfig, null, 2), "utf-8");
    return freshConfig;
  }
}
function saveOwnerConfig(config) {
  fs.writeFileSync(OWNER_FILE, JSON.stringify(config, null, 2), "utf-8");
}
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
}
function readSessions() {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
    const list = JSON.parse(raw);
    const now = Date.now();
    return Array.isArray(list) ? list.filter((s) => s && s.token && s.expiresAt > now) : [];
  } catch {
    return [];
  }
}
function saveSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving sessions:", err);
  }
}
function createSessionToken(email, secret) {
  const token = crypto.randomBytes(32).toString("hex") + "." + Date.now();
  const signature = crypto.createHmac("sha256", secret).update(token).digest("hex");
  const fullToken = `${token}.${signature}`;
  const sessions = readSessions();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1e3;
  sessions.push({
    token: fullToken,
    email: email.toLowerCase(),
    createdAt: Date.now(),
    expiresAt: Date.now() + thirtyDaysMs
  });
  saveSessions(sessions);
  return fullToken;
}
function verifySessionToken(token, secret) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (signature !== expectedSignature) return false;
  const sessions = readSessions();
  const session = sessions.find((s) => s.token === token);
  return Boolean(session && session.expiresAt > Date.now());
}
function invalidateSessionToken(token) {
  const sessions = readSessions();
  const updated = sessions.filter((s) => s.token !== token);
  saveSessions(updated);
}
function readCharacters() {
  try {
    const raw = fs.readFileSync(CHARACTERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading characters file:", err);
    return [];
  }
}
function saveCharacters(characters) {
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2), "utf-8");
}
app.get("/api/site-config", (_req, res) => {
  if (fs.existsSync(SITE_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SITE_CONFIG_FILE, "utf-8"));
      res.json(data);
      return;
    } catch (err) {
      console.error("Error reading site config:", err);
    }
  }
  res.json(null);
});
app.post("/api/site-config", (req, res) => {
  try {
    const config = req.body;
    if (!config || typeof config !== "object") {
      res.status(400).json({ error: "D\u1EEF li\u1EC7u c\u1EA5u h\xECnh kh\xF4ng h\u1EE3p l\u1EC7." });
      return;
    }
    if (typeof config.avatar === "string" && config.avatar.startsWith("blob:")) {
      delete config.avatar;
    }
    if (typeof config.cover === "string" && config.cover.startsWith("blob:")) {
      delete config.cover;
    }
    fs.writeFileSync(SITE_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    res.json({ success: true, config });
  } catch (err) {
    console.error("Error saving site config:", err);
    res.status(500).json({ error: "L\u1ED7i khi l\u01B0u c\u1EA5u h\xECnh website v\xE0o m\xE1y ch\u1EE7." });
  }
});
app.post("/api/upload", (req, res) => {
  try {
    const { data, filename } = req.body;
    if (!data || typeof data !== "string") {
      res.status(400).json({ error: "D\u1EEF li\u1EC7u \u1EA3nh kh\xF4ng h\u1EE3p l\u1EC7." });
      return;
    }
    const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: "\u0110\u1ECBnh d\u1EA1ng base64 kh\xF4ng \u0111\xFAng." });
      return;
    }
    const mimeType = matches[1];
    const base64Content = matches[2];
    const buffer = Buffer.from(base64Content, "base64");
    let ext = ".png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = ".jpg";
    else if (mimeType.includes("webp")) ext = ".webp";
    else if (mimeType.includes("gif")) ext = ".gif";
    const safeFilename = `img_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    fs.writeFileSync(filePath, buffer);
    res.json({
      url: `/uploads/${safeFilename}`
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "L\u1ED7i khi l\u01B0u \u1EA3nh m\xE1y ch\u1EE7." });
  }
});
function generateProceduralCharacterArt(prompt, aspectRatio, style) {
  const isWide = aspectRatio === "16:9";
  const width = isWide ? 1280 : 800;
  const height = isWide ? 720 : 800;
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    { bg1: "#090514", bg2: "#1b0d36", accent1: "#a855f7", accent2: "#ec4899", glow: "#c084fc" },
    { bg1: "#040d1a", bg2: "#0b2342", accent1: "#06b6d4", accent2: "#3b82f6", glow: "#67e8f9" },
    { bg1: "#140509", bg2: "#360d1b", accent1: "#f43f5e", accent2: "#fb923c", glow: "#fda4af" },
    { bg1: "#05140d", bg2: "#0d3622", accent1: "#10b981", accent2: "#14b8a6", glow: "#6ee7b7" },
    { bg1: "#141005", bg2: "#362c0d", accent1: "#f59e0b", accent2: "#eab308", glow: "#fde047" }
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
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="${width / 8 * i}" y1="0" x2="${width / 8 * i}" y2="${height}" />`).join("")}
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="0" y1="${height / 8 * i}" x2="${width}" y2="${height / 8 * i}" />`).join("")}
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
    ${style ? style.toUpperCase() : "AI CHARACTER ART"}
  </text>
</svg>`;
}
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio, style } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ error: "Vui l\xF2ng cung c\u1EA5p m\xF4 t\u1EA3 (prompt) cho nh\xE2n v\u1EADt." });
      return;
    }
    const targetRatio = aspectRatio === "16:9" ? "16:9" : "1:1";
    let base64Data = null;
    let mimeType = "image/png";
    let isAIModel = false;
    const fullPrompt = `${prompt.trim()}${style ? `, art style: ${style}` : ""}, master character illustration, cinematic lighting, sharp focus, 8k resolution, elegant composition, trending on artstation`;
    const modelsToTry = ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];
    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [{ text: fullPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: targetRatio
            }
          }
        });
        const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
        if (part?.inlineData?.data) {
          base64Data = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
          isAIModel = true;
          break;
        }
      } catch (err) {
        console.warn(`Model ${modelName} note:`, err.message?.substring(0, 100));
      }
    }
    if (!base64Data) {
      const safeFilename2 = `char_art_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.svg`;
      const filePath2 = path.join(UPLOADS_DIR, safeFilename2);
      const svgContent = generateProceduralCharacterArt(prompt, targetRatio, style);
      fs.writeFileSync(filePath2, svgContent, "utf-8");
      res.json({
        url: `/uploads/${safeFilename2}`,
        isAIModel: false,
        quotaNotice: true,
        message: "\u0110\xE3 t\u1EA1o h\xECnh \u1EA3nh minh h\u1ECDa \u0111\u1ED9c quy\u1EC1n cho nh\xE2n v\u1EADt."
      });
      return;
    }
    let ext = ".png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = ".jpg";
    else if (mimeType.includes("webp")) ext = ".webp";
    const safeFilename = `ai_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filePath, buffer);
    res.json({
      url: `/uploads/${safeFilename}`,
      isAIModel: true,
      quotaNotice: false,
      message: "T\u1EA1o h\xECnh \u1EA3nh nh\xE2n v\u1EADt b\u1EB1ng AI th\xE0nh c\xF4ng!"
    });
  } catch (error) {
    console.error("AI image generation error:", error);
    res.status(500).json({ error: error.message || "L\u1ED7i khi t\u1EA1o h\xECnh \u1EA3nh AI" });
  }
});
app.get("/api/characters", (req, res) => {
  const allChars = readCharacters();
  const scope = req.query.scope;
  const statusFilter = typeof req.query.status === "string" ? req.query.status.toLowerCase().trim() : "";
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase().trim() : "";
  const tag = typeof req.query.tag === "string" ? req.query.tag.toLowerCase().trim() : "";
  let list = scope === "admin" ? allChars : allChars.filter((c) => c.published && !c.isDraft && c.status !== "draft");
  if (scope === "admin" && statusFilter) {
    if (statusFilter === "draft") {
      list = list.filter((c) => !c.published || c.isDraft || c.status === "draft");
    } else if (statusFilter === "published") {
      list = list.filter((c) => c.published && !c.isDraft);
    }
  }
  if (search) {
    list = list.filter(
      (c) => c.name.toLowerCase().includes(search) || c.tagline.toLowerCase().includes(search) || Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase().includes(search))
    );
  }
  if (tag && tag !== "t\u1EA5t c\u1EA3" && tag !== "all") {
    list = list.filter((c) => Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase() === tag));
  }
  list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  res.json(list);
});
app.get("/api/characters/:id", (req, res) => {
  const allChars = readCharacters();
  const char = allChars.find((c) => c.id === req.params.id);
  if (!char) {
    res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nh\xE2n v\u1EADt n\xE0y." });
    return;
  }
  res.json(char);
});
app.post("/api/characters", (req, res) => {
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
  const resolvedName = typeof name === "string" ? name.trim() : "";
  if (isPublishing && !resolvedName) {
    res.status(400).json({ error: "T\xEAn nh\xE2n v\u1EADt kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng khi xu\u1EA5t b\u1EA3n." });
    return;
  }
  const finalName = resolvedName || "B\u1EA3n nh\xE1p ch\u01B0a \u0111\u1EB7t t\xEAn";
  const defaultTheme = {
    primaryColor: "#a855f7",
    secondaryColor: "#ec4899",
    textColor: "#ffffff",
    glowColor: "#c084fc",
    borderColor: "rgba(168, 85, 247, 0.4)",
    frameStyle: "glass",
    borderRadius: "2xl",
    backgroundOpacity: 0.85,
    backgroundStyle: "gradient",
    glowIntensity: "medium",
    dialogueDisplay: "bubble",
    imageFilter: "none"
  };
  const resolvedChat = (chatLink || chatUrl || "").trim();
  const resolvedProfile = (charProfile || profile || "").trim();
  const normalizedTags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];
  const finalIsDraft = isDraft !== void 0 ? Boolean(isDraft) : !isPublishing;
  const finalStatus = status || (isPublishing ? "published" : "draft");
  const newChar = {
    id: `char_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    name: finalName,
    avatar: avatar || "",
    cover: cover || "",
    tagline: tagline || "",
    story: story || "",
    charProfile: resolvedProfile,
    profile: resolvedProfile,
    userProfile: userProfile || "",
    tags: normalizedTags,
    chatLink: resolvedChat,
    chatUrl: resolvedChat,
    theme: { ...defaultTheme, ...theme || {} },
    sampleDialogues: Array.isArray(sampleDialogues) ? sampleDialogues : [],
    published: isPublishing,
    status: finalStatus,
    isDraft: finalIsDraft,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const characters = readCharacters();
  characters.push(newChar);
  saveCharacters(characters);
  res.status(201).json(newChar);
});
app.put("/api/characters/:id", (req, res) => {
  const characters = readCharacters();
  const index = characters.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nh\xE2n v\u1EADt \u0111\u1EC3 ch\u1EC9nh s\u1EEDa." });
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
  const isPublishing = published !== void 0 ? Boolean(published) : existing.published;
  if (name !== void 0) {
    const trimmed = name.trim();
    if (isPublishing && !trimmed) {
      res.status(400).json({ error: "T\xEAn nh\xE2n v\u1EADt kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng khi xu\u1EA5t b\u1EA3n." });
      return;
    }
  }
  const resolvedChat = chatLink !== void 0 ? chatLink.trim() : chatUrl !== void 0 ? chatUrl.trim() : existing.chatLink || existing.chatUrl || "";
  const resolvedProfile = charProfile !== void 0 ? charProfile : profile !== void 0 ? profile : existing.charProfile;
  const normalizedTags = tags !== void 0 ? Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [] : existing.tags || [];
  const finalIsDraft = isDraft !== void 0 ? Boolean(isDraft) : published !== void 0 ? !isPublishing : existing.isDraft ?? !existing.published;
  const finalStatus = status !== void 0 ? status : published !== void 0 ? isPublishing ? "published" : "draft" : existing.status || (existing.published ? "published" : "draft");
  const updatedChar = {
    ...existing,
    name: name !== void 0 ? name.trim() || (isPublishing ? existing.name : "B\u1EA3n nh\xE1p ch\u01B0a \u0111\u1EB7t t\xEAn") : existing.name,
    avatar: avatar !== void 0 ? avatar : existing.avatar,
    cover: cover !== void 0 ? cover : existing.cover,
    tagline: tagline !== void 0 ? tagline : existing.tagline,
    story: story !== void 0 ? story : existing.story,
    charProfile: resolvedProfile,
    profile: resolvedProfile,
    userProfile: userProfile !== void 0 ? userProfile : existing.userProfile,
    tags: normalizedTags,
    chatLink: resolvedChat,
    chatUrl: resolvedChat,
    theme: theme !== void 0 ? { ...existing.theme, ...theme } : existing.theme,
    sampleDialogues: sampleDialogues !== void 0 ? sampleDialogues : existing.sampleDialogues,
    published: isPublishing,
    status: finalStatus,
    isDraft: finalIsDraft,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  characters[index] = updatedChar;
  saveCharacters(characters);
  res.json(updatedChar);
});
app.patch("/api/characters/:id/toggle-publish", (req, res) => {
  const characters = readCharacters();
  const char = characters.find((c) => c.id === req.params.id);
  if (!char) {
    res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nh\xE2n v\u1EADt." });
    return;
  }
  char.published = !char.published;
  if (char.published) {
    char.status = "published";
    char.isDraft = false;
  } else {
    char.status = "hidden";
  }
  char.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  saveCharacters(characters);
  res.json({ success: true, published: char.published, status: char.status });
});
app.delete("/api/characters/:id", (req, res) => {
  const characters = readCharacters();
  const index = characters.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y nh\xE2n v\u1EADt \u0111\u1EC3 x\xF3a." });
    return;
  }
  characters.splice(index, 1);
  saveCharacters(characters);
  res.json({ success: true, message: "\u0110\xE3 x\xF3a nh\xE2n v\u1EADt th\xE0nh c\xF4ng." });
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (${isProd ? "production" : "development"})`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
