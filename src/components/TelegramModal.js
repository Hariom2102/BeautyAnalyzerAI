/**
 * Telegram Confirmation Modal Component
 */

export function renderTelegramModal(botConfigured) {
  return `
    <div class="modal-overlay" id="telegramModalOverlay">
      <div class="modal-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="display: flex; align-items: center; gap: 10px;">
            <span class="material-symbols-outlined" style="color: #22D3EE;">send</span>
            <span>Send Photo to Telegram</span>
          </h3>
          <button class="icon-btn" id="closeTelegramModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          You are about to transmit your analyzed photo and report summary to your configured Telegram Bot.
        </p>

        <div style="background: var(--bg-primary); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--glass-border);">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Privacy Notice:</div>
          <div style="font-size: 0.9rem; margin-top: 4px;">
            Photos are never uploaded automatically. Upload occurs only after you explicitly click Confirm.
          </div>
        </div>

        ${!botConfigured ? `
          <div style="color: var(--error); font-size: 0.875rem; background: rgba(239,68,68,0.1); padding: 12px; border-radius: var(--radius-md);">
            ⚠️ Telegram Bot Token or Chat ID is not configured yet. Please configure it in Settings.
          </div>
        ` : ''}

        <div id="uploadStatusBox" style="display: none; padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem;"></div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="cancelTelegramBtn" style="flex: 1; min-width: 120px;">Cancel</button>
          <button class="btn btn-primary" id="confirmTelegramUploadBtn" style="flex: 1; min-width: 160px;" ${!botConfigured ? 'disabled style="opacity: 0.5; cursor: not-allowed; flex: 1; min-width: 160px;"' : ''}>
            <span class="material-symbols-outlined">cloud_upload</span>
            <span>Confirm Upload</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
