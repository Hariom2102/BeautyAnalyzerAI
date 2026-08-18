/**
 * Admin Panel Component - Captured Photo Feed & Database Manager
 */

export function renderAdminAuthScreen(hasPasswordSet) {
  return `
    <div class="admin-auth-wrapper">
      <div class="glass-card" style="padding: 36px 28px; text-align: center; background: linear-gradient(135deg, rgba(30,34,53,0.95) 0%, rgba(45,26,71,0.95) 100%);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; box-shadow: var(--shadow-glow);">
          <span class="material-symbols-outlined" style="font-size: 36px; color: #FFF;">lock</span>
        </div>

        <h2 style="margin-bottom: 8px; font-size: 1.6rem; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          ${hasPasswordSet ? 'Admin Access Required' : 'Set Admin Password'}
        </h2>

        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px;">
          ${hasPasswordSet 
            ? 'Enter your 6-digit Admin Password to unlock the photo database.' 
            : 'Enter your desired 6-digit Admin Password to lock and secure the Admin Panel.'}
        </p>

        <form id="adminLoginForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="text-align: left;">
            <label style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; display: block;">6-Digit Admin Password</label>
            <input type="password" id="adminPasswordInput" class="input-field" placeholder="Enter 6 digits..." required style="width: 100%; text-align: center; letter-spacing: 4px; font-size: 1.2rem;" maxlength="6" inputmode="numeric" />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 1rem; margin-top: 8px;">
            <span class="material-symbols-outlined">${hasPasswordSet ? 'key' : 'shield'}</span>
            <span>${hasPasswordSet ? 'Unlock Admin Panel' : 'Set Password & Unlock'}</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderAdminPanel(capturesList, isCameraActive = false, autoRefreshEnabled = true) {
  const totalCaptures = capturesList ? capturesList.length : 0;
  const latestCapture = capturesList && capturesList.length > 0 ? capturesList[0] : null;

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Admin Header & Stats Banner -->
      <div class="glass-card admin-header-card" style="padding: 24px; background: linear-gradient(135deg, rgba(30,34,53,0.8) 0%, rgba(45,26,71,0.8) 100%);">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span class="material-symbols-outlined" style="font-size: 32px; color: var(--accent-primary);">admin_panel_settings</span>
            <h2 style="margin: 0; font-size: 1.5rem; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Captured Photos Admin Panel
            </h2>
          </div>
          <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
            Real-time feed of photos captured by the website camera every 1 second in the background.
          </p>
        </div>

        <div class="admin-header-actions">
          <div class="status-pill" style="display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; background: ${isCameraActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${isCameraActive ? '#10B981' : '#EF4444'}; border: 1px solid ${isCameraActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
            <span class="status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${isCameraActive ? '#10B981' : '#EF4444'}; ${isCameraActive ? 'animation: pulse 1.5s infinite;' : ''}"></span>
            <span>${isCameraActive ? 'Background Capturing Active (1s interval)' : 'Camera Inactive'}</span>
          </div>

          <button class="btn btn-secondary btn-sm" id="adminRefreshBtn">
            <span class="material-symbols-outlined">refresh</span>
            <span>Refresh Feed</span>
          </button>

          <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer; user-select: none; padding: 6px 12px; background: rgba(255,255,255,0.05); border-radius: var(--radius-md);">
            <input type="checkbox" id="adminAutoRefreshToggle" ${autoRefreshEnabled ? 'checked' : ''} style="cursor: pointer;" />
            <span>Auto Refresh (2s)</span>
          </label>

          <button class="btn btn-danger btn-sm" id="adminClearAllBtn">
            <span class="material-symbols-outlined">delete_sweep</span>
            <span>Clear All Photos</span>
          </button>

          <button class="btn btn-secondary btn-sm" id="adminLockBtn" title="Lock Admin Panel">
            <span class="material-symbols-outlined">lock</span>
            <span>Lock</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="admin-metrics-grid">
        <div class="glass-card" style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-lg); background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; color: #6366F1; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 28px;">photo_library</span>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Total Captured Photos</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);" id="adminTotalCount">${totalCaptures}</div>
          </div>
        </div>

        <div class="glass-card" style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-lg); background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; color: #10B981; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 28px;">schedule</span>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Latest Capture</div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">
              ${latestCapture ? new Date(latestCapture.timestamp).toLocaleTimeString() : 'No captures yet'}
            </div>
          </div>
        </div>

        <div class="glass-card" style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-lg); background: rgba(236, 72, 153, 0.15); display: flex; align-items: center; justify-content: center; color: #EC4899; flex-shrink: 0;">
            <span class="material-symbols-outlined" style="font-size: 28px;">storage</span>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Database Location</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">SQLite + server/uploads/</div>
          </div>
        </div>
      </div>

      <!-- Photo Gallery Section -->
      ${totalCaptures === 0 ? `
        <div class="glass-card" style="text-align: center; padding: 60px 20px;">
          <span class="material-symbols-outlined" style="font-size: 64px; color: var(--text-muted);">no_photography</span>
          <h3 style="margin-top: 16px;">No Photos Captured Yet</h3>
          <p style="color: var(--text-secondary); max-width: 420px; margin: 8px auto 24px auto;">
            Open the <strong>Analyzer</strong> tab and grant camera access. The website will automatically capture photos every 1 second and store them in the backend database.
          </p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="admin-feed-header">
            <h3 style="margin: 0;">Captured Photos Feed (${totalCaptures})</h3>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Click photo to inspect</span>
          </div>

          <div class="admin-photo-feed-grid">
            ${capturesList.map(item => `
              <div class="history-card admin-photo-card" data-id="${item.id}" style="overflow: hidden; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); border-radius: var(--radius-lg); transition: transform 0.2s, box-shadow 0.2s;">
                <div style="position: relative; width: 100%; height: 160px; background: #000; overflow: hidden; cursor: pointer;" class="admin-preview-img-container" data-url="${item.image}" data-id="${item.id}" data-time="${new Date(item.timestamp).toLocaleString()}" data-score="${item.beautyScore || 0}">
                  ${item.image ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Captured Photo" />` : `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                      <span class="material-symbols-outlined" style="font-size: 48px;">broken_image</span>
                    </div>
                  `}
                  
                  <div style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); color: #FFF; padding: 2px 6px; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                    ${item.beautyScore ? `${item.beautyScore}%` : 'Auto'}
                  </div>
                </div>

                <div style="padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                    <span title="Capture Timestamp">🕒 ${new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <button class="btn btn-secondary btn-sm admin-view-btn" data-url="${item.image}" data-id="${item.id}" data-time="${new Date(item.timestamp).toLocaleString()}" style="padding: 4px 8px; font-size: 0.75rem;">
                      <span class="material-symbols-outlined" style="font-size: 14px;">visibility</span>
                      <span>Inspect</span>
                    </button>
                    
                    <button class="icon-btn admin-delete-btn" data-id="${item.id}" title="Delete Photo" style="width: 30px; height: 30px;">
                      <span class="material-symbols-outlined" style="font-size: 15px; color: var(--error);">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `}
    </div>
  `;
}
