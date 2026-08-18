/**
 * Header & Navbar Component
 */

export function renderHeader(activeTab, theme) {
  return `
    <header class="navbar">
      <div class="brand" id="navBrand">
        <div class="brand-icon">
          <span class="material-symbols-outlined">face_retouching_natural</span>
        </div>
        <div class="brand-title">Beauty Analyzer AI</div>
      </div>
      
      <div class="nav-actions desktop-nav-actions">
        <button class="nav-btn ${activeTab === 'analyzer' ? 'active' : ''}" data-tab="analyzer">
          <span class="material-symbols-outlined">photo_camera</span>
          <span>Analyzer</span>
        </button>
        <button class="nav-btn ${activeTab === 'history' ? 'active' : ''}" data-tab="history">
          <span class="material-symbols-outlined">history</span>
          <span>History</span>
        </button>
        <button class="nav-btn ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
          <span class="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </button>
        <button class="icon-btn" id="themeToggleBtn" title="Toggle Light/Dark Theme">
          <span class="material-symbols-outlined">${theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>

      <div class="mobile-header-actions">
        <button class="icon-btn" id="mobileThemeToggleBtn" title="Toggle Light/Dark Theme">
          <span class="material-symbols-outlined">${theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>
    </header>

    <nav class="mobile-bottom-nav">
      <button class="mobile-nav-item ${activeTab === 'analyzer' ? 'active' : ''}" data-tab="analyzer">
        <span class="material-symbols-outlined">photo_camera</span>
        <span class="mobile-nav-label">Analyzer</span>
      </button>
      <button class="mobile-nav-item ${activeTab === 'history' ? 'active' : ''}" data-tab="history">
        <span class="material-symbols-outlined">history</span>
        <span class="mobile-nav-label">History</span>
      </button>
      <button class="mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
        <span class="material-symbols-outlined">settings</span>
        <span class="mobile-nav-label">Settings</span>
      </button>
    </nav>
  `;
}

