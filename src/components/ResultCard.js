/**
 * Analysis Result & Metrics Display Component
 */

export function renderResultCard(result) {
  if (!result) {
    return `
      <div class="glass-card" style="text-align: center; padding: 60px 20px;">
        <span class="material-symbols-outlined" style="font-size: 56px; color: var(--text-muted);">face</span>
        <h3 style="margin-top: 12px; color: var(--text-secondary);">Ready for Face Analysis</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Take a selfie or upload an image to view your AI analysis & beauty score.</p>
      </div>
    `;
  }

  const { beautyScore, symmetryScore, smileScore, confidenceScore, faceAngle, suggestions } = result;

  return `
    <div class="glass-card" style="animation: fadeIn 0.5s ease;">
      <!-- Disclaimer Banner -->
      <div class="disclaimer-banner">
        <span class="material-symbols-outlined">info</span>
        <div>
          <strong>Entertainment Disclaimer:</strong>
          This Beauty Score (0–100%) is calculated strictly for entertainment purposes and fun. It is not scientifically valid.
        </div>
      </div>

      <!-- Animated Circular Progress Indicator -->
      <div class="score-circle-wrapper">
        <svg class="score-svg" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E056FD" />
              <stop offset="50%" stop-color="#686DE0" />
              <stop offset="100%" stop-color="#22D3EE" />
            </linearGradient>
          </defs>
          <circle class="score-bg-circle" cx="100" cy="100" r="85"></circle>
          <circle class="score-progress-circle" id="scoreCircleProgress" cx="100" cy="100" r="85" style="stroke-dashoffset: ${565 - (565 * beautyScore) / 100};"></circle>
        </svg>
        <div class="score-text-content">
          <div class="score-number">${beautyScore}%</div>
          <div class="score-label">Beauty Score</div>
        </div>
      </div>

      <!-- Key Metrics Breakdown -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-card-header">
            <span class="material-symbols-outlined">balance</span>
            <span>Symmetry</span>
          </div>
          <div class="metric-card-value">${symmetryScore}%</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="material-symbols-outlined">mood</span>
            <span>Smile</span>
          </div>
          <div class="metric-card-value">${smileScore}%</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="material-symbols-outlined">crop_rotate</span>
            <span>Face Tilt</span>
          </div>
          <div class="metric-card-value">${faceAngle.roll}°</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="material-symbols-outlined">verified_user</span>
            <span>Confidence</span>
          </div>
          <div class="metric-card-value">${confidenceScore}%</div>
        </div>
      </div>

      <!-- Personalized Style & Grooming Suggestions -->
      <div>
        <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span class="material-symbols-outlined" style="color: var(--accent-primary);">style</span>
          <span>Style & Grooming Advice</span>
        </h4>
        <div class="chips-container">
          ${suggestions.map(s => `
            <div class="suggestion-chip">
              <span class="material-symbols-outlined">${s.icon}</span>
              <span>${s.text}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Actions -->
      <div class="result-actions">
        <button class="btn btn-primary" id="saveHistoryBtn">
          <span class="material-symbols-outlined">bookmark</span>
          <span>Save to History</span>
        </button>

        <button class="btn btn-secondary" id="telegramUploadBtn">
          <span class="material-symbols-outlined">send</span>
          <span>Send my photo to Telegram</span>
        </button>
      </div>
    </div>
  `;
}
