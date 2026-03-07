// lib/api/api.js - API handling

const API_BASE_URL = 'https://api-library-kohi.onrender.com/api';

async function fetchInstagramData(url) {
  try {
    const apiUrl = `${API_BASE_URL}/alldl?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function transformApiResponse(data, originalUrl) {
  const transformedData = {
    ok: true,
    detail: {
      title: data.data.title || 'Instagram Post',
      username: data.data.username || 'unknown',
      source: originalUrl,
      like_count: data.data.like_count || 0,
      comment_count: data.data.comment_count || 0,
      taken_at: Math.floor(Date.now() / 1000),
      comments: data.data.comments || []
    },
    downloadUrls: []
  };

  // Handle different media types
  if (data.data.images && Array.isArray(data.data.images)) {
    // For carousel posts with multiple images
    data.data.images.forEach((img) => {
      transformedData.downloadUrls.push({
        url: img,
        ext: 'jpg',
        thumb: img,
        type: 'image'
      });
    });
  } else if (data.data.videoUrl) {
    // For video/reel posts
    transformedData.downloadUrls.push({
      url: data.data.videoUrl,
      ext: 'mp4',
      thumb: data.data.thumbnail || '',
      type: 'video'
    });
  }

  return transformedData;
}

function renderResults(data, originalUrl) {
  const detail = data.detail;
  const medias = data.downloadUrls;

  document.getElementById('postTitle').textContent = detail.title || 'No Title';
  document.getElementById('description').textContent = detail.title || 'No description';
  document.getElementById('postUsername').textContent = '@' + (detail.username || 'unknown');
  document.getElementById('postSource').href = detail.source || '#';
  document.getElementById('likeCount').textContent = formatNumber(detail.like_count);
  document.getElementById('commentCount').textContent = formatNumber(detail.comment_count);
  document.getElementById('takenAt').textContent = formatDateFromUnix(detail.taken_at);

  // Determine post type based on URL
  const sourceLower = originalUrl.toLowerCase();
  const typeBadge = document.getElementById('typeBadge');
  if (sourceLower.includes('/reel/')) {
    typeBadge.textContent = 'REEL';
  } else if (sourceLower.includes('/stories/')) {
    typeBadge.textContent = 'STORY';
  } else {
    typeBadge.textContent = 'POST';
  }

  const imageGallery = document.getElementById('imageGallery');
  const downloadGrid = document.getElementById('downloadGrid');
  const gallerySection = document.getElementById('gallerySection');
  
  imageGallery.innerHTML = '';
  downloadGrid.innerHTML = '';

  if (medias.length > 1) {
    gallerySection.style.display = 'block';
  } else {
    gallerySection.style.display = 'none';
  }

  medias.forEach((item, index) => {
    const isVideo = item.ext === 'mp4' || item.type === 'video';

    const card = document.createElement('div');
    card.className = 'download-card';

    const labelType = isVideo ? 'Video (MP4)' : `Image ${medias.length > 1 ? `#${index + 1}` : ''}`;
    const iconClass = isVideo ? 'bi-play-circle' : 'bi-image';

    card.innerHTML = `
      <div class="download-card-title">
        <i class="bi ${iconClass}"></i>
        ${labelType}
      </div>
      <div class="download-card-desc">
        Download ${isVideo ? 'Instagram reel/video' : 'photo'} in original quality.
      </div>
      <button class="btn">
        <i class="bi bi-download"></i> Download
      </button>
    `;

    const btn = card.querySelector('button');
    btn.addEventListener('click', () => {
      const safeTitle = (detail.title || 'Instagram').replace(/[^\w\d\-]+/g, '_').slice(0, 40);
      const fileExt = isVideo ? 'mp4' : 'jpg';
      downloadFile(item.url, `${safeTitle || 'Instagram'}-${index + 1}.${fileExt}`);
    });

    downloadGrid.appendChild(card);

    // Add to gallery (for images or if multiple media)
    if (!isVideo || medias.length > 1) {
      const thumbUrl = item.thumb || item.url;
      const imgItem = document.createElement('div');
      imgItem.className = 'image-item';
      imgItem.innerHTML = `
        <img src="${thumbUrl}" alt="Media ${index + 1}" onerror="this.src='https://via.placeholder.com/150'"/>
        <div class="image-overlay">
          <button class="btn btn-small" onclick="downloadFile('${item.url}', 'instagram-media-${index + 1}.${isVideo ? 'mp4' : 'jpg'}')">
            <i class="bi bi-download"></i>
          </button>
        </div>
      `;
      imageGallery.appendChild(imgItem);
    }
  });

  // Handle comments
  const commentsList = document.getElementById('commentsList');
  const commentsSection = document.getElementById('commentsSection');
  
  commentsList.innerHTML = '';
  if (Array.isArray(detail.comments) && detail.comments.length > 0) {
    commentsSection.style.display = 'block';
    detail.comments.slice(0, 7).forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = `
        <span class="comment-username">@${c.username || 'user'}</span>
        <span class="comment-text">${c.text || c.comment || ''}</span>
      `;
      commentsList.appendChild(div);
    });
  } else {
    commentsSection.style.display = 'none';
  }
}

// Helper functions (copied from main for use in this file)
function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function formatDateFromUnix(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return 'Posted on ' + date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

async function downloadFile(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download failed:', err);
    window.open(url, '_blank');
  }
}
