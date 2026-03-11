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
  
  // Check if app is installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) installBtn.style.display = 'none';
  }
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

// ==================== HOME PAGE ====================
function renderHomePage() {
  const html = `
    <div class="hero-section">
      <h1 class="hero-title">
        <img src="/pages/logo.png" alt="Logo" style="width: 40px; height: 40px; border-radius: 12px;">
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

// ==================== DOWNLOAD PAGE ====================
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

// Format number (K, M)
function formatNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Format date
function formatDateFromUnix(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return 'Posted on ' + date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ==================== DOWNLOAD FUNCTION - KWA VIDEO (Inafanya Kazi) ====================
window.downloadFromVideo = function(url, filename) {
  try {
    console.log('Downloading from video:', url);
    
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&originalUrl=${encodeURIComponent(window.currentInstagramUrl || '')}`;
    
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
    }, 1000);
    
    showToast('Download started!', 'success');
    
  } catch (err) {
    console.error('Video download error:', err);
    showToast('Download failed. Try again.', 'error');
  }
}

// ==================== DOWNLOAD FUNCTION - KWA BUTTON (Imerekebishwa) ====================
window.downloadFromButton = function(url, filename) {
  // Tumia function ile ile inayofanya kazi kwenye video
  window.downloadFromVideo(url, filename);
}

// Helper function for toast messages
function showToast(message, type = 'success') {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: message,
      icon: type,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2000
    });
  } else {
    alert(message);
  }
}

// ==================== FETCH CONTENT FUNCTION ====================
window.fetchContent = async function() {
  const url = document.getElementById('instagramUrl').value.trim();
  
  if (!url || url === 'https://www.instagram.com/reel/xxxx/') {
    showToast('Please enter a valid Instagram URL', 'warning');
    return;
  }

  // Show loading
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('resultArea').classList.add('hidden');

  try {
    // Call API (sasa ina API mbili)
    const response = await fetch(`/api/api.js?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data.success) {
      // Save current URL for proxy
      window.currentInstagramUrl = url;
      
      // Process the data
      const mediaData = data.data;
      const downloadUrls = mediaData.downloadUrls || [];
      
      // Check if it's video
      const isVideo = url.includes('/reel/') || 
                     (downloadUrls.length > 0 && downloadUrls[0].type === 'video') ||
                     (downloadUrls.length > 0 && downloadUrls[0].ext === 'mp4') ||
                     mediaData.mediaType === 'video';
      
      // Get first media URL
      const mainMedia = downloadUrls.length > 0 ? downloadUrls[0] : null;
      
      // Prepare data for display
      const displayData = {
        title: mediaData.title || 'Instagram Post',
        username: mediaData.username || 'unknown',
        like_count: mediaData.like_count || 0,
        comment_count: mediaData.comment_count || 0,
        taken_at: mediaData.taken_at || Math.floor(Date.now() / 1000),
        downloadUrl: mainMedia ? mainMedia.url : '',
        thumbnail: mainMedia ? mainMedia.thumb : mediaData.thumbnail || '',
        downloadUrls: downloadUrls,
        isVideo: isVideo,
        source: url,
        apiUsed: mediaData.apiUsed || 'API'
      };
      
      showResult(displayData);
      
      // Add to history
      addToHistory({
        url: url,
        date: new Date().toISOString(),
        type: isVideo ? 'Reel' : 'Post',
        title: displayData.title,
        username: displayData.username
      });
      
      showToast(`Fetched using ${displayData.apiUsed}`, 'success');
      
      // Auto download if setting is enabled
      if (settings.autoDownload && mainMedia) {
        setTimeout(() => {
          window.downloadFromButton(mainMedia.url, `instagram-video-${Date.now()}.mp4`);
        }, 500);
      }
    } else {
      throw new Error(data.error || 'Failed to fetch');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Error: ' + error.message, 'error');
  } finally {
    document.getElementById('loadingState').classList.add('hidden');
  }
}

// ==================== SHOW RESULT FUNCTION ====================
function showResult(data) {
  const resultArea = document.getElementById('resultArea');
  const isVideo = data.isVideo;
  const downloadUrls = data.downloadUrls || [];
  const isMultipleMedia = downloadUrls.length > 1;
  
  // Build gallery HTML if multiple media
  let galleryHtml = '';
  if (isMultipleMedia) {
    galleryHtml = `
      <div style="margin-top: 20px; padding: 0 16px 16px;">
        <h4 style="color: var(--accent); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="bi bi-images"></i> Media Gallery (${downloadUrls.length})
        </h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${downloadUrls.map((item, index) => {
            const itemIsVideo = item.type === 'video' || item.ext === 'mp4';
            return `
              <div style="position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #222; cursor: pointer;" 
                   onclick="downloadFromVideo('${item.url}', 'instagram-${index+1}.${item.ext}')">
                <img src="${item.thumb || item.url}" style="width: 100%; height: 100%; object-fit: cover;">
                ${itemIsVideo ? '<i class="bi bi-play-circle-fill" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; text-shadow: 0 2px 5px rgba(0,0,0,0.5);"></i>' : ''}
                <div style="position: absolute; bottom: 4px; right: 4px; background: var(--accent); border-radius: 4px; padding: 4px;">
                  <i class="bi bi-download" style="color: black; font-size: 12px;"></i>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  // Build download options
  let downloadOptionsHtml = '';
  if (downloadUrls.length > 0) {
    downloadOptionsHtml = `
      <div style="padding: 16px; border-top: 1px solid var(--border);">
        <h4 style="color: var(--accent); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="bi bi-download"></i> Download Options
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${downloadUrls.map((item, index) => {
            const itemIsVideo = item.type === 'video' || item.ext === 'mp4';
            return `
              <button class="btn btn-secondary" style="width: 100%;" onclick="downloadFromButton('${item.url}', 'instagram-${index+1}.${item.ext}')">
                <i class="bi ${itemIsVideo ? 'bi-play-circle' : 'bi-image'}"></i>
                Download ${itemIsVideo ? 'Video' : 'Photo'} ${downloadUrls.length > 1 ? `#${index+1}` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  // API used badge
  const apiBadge = data.apiUsed ? `
    <div style="text-align: center; margin-top: 8px; font-size: 11px; color: var(--text-secondary);">
      <i class="bi bi-cloud-check"></i> via ${data.apiUsed}
    </div>
  ` : '';
  
  // Determine file extension for main download
  const mainExt = isVideo ? 'mp4' : 'jpg';
  
  resultArea.innerHTML = `
    <div class="preview-card">
      <div class="preview-header">
        <div class="preview-avatar">
          <img src="/pages/logo.png" alt="Logo" style="width: 60px; height: 60px; border-radius: 30px; object-fit: cover;">
        </div>
        <div class="preview-info">
          <h4>@${data.username}</h4>
          <p style="font-size: 11px; word-break: break-all;">${data.source.substring(0, 60)}...</p>
          <div style="display: flex; gap: 16px; margin-top: 8px;">
            <span><i class="bi bi-heart-fill" style="color: #ff3040;"></i> ${formatNumber(data.like_count)}</span>
            <span><i class="bi bi-chat-fill" style="color: var(--accent);"></i> ${formatNumber(data.comment_count)}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
            ${formatDateFromUnix(data.taken_at)}
          </div>
        </div>
      </div>
      
      <div class="preview-media" onclick="downloadFromVideo('${data.downloadUrl}', 'instagram-video-${Date.now()}.${mainExt}')" style="cursor: pointer;">
        ${isVideo 
          ? `<video src="${data.downloadUrl}" controls class="preview-image" poster="${data.thumbnail}" style="max-height: 400px; width: 100%;" onclick="event.stopPropagation()"></video>`
          : `<img src="${data.downloadUrl || data.thumbnail}" alt="Preview" class="preview-image" style="max-height: 400px;">`
        }
        <div style="text-align: center; margin-top: 8px; color: var(--accent); font-size: 12px;">
          <i class="bi bi-download"></i> Tap video to download
        </div>
      </div>
      
      ${apiBadge}
      ${isMultipleMedia ? galleryHtml : ''}
      ${downloadOptionsHtml}
      
      <div class="preview-actions">
        <button class="btn" onclick="downloadFromButton('${data.downloadUrl}', 'instagram-video-${Date.now()}.${mainExt}')">
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

// Reset download function
window.resetDownload = function() {
  document.getElementById('instagramUrl').value = 'https://www.instagram.com/reel/xxxx/';
  document.getElementById('resultArea').classList.add('hidden');
}

// ==================== HISTORY PAGE ====================
function renderHistoryPage() {
  let historyHtml = '';
  
  if (downloadHistory.length === 0) {
    historyHtml = `
      <div class="empty-state">
        <img src="/pages/logo.png" alt="Logo" style="width: 80px; height: 80px; border-radius: 20px; margin-bottom: 10px;">
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
          <div class="history-item" onclick="reDownload('${item.url}')" style="cursor: pointer;">
            <div class="history-icon">
              <img src="/pages/logo.png" alt="Logo" style="width: 56px; height: 56px; border-radius: 16px; object-fit: cover;">
            </div>
            <div class="history-details">
              <div class="history-url">${item.title || item.url.substring(0, 50)}...</div>
              <div class="history-meta">
                <span>${item.type}</span>
                <span>${new Date(item.date).toLocaleDateString()}</span>
                <span>@${item.username || 'user'}</span>
              </div>
            </div>
            <button class="btn btn-small" onclick="event.stopPropagation(); reDownload('${item.url}')">
              <i class="bi bi-download"></i>
            </button>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary mt-4" onclick="event.stopPropagation(); clearHistory()">
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
    showToast('History cleared!', 'success');
  }
}

function addToHistory(item) {
  downloadHistory.unshift(item);
  downloadHistory = downloadHistory.slice(0, 20);
  localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
}

// ==================== SETTINGS PAGE ====================
function renderSettingsPage() {
  const html = `
    <div class="page-header">
      <h2 class="page-title">Settings</h2>
    </div>

    <div class="settings-container">
      <!-- Dark Mode -->
      <div class="setting-item">
        <div class="setting-info">
          <img src="/pages/logo.png" alt="Logo" style="width: 40px; height: 40px; border-radius: 12px;">
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
          <img src="/pages/logo.png" alt="Logo" style="width: 60px; height: 60px; border-radius: 16px; margin-bottom: 10px;">
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
      showToast(`Quality set to ${btn.dataset.quality}`, 'success');
    });
  });
}

// Make functions global
window.loadPage = loadPage;
