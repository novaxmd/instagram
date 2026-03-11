// Real API for Instagram Downloader
// Inatumia API mbili: 
// 1. API library (kohi)
// 2. RapidAPI (kama server.js)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get URL from query params
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL parameter is required' 
    });
  }

  try {
    // Validate Instagram URL
    if (!url.includes('instagram.com/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Instagram URL'
      });
    }

    let videoUrl = null;
    let thumbnail = null;
    let username = null;
    let title = null;
    let apiUsed = '';

    // ============= TRY API 1: API Library (kohi) =============
    try {
      const apiUrl1 = 'https://api-library-kohi.onrender.com/api/alldl?url=' + encodeURIComponent(url);
      console.log('Trying API 1:', apiUrl1);
      
      const response1 = await fetch(apiUrl1, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Instagram-Downloader/1.0)'
        },
        timeout: 8000 // 8 seconds timeout
      });

      if (response1.ok) {
        const data1 = await response1.json();
        
        if (data1.status && data1.data) {
          // Get video URL
          if (data1.data.videoUrl) {
            videoUrl = data1.data.videoUrl;
            thumbnail = data1.data.thumbnail || '';
            username = data1.data.username || 'unknown';
            title = data1.data.title || 'Instagram Video';
            apiUsed = 'API Library';
            
            console.log('API 1 success - got video URL');
          } 
          // Handle images
          else if (data1.data.images && Array.isArray(data1.data.images) && data1.data.images.length > 0) {
            videoUrl = data1.data.images[0]; // First image as fallback
            thumbnail = data1.data.images[0];
            username = data1.data.username || 'unknown';
            title = data1.data.title || 'Instagram Post';
            apiUsed = 'API Library (image)';
          }
        }
      }
    } catch (error1) {
      console.log('API 1 failed:', error1.message);
    }

    // ============= TRY API 2: RapidAPI (kama server.js) =============
    if (!videoUrl) {
      try {
        console.log('Trying API 2: RapidAPI');
        
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '36df47fe85msh3a9315ba4c09b4bp1f7d86jsn5ad4f333be46', // Free RapidAPI key
            'x-rapidapi-host': 'instagram-reels-downloader-api.p.rapidapi.com'
          },
          timeout: 8000
        };

        // Try different RapidAPI endpoints
        const endpoints = [
          `https://instagram-reels-downloader-api.p.rapidapi.com/download?url=${encodeURIComponent(url)}`,
          `https://instagram-media-downloader.p.rapidapi.com/instagram?url=${encodeURIComponent(url)}`,
          `https://instagram-video-downloader-download-instagram-videos.p.rapidapi.com/index?url=${encodeURIComponent(url)}`
        ];

        for (const endpoint of endpoints) {
          try {
            const response2 = await fetch(endpoint, options);
            
            if (response2.ok) {
              const data2 = await response2.json();
              
              // Check different response formats
              if (data2.success && data2.data) {
                if (data2.data.medias && Array.isArray(data2.data.medias)) {
                  const videoMedia = data2.data.medias.find(m => m.type === 'video' || m.type === 'mp4');
                  if (videoMedia) {
                    videoUrl = videoMedia.url;
                    thumbnail = data2.data.thumbnail || videoMedia.thumbnail;
                    username = data2.data.author || data2.data.owner?.username;
                    title = data2.data.title || data2.data.caption;
                    apiUsed = 'RapidAPI';
                    break;
                  }
                } else if (data2.data.video_url || data2.data.videoUrl) {
                  videoUrl = data2.data.video_url || data2.data.videoUrl;
                  thumbnail = data2.data.thumbnail || data2.data.thumb;
                  username = data2.data.username || data2.data.author;
                  title = data2.data.title || data2.data.caption;
                  apiUsed = 'RapidAPI';
                  break;
                }
              } else if (data2.video_url || data2.download_url) {
                videoUrl = data2.video_url || data2.download_url;
                thumbnail = data2.thumbnail || data2.thumb;
                username = data2.username || data2.author;
                title = data2.title || data2.caption;
                apiUsed = 'RapidAPI';
                break;
              }
            }
          } catch (e) {
            console.log(`Endpoint ${endpoint} failed:`, e.message);
          }
        }
      } catch (error2) {
        console.log('API 2 failed:', error2.message);
      }
    }

    // ============= CHECK RESULT =============
    if (videoUrl) {
      // Prepare response
      const mediaData = {
        success: true,
        data: {
          title: title || 'Instagram Video',
          username: username || 'instagram_user',
          source: url,
          like_count: 0,
          comment_count: 0,
          taken_at: Math.floor(Date.now() / 1000),
          comments: [],
          downloadUrls: [{
            url: videoUrl,
            ext: 'mp4',
            thumb: thumbnail || videoUrl,
            type: 'video'
          }],
          mediaType: 'video',
          thumbnail: thumbnail || videoUrl,
          apiUsed: apiUsed // Kujua API ipi ilifanya kazi
        }
      };
      
      console.log(`Success using: ${apiUsed}`);
      return res.status(200).json(mediaData);
      
    } else {
      // Both APIs failed
      return res.status(404).json({
        success: false,
        error: 'Could not fetch video from any API. Please try again later.',
        details: 'Both API Library and RapidAPI failed'
      });
    }

  } catch (error) {
    console.error('API Error details:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch Instagram content'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
