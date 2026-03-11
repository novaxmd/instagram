// Real API for Instagram Downloader
// Inatumia API ile ile iliyokuwa kwenye code yako

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

    // TUMIA API ILE ILE - KAMA KWENYE CODE YAKO
    const apiUrl = 'https://api-library-kohi.onrender.com/api/alldl?url=' + encodeURIComponent(url);
    
    console.log('Fetching from:', apiUrl); // Kwa debugging
    
    const response = await fetch(apiUrl, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Instagram-Downloader/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error('API returned HTTP ' + response.status);
    }

    const data = await response.json();
    console.log('API Response:', data); // Kwa debugging

    // Check if the response has the expected structure (kama ilivyo kwenye code yako)
    if (data.status && data.data) {
      
      // Transform data kama ilivyo kwenye code yako
      const downloadUrls = [];
      
      // Handle different media types - EXACTLY kama code yako
      if (data.data.images && Array.isArray(data.data.images)) {
        // For carousel posts with multiple images
        data.data.images.forEach((img, index) => {
          downloadUrls.push({
            url: img,
            ext: 'jpg',
            thumb: img,
            type: 'image'
          });
        });
      } else if (data.data.videoUrl) {
        // For video/reel posts
        downloadUrls.push({
          url: data.data.videoUrl,
          ext: 'mp4',
          thumb: data.data.thumbnail || '',
          type: 'video'
        });
      }

      // Prepare response kwa frontend
      const mediaData = {
        success: true,
        data: {
          title: data.data.title || 'Instagram Post',
          username: data.data.username || 'unknown',
          source: url,
          like_count: data.data.like_count || 0,
          comment_count: data.data.comment_count || 0,
          taken_at: Math.floor(Date.now() / 1000),
          comments: data.data.comments || [],
          downloadUrls: downloadUrls,
          mediaType: data.data.videoUrl ? 'video' : 'image',
          thumbnail: data.data.thumbnail || (downloadUrls[0]?.thumb || '')
        }
      };
      
      return res.status(200).json(mediaData);
      
    } else {
      // Kama API imereturn error
      const errorMsg = (data && data.message) ? data.message : 'Failed to retrieve Instagram data';
      return res.status(400).json({
        success: false,
        error: errorMsg
      });
    }

  } catch (error) {
    console.error('API Error details:', error);
    
    // Return error
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
