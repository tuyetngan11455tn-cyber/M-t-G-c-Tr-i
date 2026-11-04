import { AdminAccountInfo } from '../types';

const ACCOUNT_KEY = 'kho_char_admin_account';
const SESSION_KEY = 'kho_char_admin_session';

export interface StoredAdminAccount {
  id: string;
  email: string;
  passwordHash?: string;
  role: 'admin';
  status: 'active';
  createdAt: string;
  lastLogin?: string;
}

export interface AdminSession {
  email: string;
  isLoggedIn: boolean;
  loggedAt: string;
}

// Compute standard SHA-256 hash using native Web Crypto
async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.trim() + '::kho_char_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for older environments
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

// Default initial admin from owner config if none in localStorage yet
const DEFAULT_EXISTING_ADMIN: StoredAdminAccount = {
  id: 'usr_admin_01',
  email: 'tuyetngan11455tn@gmail.com',
  role: 'admin',
  status: 'active',
  createdAt: new Date().toISOString()
};

/**
 * Get current configured sole Admin account
 */
export function getStoredAdminAccount(): StoredAdminAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed as StoredAdminAccount;
      }
    }
  } catch (e) {
    console.warn('Error reading admin account from storage:', e);
  }

  // Fallback: If project had an existing configured admin, keep it
  if (DEFAULT_EXISTING_ADMIN) {
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(DEFAULT_EXISTING_ADMIN));
    } catch {
      // Ignore quota error
    }
    return DEFAULT_EXISTING_ADMIN;
  }

  return null;
}

/**
 * Check if the sole Admin account is already configured
 */
export function isSystemAdminConfigured(): boolean {
  const account = getStoredAdminAccount();
  return Boolean(account && account.email);
}

/**
 * Get active Admin session (persistent across reloads)
 */
export function getActiveAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed && parsed.isLoggedIn && parsed.email) {
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading admin session:', e);
  }
  return null;
}

export const getAdminSession = getActiveAdminSession;

/**
 * Get detailed Admin Account Info for Dashboard
 */
export function getAdminAccountDetails(): AdminAccountInfo {
  const account = getStoredAdminAccount();
  const session = getActiveAdminSession();
  return {
    id: account?.id || 'usr_admin_01',
    email: account?.email || session?.email || 'admin@khochar.vn',
    role: 'admin',
    status: 'active',
    lastLogin: account?.lastLogin || session?.loggedAt || new Date().toISOString(),
    totalAdminAccounts: 1
  };
}

/**
 * Setup first and ONLY Admin account (locks permanently after creation)
 */
export async function setupFirstAdmin(email: string, password: string): Promise<StoredAdminAccount> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Vui lòng cung cấp địa chỉ Email hợp lệ.');
  }

  if (!password || password.trim().length < 6) {
    throw new Error('Mật khẩu Admin cần ít nhất 6 ký tự.');
  }

  const existing = getStoredAdminAccount();
  if (existing && existing.passwordHash) {
    throw new Error('Hệ thống đã có tài khoản Admin duy nhất. Không thể tạo thêm.');
  }

  const hashed = await hashPassword(password);
  const newAccount: StoredAdminAccount = {
    id: existing?.id || 'usr_admin_' + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
    passwordHash: hashed,
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(newAccount));

  // Automatically activate persistent session
  const session: AdminSession = {
    email: cleanEmail,
    isLoggedIn: true,
    loggedAt: new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return newAccount;
}

/**
 * Login to sole Admin account
 */
export async function loginSoleAdmin(email: string, password: string): Promise<StoredAdminAccount> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
  }

  const account = getStoredAdminAccount();
  if (!account) {
    throw new Error('Hệ thống chưa có tài khoản Admin. Vui lòng thiết lập trước.');
  }

  // Strict check: only configured Admin email is permitted
  if (cleanEmail !== account.email.toLowerCase()) {
    throw new Error('Email hoặc mật khẩu không chính xác hoặc tài khoản không có quyền Admin.');
  }

  const enteredHash = await hashPassword(password);

  // If passwordHash was already saved, verify it strictly
  if (account.passwordHash) {
    if (enteredHash !== account.passwordHash) {
      throw new Error('Email hoặc mật khẩu không chính xác hoặc tài khoản không có quyền Admin.');
    }
  } else {
    // If account was pre-seeded without passwordHash, lock in the password chosen by the user
    account.passwordHash = enteredHash;
  }

  // Update lastLogin
  account.lastLogin = new Date().toISOString();
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));

  // Save persistent session (keeps logged in on reload)
  const session: AdminSession = {
    email: account.email,
    isLoggedIn: true,
    loggedAt: account.lastLogin
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return account;
}

/**
 * Logout Admin (clears session, keeps admin account intact)
 */
export function logoutSoleAdmin(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('Error clearing session:', e);
  }
}
