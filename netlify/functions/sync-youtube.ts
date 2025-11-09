import type { Context, Config } from "@netlify/functions";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

interface PlaylistItemSnippet {
  title: string;
  description: string;
  resourceId: {
    videoId: string;
  };
  thumbnails: {
    high?: {
      url: string;
    };
    medium?: {
      url: string;
    };
    default?: {
      url: string;
    };
  };
  publishedAt: string;
}

interface PlaylistItem {
  snippet: PlaylistItemSnippet;
}

interface YouTubePlaylistResponse {
  items: PlaylistItem[];
  nextPageToken?: string;
}

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ message: 'YouTube API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { playlistId } = await req.json();

    if (!playlistId) {
      return new Response(JSON.stringify({ message: 'playlistId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const videos: Array<{
      videoId: string;
      title: string;
      description: string;
      thumbnailUrl: string;
      publishedAt: string;
    }> = [];

    let pageToken: string | undefined = undefined;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('playlistId', playlistId);
      url.searchParams.append('maxResults', '50');
      url.searchParams.append('key', YOUTUBE_API_KEY);
      
      if (pageToken) {
        url.searchParams.append('pageToken', pageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error:', errorText);
        return new Response(JSON.stringify({ 
          message: 'YouTube API request failed',
          details: errorText
        }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data: YouTubePlaylistResponse = await response.json();

      data.items.forEach((item) => {
        const snippet = item.snippet;
        videos.push({
          videoId: snippet.resourceId.videoId,
          title: snippet.title,
          description: snippet.description,
          thumbnailUrl: snippet.thumbnails?.high?.url || 
                       snippet.thumbnails?.medium?.url || 
                       snippet.thumbnails?.default?.url || '',
          publishedAt: snippet.publishedAt,
        });
      });

      if (data.nextPageToken) {
        pageToken = data.nextPageToken;
      } else {
        hasMorePages = false;
      }
    }

    return new Response(JSON.stringify({ videos }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in sync-youtube function:', error);
    return new Response(JSON.stringify({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/sync-youtube"
};
