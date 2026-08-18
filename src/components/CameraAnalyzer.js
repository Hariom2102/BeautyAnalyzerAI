/**
 * Camera & Analyzer Input Component
 */

export function renderPermissionGuard() {
  return `
    <div class="glass-card permission-card">
      <div class="permission-icon">
        <span class="material-symbols-outlined">videocam</span>
      </div>
      <h2>Camera Access Needed</h2>
      <p style="color: var(--text-secondary); max-width: 380px;">
        Beauty Analyzer AI processes your selfie locally on your device to analyze facial symmetry, landmarks, and posture.
      </p>
      <div class="permission-actions">
        <button class="btn btn-primary" id="requestCameraBtn">
          <span class="material-symbols-outlined">camera_alt</span>
          <span>Grant Camera Access</span>
        </button>
      </div>
    </div>
  `;
}

export function renderAnalyzerBox() {
  return `
    <div class="glass-card">
      <div class="analyzer-header">
        <div>
          <h3>Face Capture & Alignment</h3>
          <p style="color: var(--text-secondary); font-size: 0.875rem;">Center your face within the frame for optimal landmark detection.</p>
        </div>
      </div>

      <div class="analyzer-box" id="analyzerBox">
        <video id="cameraVideo" class="analyzer-video" autoplay playsinline muted></video>
        <img id="previewImage" class="analyzer-video" style="display: none;" />
        <canvas id="landmarkCanvas" class="analyzer-canvas"></canvas>
        
        <div class="analyzer-overlay-controls">
          <button class="icon-btn" id="toggleCameraBtn" title="Switch Camera">
            <span class="material-symbols-outlined">cameraswitch</span>
          </button>
          
          <button class="shutter-btn" id="shutterBtn" title="Capture & Analyze">
            <div class="shutter-btn-inner"></div>
          </button>
          
          <button class="icon-btn" id="retakeBtn" title="Reset Frame" style="display: none;">
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
