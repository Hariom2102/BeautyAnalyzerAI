/**
 * Saved Analysis History Component
 */

export function renderHistoryPage(historyItems) {
  if (!historyItems || historyItems.length === 0) {
    return `
      <div class="glass-card" style="text-align: center; padding: 80px 20px;">
        <span class="material-symbols-outlined" style="font-size: 64px; color: var(--text-muted);">history</span>
        <h2 style="margin-top: 16px;">No Saved History Yet</h2>
        <p style="color: var(--text-secondary); max-width: 400px; margin: 8px auto 24px auto;">
          Your saved selfie analyses will appear here. Captured images are stored locally on your device only.
        </p>
        <button class="btn btn-primary" id="goToAnalyzerBtn">
          <span class="material-symbols-outlined">camera_alt</span>
          <span>Start New Analysis</span>
        </button>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <h2 style="margin: 0;">Analysis History (${historyItems.length})</h2>
        <button class="btn btn-danger btn-sm" id="clearAllHistoryBtn">
          <span class="material-symbols-outlined">delete_sweep</span>
          <span>Clear History</span>
        </button>
      </div>

      <div class="history-grid">
        ${historyItems.map(item => `
          <div class="history-card" data-id="${item.id}">
            ${item.image ? `<img src="${item.image}" class="history-thumb" alt="Saved Selfie" />` : `
              <div class="history-thumb" style="background: var(--bg-surface-elevated); display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--text-muted);">face</span>
              </div>
            `}
            
            <div class="history-body">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(item.timestamp).toLocaleString()}</span>
                <span style="background: var(--accent-gradient); color: #FFF; padding: 4px 10px; border-radius: var(--radius-full); font-weight: 700; font-size: 0.85rem;">
                  ${item.beautyScore}% Score
                </span>
              </div>

              <div style="display: flex; gap: 12px; font-size: 0.85rem; color: var(--text-secondary);">
                <span>Symmetry: <strong>${item.symmetryScore}%</strong></span>
                <span>Smile: <strong>${item.smileScore}%</strong></span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <button class="btn btn-secondary btn-sm view-detail-btn" data-id="${item.id}">
                  <span class="material-symbols-outlined">visibility</span>
                  <span>Details</span>
                </button>
                <button class="icon-btn delete-item-btn" data-id="${item.id}" title="Delete Item" style="width: 34px; height: 34px;">
                  <span class="material-symbols-outlined" style="font-size: 18px; color: var(--error);">delete</span>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
