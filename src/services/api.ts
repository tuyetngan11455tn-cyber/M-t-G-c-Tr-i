import { Character, AdminAccountInfo } from '../types';
import { 
  setupFirstAdmin, 
  loginSoleAdmin, 
  logoutSoleAdmin, 
  getAdminAccountDetails, 
  isSystemAdminConfigured, 
  getActiveAdminSession 
} from './adminAuth';

// Re-export Admin Auth methods
export const setupAdminAccount = setupFirstAdmin;
export const loginAdminAccount = loginSoleAdmin;
export const logoutAdminAccount = logoutSoleAdmin;
export const fetchAdminAccountDetails = async (): Promise<AdminAccountInfo> => getAdminAccountDetails();
export const checkAdminConfigured = isSystemAdminConfigured;
export const getAdminSession = getActiveAdminSession;

// Dummy compatibility methods
export function getStoredOwnerToken(): string | null {
  return null;
}
export function setStoredOwnerToken(_token: string): void {}
export function clearStoredOwnerToken(): void {}

const defaultHeaders = {
  'Content-Type': 'application/json'
};

/**
 * Fetch characters from persistent backend database.
 * If scope === 'admin', fetches all characters (both published & draft).
 * If scope === 'public' (default), fetches only published characters.
 */
export async function fetchCharacters(
  search?: string, 
  tag?: string, 
  scope: 'public' | 'admin' = 'public'
): Promise<Character[]> {
  try {
    const params = new URLSearchParams();
    if (scope === 'admin') {
      params.append('scope', 'admin');
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (tag && tag.trim() && tag.toLowerCase() !== 'tất cả' && tag.toLowerCase() !== 'all') {
      params.append('tag', tag.trim());
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/characters${queryStr}`, {
      headers: defaultHeaders
    });

    if (!res.ok) {
      throw new Error('Lỗi khi tải danh sách nhân vật từ máy chủ');
    }

    const list: Character[] = await res.json();
    
    // Also cache to localStorage as backup
    try {
      if (scope === 'admin') {
        localStorage.setItem('kho_char_backup_admin', JSON.stringify(list));
      }
    } catch {
      // Ignore quota
    }

    return list;
  } catch (err) {
    console.warn('Network fetch characters error, checking offline cache:', err);
    try {
      const backupRaw = localStorage.getItem('kho_char_backup_admin');
      if (backupRaw) {
        const backupList: Character[] = JSON.parse(backupRaw);
        if (scope === 'admin') return backupList;
        return backupList.filter(c => c.published);
      }
    } catch {
      // Ignore
    }
    return [];
  }
}

/**
 * Fetch single character by ID
 */
export async function fetchCharacterById(id: string): Promise<Character> {
  const res = await fetch(`/api/characters/${id}`, {
    headers: defaultHeaders
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Lỗi khi tải thông tin nhân vật');
  }
  return res.json();
}

/**
 * Create a new character (Saves to server persistent JSON)
 */
export async function createCharacter(charData: Partial<Character>): Promise<Character> {
  const res = await fetch('/api/characters', {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(charData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi khi tạo nhân vật');
  }

  try {
    const backupRaw = localStorage.getItem('kho_char_backup_admin');
    const list: Character[] = backupRaw ? JSON.parse(backupRaw) : [];
    list.unshift(data);
    localStorage.setItem('kho_char_backup_admin', JSON.stringify(list));
  } catch {}

  return data;
}

/**
 * Update character details (Saves to server persistent JSON)
 */
export async function updateCharacter(id: string, charData: Partial<Character>): Promise<Character> {
  const res = await fetch(`/api/characters/${id}`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(charData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi khi cập nhật nhân vật');
  }

  try {
    const backupRaw = localStorage.getItem('kho_char_backup_admin');
    if (backupRaw) {
      const list: Character[] = JSON.parse(backupRaw);
      const idx = list.findIndex(c => c.id === id);
      if (idx !== -1) {
        list[idx] = data;
        localStorage.setItem('kho_char_backup_admin', JSON.stringify(list));
      }
    }
  } catch {}

  return data;
}

/**
 * Toggle publish/unpublish status
 */
export async function togglePublishCharacter(id: string): Promise<{ success: boolean; published: boolean }> {
  const res = await fetch(`/api/characters/${id}/toggle-publish`, {
    method: 'PATCH',
    headers: defaultHeaders
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi khi thay đổi trạng thái');
  }

  try {
    const backupRaw = localStorage.getItem('kho_char_backup_admin');
    if (backupRaw) {
      const list: Character[] = JSON.parse(backupRaw);
      const target = list.find(c => c.id === id);
      if (target) {
        target.published = data.published;
        localStorage.setItem('kho_char_backup_admin', JSON.stringify(list));
      }
    }
  } catch {}

  return data;
}

/**
 * Delete character permanently
 */
export async function deleteCharacter(id: string): Promise<void> {
  const res = await fetch(`/api/characters/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Lỗi khi xóa nhân vật');
  }

  // Ensure deleted character is immediately and permanently removed from local cache
  try {
    const backupRaw = localStorage.getItem('kho_char_backup_admin');
    if (backupRaw) {
      const list: Character[] = JSON.parse(backupRaw);
      const filtered = list.filter(c => c.id !== id);
      localStorage.setItem('kho_char_backup_admin', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Could not update backup cache:', e);
  }
}

/**
 * Upload image asset
 */
export async function uploadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({
            data: base64Data,
            filename: file.name
          })
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Lỗi khi tải ảnh lên máy chủ');
        }
        resolve(json.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh'));
    reader.readAsDataURL(file);
  });
}

export interface GenerateAIImageResult {
  url: string;
  isAIModel: boolean;
  quotaNotice: boolean;
  message: string;
}

/**
 * Generate AI image illustration
 */
export async function generateAIImage(
  prompt: string, 
  aspectRatio: '1:1' | '16:9' = '1:1',
  style?: string
): Promise<GenerateAIImageResult> {
  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      prompt,
      aspectRatio,
      style
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Lỗi khi tạo hình ảnh AI');
  }

  return data;
}
