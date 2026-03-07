// script.js - Main application logic

document.getElementById('current-year').textContent = new Date().getFullYear();

// Mobile menu functionality
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

// DOM Elements
const igUrl = document.getElementById('igUrl');
const fetchBtn = document.getElementById('fetchBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const inputCard = document.getElementById('inputCard');
const resultArea = document.getElementById('resultArea');
const resetBtn = document.getElementById('resetBtn');

const postTitle = document.getElementById('postTitle');
const postUsername = document.getElementById('postUsername');
const postSource = document.getElementById('postSource');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');
const takenAt = document.getElementById('takenAt');
const typeBadge = document.getElementById('typeBadge');
const description = document.getElementById('description');

const gallerySection = document.getElementById('gallerySection');
const imageGallery = document.getElementById('imageGallery');
const downloadGrid = document.getElementById('downloadGrid');

const commentsSection = document.getElementById('commentsSection');
const commentsList = document.getElementById('commentsList');

let currentData = null;

// Helper functions
function showLoading(show = true) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

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

function resetUI() {
  inputCard.style.display = 'block';
  resultArea.style.display = 'none';
  gallerySection.style.display = 'none';
  commentsSection.style.display = 'none';
  imageGallery.innerHTML = '';
  downloadGrid.innerHTML = '';
  commentsList.innerHTML = '';
  currentData = null;
}

async function downloadFile(url, filename) {
  try {
    showLoading(true);
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
    showLoading(false);
    Swal.fire({
      title: 'Downloaded!',
      text: 'File downloaded successfully',
      icon: 'success',
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2000
    });
  } catch (err) {
    showLoading(false);
    Swal.fire({
      title: 'Download Failed',
      text: 'Could not download file. Try opening the link directly.',
      icon: 'error',
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000
    });
    window.open(url, '_blank');
  }
}

window.downloadFile = downloadFile;

// Event Listeners
resetBtn.addEventListener('click', () => {
  igUrl.value = '';
  resetUI();
});

fetchBtn.addEventListener('click', async () => {
  const url = igUrl.value.trim();
  if (!url) {
    Swal.fire({
      title: 'Missing URL',
      text: 'Please paste an Instagram URL',
      icon: 'warning',
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2000
    });
    return;
  }

  showLoading(true);
  try {
    // Using API from lib/api/api.js
    const data = await fetchInstagramData(url);
    
    if (data && data.status && data.data) {
      const transformedData = transformApiResponse(data, url);
      
      if (transformedData.downloadUrls.length > 0) {
        currentData = transformedData;
        renderResults(transformedData, url);
        
        inputCard.style.display = 'none';
        resultArea.style.display = 'block';

        setTimeout(() => {
          resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);

        Swal.fire({
          title: 'Success!',
          text: 'Instagram content loaded',
          icon: 'success',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        throw new Error('No media found in the response');
      }
    } else {
      const msg = (data && data.message) ? data.message : 'Failed to retrieve Instagram data';
      Swal.fire({
        title: 'Failed',
        text: msg,
        icon: 'error',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
    }
  } catch (err) {
    Swal.fire({
      title: 'Error',
      text: err.message,
      icon: 'error',
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 4000
    });
  } finally {
    showLoading(false);
  }
});

igUrl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    fetchBtn.click();
  }
});

// Initialize
resetUI();
