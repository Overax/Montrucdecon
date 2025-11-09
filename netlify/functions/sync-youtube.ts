import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { playlistId } = await req.json();

        if (!playlistId) {
            return new Response(JSON.stringify({ message: 'Missing playlistId parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = Netlify.env.get("YOUTUBE_API_KEY");
        if (!apiKey) {
            return new Response(JSON.stringify({ message: 'YouTube API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const API_URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
        
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            console.error("YouTube API Error:", data);
            if (data.error) {
                const reason = data.error.errors?.[0]?.reason;
                if (reason === 'badRequest' || reason === 'API_KEY_INVALID' || response.status === 400) {
                    return new Response(JSON.stringify({ message: 'YOUTUBE_API_KEY_INVALID' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                if (response.status === 404) {
                    return new Response(JSON.stringify({ message: 'PLAYLIST_NOT_FOUND' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
            return new Response(JSON.stringify({ message: 'YOUTUBE_API_ERROR' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const videos = data.items
            .filter((item: any) => item.snippet?.resourceId?.videoId)
            .map((item: any) => ({
                videoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                description: item.snippet.description.substring(0, 300),
                thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
                publishedAt: item.snippet.publishedAt
            }));

        return new Response(JSON.stringify({ videos }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in sync-youtube function:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
