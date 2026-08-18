/**
 * Settings & Privacy Policy Component
 */

export function renderSettingsPage(settings) {
  return `
    <div style="display: flex; flex-direction: column; gap: 24px; max-width: 800px; margin: 0 auto;">
      <h2>Settings & Privacy Control</h2>

      <!-- Telegram Configuration Card -->
      <div class="glass-card">
        <h3 style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="color: #22D3EE;">send</span>
          <span>Telegram Bot Integration (Optional)</span>
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Configure your Telegram Bot token and Chat ID if you wish to use the optional "Send my photo to Telegram" feature.
        </p>

        <form id="telegramSettingsForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label for="botTokenInput">Telegram Bot Token</label>
            <input type="password" id="botTokenInput" class="input-field" placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz..." value="${settings.botToken || ''}" />
          </div>

          <div class="input-group">
            <label for="chatIdInput">Telegram Chat ID</label>
            <input type="text" id="chatIdInput" class="input-field" placeholder="e.g. 987654321 or @yourchannel" value="${settings.chatId || ''}" />
          </div>

          <button type="submit" class="btn btn-primary" style="align-self: flex-start;">
            <span class="material-symbols-outlined">save</span>
            <span>Save Bot Settings</span>
          </button>
        </form>
      </div>

      <!-- Data & Storage Clearing Card -->
      <div class="glass-card">
        <h3 style="display: flex; align-items: center; gap: 10px; color: var(--error);">
          <span class="material-symbols-outlined">delete_forever</span>
          <span>Data Storage & Purge</span>
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Permanently delete all locally stored selfie photos, landmark metadata, and analysis history records from this device.
        </p>

        <div>
          <button class="btn btn-danger" id="clearAllDataBtn">
            <span class="material-symbols-outlined">delete_sweep</span>
            <span>Clear All Saved Data</span>
          </button>
        </div>
      </div>

      <!-- Comprehensive Privacy Policy Card -->
      <div class="glass-card">
        <h3 style="display: flex; align-items: center; gap: 10px;">
          <span class="material-symbols-outlined" style="color: var(--accent-primary);">shield</span>
          <span>Privacy Policy</span>
        </h3>

        <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
          <div>
            <strong style="color: var(--text-primary);">1. On-Device Local Processing</strong><br>
            All facial landmark detection, symmetry estimation, and beauty score calculations are performed strictly on your local device. No facial recognition data or camera feeds are sent to external servers by default.
          </div>

          <div>
            <strong style="color: var(--text-primary);">2. Camera Access & Permissions</strong><br>
            Camera access is requested solely to capture your selfie for face analysis. You can revoke camera permission at any time in your browser/device settings or choose to upload images from your local gallery instead.
          </div>

          <div>
            <strong style="color: var(--text-primary);">3. Explicit Cloud Upload Policy</strong><br>
            The Telegram upload feature is strictly optional and requires your explicit manual confirmation via a dialog prompt. We never upload photos automatically or in the background.
          </div>

          <div>
            <strong style="color: var(--text-primary);">4. Data Ownership & Deletion</strong><br>
            You retain complete control over your saved history. Use the "Clear All Saved Data" button above to immediately erase all stored analysis records and images.
          </div>
        </div>
      </div>
    </div>
  `;
}
