// Simulated API for Instagram downloader
// In production, this would connect to a real Instagram downloader API

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Determine media type from URL
    const isReel = url.includes('/reel/');
    const isPost = url.includes('/p/');
    const isStory = url.includes('/stories/');

    // Generate mock data based on URL
    const mockData = {
      success: true,
      data: {
        title: isReel ? 'Instagram Reel' : 'Instagram Post',
        username: 'instagram_user_' + Math.floor(Math.random() * 1000),
        mediaType: isReel ? 'video' : 'image',
        downloadUrl: isReel 
          ? 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
          : 'https://picsum.photos/800/800',
        thumbnail: 'https://picsum.photos/400/400',
        filename: `instagram_${Date.now()}.${isReel ? 'mp4' : 'jpg'}`,
        dimensions: isReel ? '720x1280' : '1080x1080',
        duration: isReel ? '00:30' : null
      }
    };

    // In production, you would:
    // 1. Call actual Instagram downloader API
    // 2. Process and validate the response
    // 3. Return real download URLs

    return res.status(200).json(mockData);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch Instagram content' 
    });
  }
}

// For Vercel serverless functions
export const config = {
  api: {
    bodyParser: true,
  },
};
