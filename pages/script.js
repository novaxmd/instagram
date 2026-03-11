// State management
let currentPage = 'home';
let downloadHistory = JSON.parse(localStorage.getItem('downloadHistory')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
  darkMode: true,
  autoDownload: false,
  quality: 'HD'
};

// DOM Elements
const mainContent = document.getElementById('mainContent');
const navItems = document.querySelectorAll('.nav-item');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadPage('home');
  setupEventListeners();
});

function setupEventListeners() {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      loadPage(page);
      
      // Update active nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

function loadPage(page) {
  currentPage = page;
  
  switch(page) {
    case 'home':
      renderHomePage();
      break;
    case 'download':
      renderDownloadPage();
      break;
    case 'history':
      renderHistoryPage();
      break;
    case 'settings':
      renderSettingsPage();
      break;
  }
}

// ==================== HOME PAGE (Kama Picha ya Kwanza) ====================
function renderHomePage() {
  const html = `
    <div class="hero-section">
      <h1 class="hero-title">
        <i class="bi bi-instagram"></i>
        Download Instagram Content
      </h1>
      <p class="hero-subtitle">Fast, secure & completely free. No watermark!</p>
      
      <button class="btn" onclick="loadPage('download')">
        <i class="bi bi-play-fill"></i> Start Downloading
      </button>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">
          <i class="bi bi-camera-reels-fill"></i>
        </div>
        <h3>Reels & Videos</h3>
        <p>Download HD reels & videos instantly</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon posts">
          <i class="bi bi-images"></i>
        </div>
        <h3>Posts & Photos</h3>
        <p>Save images & carousel posts</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon stories">
          <i class="bi bi-play-btn-fill"></i>
        </div>
        <h3>Stories & IGTV</h3>
        <p>Get stories & IGTV videos</p>
      </div>
    </div>

    <div class="how-it-works">
      <h2 class="section-title">How It Works</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <i class="bi bi-copy"></i>
            <p>Copy Instagram post or reel URL</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <i class="bi bi-paste"></i>
            <p>Paste URL & click Fetch Content</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <i class="bi bi-cloud-download"></i>
            <p>Preview & download in HD</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  mainContent.innerHTML = html;
}

// ==================== DOWNLOAD PAGE (Kama Picha ya Pili) ====================
function renderDownloadPage() {
  const html = `
    <div class="page-header">
      <h2 class="page-title">Download Content</h2>
    </div>

    <div class="download-card">
      <div class="input-group">
        <label class="input-label">Instagram URL</label>
        <input type="url" id="instagramUrl" class="input-field" 
               placeholder="https://www.instagram.com/reel/xxxx/">
        <p class="input-hint">Paste any Instagram reel, post or video URL.</p>
      </div>

      <button class="btn" id="fetchBtn" onclick="fetchContent()">
        <i class="bi bi-search"></i> Fetch Content
      </button>
    </div>

    <div id="loadingState" class="loading-state hidden">
      <div class="spinner"></div>
      <p>Fetching content...</p>
    </div>

    <div id="resultArea" class="hidden"></div>
  `;
  
  mainContent.innerHTML = html;
  
  // Auto-fill if coming from history
  const pendingUrl = localStorage.getItem('pendingDownload');
  if (pendingUrl) {
    document.getElementById('instagramUrl').value = pendingUrl;
    localStorage.removeItem('pendingDownload');
  }
}

// Fetch content function
window.fetchContent = async function() {
  const url = document.getElementById('instagramUrl').value.trim();
  
  if (!url || url === 'https://www.instagram.com/reel/xxxx/') {
    alert('Please enter a valid Instagram URL');
    return;
  }

  // Show loading
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('resultArea').classList.add('hidden');

  try {
    // Call our API
    const response = await fetch('/api/api.js?url=' + encodeURIComponent(url));
    const data = await response.json();
    
    if (data.success) {
      showResult(data.data, url);
      
      // Add to history
      addToHistory({
        url: url,
        date: new Date().toISOString(),
        type: url.includes('/reel/') ? 'Reel' : 'Post',
        title: data.data.title
      });
    } else {
      throw new Error(data.error || 'Failed to fetch');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    document.getElementById('loadingState').classList.add('hidden');
  }
}

function showResult(data, url) {
  const resultArea = document.getElementById('resultArea');
  
  resultArea.innerHTML = `
    <div class="preview-card">
      <div class="preview-header">
        <div class="preview-avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        <div class="preview-info">
          <h4>@${data.username || 'instagram_user'}</h4>
          <p>${url}</p>
        </div>
      </div>
      <div class="preview-media">
        ${data.mediaType === 'video' 
          ? `<video src="${data.downloadUrl}" controls class="preview-image"></video>`
          : `<img src="${data.thumbnail || data.downloadUrl}" alt="Preview" class="preview-image">`
        }
      </div>
      <div class="preview-actions">
        <button class="btn" onclick="downloadContent('${data.downloadUrl}', '${data.filename}')">
          <i class="bi bi-download"></i> Download HD
        </button>
        <button class="btn btn-secondary" onclick="resetDownload()">
          <i class="bi bi-arrow-repeat"></i> New Download
        </button>
      </div>
    </div>
  `;
  
  resultArea.classList.remove('hidden');
}

window.downloadContent = function(url, filename) {
  // In real app, this would trigger download
  alert(`Downloading: ${filename}\n(In real app, this would download the file)`);
  
  if (settings.autoDownload) {
    // Auto download logic here
  }
}

window.resetDownload = function() {
  document.getElementById('instagramUrl').value = 'https://www.instagram.com/reel/xxxx/';
  document.getElementById('resultArea').classList.add('hidden');
}

// ==================== HISTORY PAGE (Kama Picha ya Tatu) ====================
function renderHistoryPage() {
  let historyHtml = '';
  
  if (downloadHistory.length === 0) {
    historyHtml = `
      <div class="empty-state">
        <i class="bi bi-clock-history empty-icon"></i>
        <h3>No History Yet</h3>
        <p>Your downloaded content will appear here</p>
        <button class="btn" onclick="loadPage('download')">
          <i class="bi bi-download"></i> Download Now
        </button>
      </div>
    `;
  } else {
    historyHtml = `
      <div class="page-header">
        <h2 class="page-title">Download History</h2>
      </div>
      <div class="history-list">
        ${downloadHistory.map((item, index) => `
          <div class="history-item">
            <div class="history-icon">
              <i class="bi ${item.type === 'Reel' ? 'bi-camera-reels' : 'bi-file-image'}"></i>
            </div>
            <div class="history-details">
              <div class="history-url">${item.title || item.url}</div>
              <div class="history-meta">
                <span>${item.type}</span>
                <span>${new Date(item.date).toLocaleDateString()}</span>
              </div>
            </div>
            <button class="btn btn-small" onclick="reDownload('${item.url}')">
              <i class="bi bi-download"></i>
            </button>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary mt-4" onclick="clearHistory()">
        <i class="bi bi-trash"></i> Clear History
      </button>
    `;
  }
  
  mainContent.innerHTML = historyHtml;
}

window.reDownload = function(url) {
  localStorage.setItem('pendingDownload', url);
  loadPage('download');
}

window.clearHistory = function() {
  if (confirm('Clear all download history?')) {
    downloadHistory = [];
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
    renderHistoryPage();
  }
}

function addToHistory(item) {
  downloadHistory.unshift(item);
  downloadHistory = downloadHistory.slice(0, 20); // Keep last 20
  localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
}

// ==================== SETTINGS PAGE (Kama Picha ya Nne) ====================
function renderSettingsPage() {
  const html = `
    <div class="page-header">
      <h2 class="page-title">Settings</h2>
    </div>

    <div class="settings-container">
      <!-- Dark Mode -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="bi bi-moon-stars"></i>
          <div>
            <h3>Dark Mode</h3>
            <p>Switch between themes</p>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" id="darkModeToggle" ${settings.darkMode ? 'checked' : ''}>
          <span class="slider round"></span>
        </label>
      </div>

      <!-- Auto Download -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="bi bi-arrow-repeat"></i>
          <div>
            <h3>Auto Download</h3>
            <p>Start download automatically</p>
          </div>
        </div>
        <label class="switch">
          <input type="checkbox" id="autoDownloadToggle" ${settings.autoDownload ? 'checked' : ''}>
          <span class="slider round"></span>
        </label>
      </div>

      <!-- Download Quality -->
      <div class="setting-item">
        <div class="setting-info">
          <i class="bi bi-hdd-stack"></i>
          <div>
            <h3>Download Quality</h3>
            <p>SD &nbsp; HD &nbsp; FHD</p>
          </div>
        </div>
        <div class="quality-selector">
          <button class="quality-btn ${settings.quality === 'SD' ? 'active' : ''}" data-quality="SD">SD</button>
          <button class="quality-btn ${settings.quality === 'HD' ? 'active' : ''}" data-quality="HD">HD</button>
          <button class="quality-btn ${settings.quality === 'FHD' ? 'active' : ''}" data-quality="FHD">FHD</button>
        </div>
      </div>

      <!-- About Section -->
      <div class="about-section">
        <h3>About</h3>
        <p class="about-text">
          <i class="bi bi-instagram"></i>
          Download Instagram reels, posts & videos in HD.<br>
          100% Free - HD Quality - No Watermark
        </p>
      </div>
    </div>
  `;
  
  mainContent.innerHTML = html;
  
  // Add event listeners for settings
  setupSettingsListeners();
}

function setupSettingsListeners() {
  // Dark Mode
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', (e) => {
      settings.darkMode = e.target.checked;
      localStorage.setItem('settings', JSON.stringify(settings));
      // Apply theme change
      document.body.style.background = settings.darkMode ? '#000' : '#fff';
      document.body.style.color = settings.darkMode ? '#fff' : '#000';
    });
  }

  // Auto Download
  const autoDownloadToggle = document.getElementById('autoDownloadToggle');
  if (autoDownloadToggle) {
    autoDownloadToggle.addEventListener('change', (e) => {
      settings.autoDownload = e.target.checked;
      localStorage.setItem('settings', JSON.stringify(settings));
    });
  }

  // Quality Buttons
  document.querySelectorAll('.quality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settings.quality = btn.dataset.quality;
      localStorage.setItem('settings', JSON.stringify(settings));
    });
  });
}

// Make functions global
window.loadPage = loadPage;
