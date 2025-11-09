import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

const GEMINI_API_KEY = functions.config().gemini.key;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const callGemini = functions.https.onCall(async (data, context) => {
  // Optionnel : Vérifiez si l'utilisateur est authentifié.
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     "unauthenticated",
  //     "The function must be called while authenticated."
  //   );
  // }

  const { prompt } = data;

  if (!prompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with one argument "prompt" containing the text to send to Gemini.'
    );
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return { result: response.data };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (axios.isAxiosError(error) && error.response) {
      // Si c'est une erreur Axios avec une réponse, nous pouvons obtenir plus de détails
      console.error("Gemini API response error:", error.response.data);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to call Gemini API.",
        error.response.data
      );
    }
    // Pour d'autres types d'erreurs
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred."
    );
  }
});

const YOUTUBE_API_KEY = functions.config().youtube.key;
const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

export const syncYouTubePlaylist = functions.https.onCall(async (data, context) => {
  const { playlistId } = data;

  if (!playlistId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function must be called with one argument "playlistId".'
    );
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: "snippet",
        playlistId: playlistId,
        maxResults: 50, // Limite de l'API, peut être augmenté avec la pagination
        key: YOUTUBE_API_KEY,
      },
    });

    const videos = response.data.items.map((item: any) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
    }));

    return { videos };
  } catch (error) {
    console.error("Error calling YouTube API:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("YouTube API response error:", error.response.data);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to call YouTube API.",
        error.response.data
      );
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while fetching YouTube data."
    );
  }
});
