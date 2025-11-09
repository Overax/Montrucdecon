# Video Editor CRM - Backend Configuration

This project uses Netlify serverless functions to handle API calls securely.

## Environment Variables Setup

The following environment variables need to be configured in Netlify:

### 1. YouTube API Key
- **Variable Name**: `YOUTUBE_API_KEY`
- **Current Value**: `AIzaSyBavQiFP2bUrxu5BLRH3-VJKay4ujjhIBQ`
- **Purpose**: Used by the `/api/sync-youtube` endpoint to fetch videos from YouTube playlists
- **Scopes**: `builds`, `functions`

### 2. Gemini API Key
- **Variable Name**: `GEMINI_API_KEY`
- **Value**: You need to obtain this from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Purpose**: Used by the `/api/gemini-generate` endpoint for AI-powered task suggestions and action plans
- **Scopes**: `builds`, `functions`

## How to Set Environment Variables

### Option 1: Using Netlify UI (Recommended)
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Enter the variable name and value
5. Select **All scopes** or specific scopes (`builds`, `functions`)
6. Click **Save**

### Option 2: Using Netlify CLI
```bash
netlify env:set YOUTUBE_API_KEY "AIzaSyBavQiFP2bUrxu5BLRH3-VJKay4ujjhIBQ"
netlify env:set GEMINI_API_KEY "your-gemini-api-key-here"
```

## Backend Functions

### 1. `/api/sync-youtube`
- **Method**: POST
- **Description**: Fetches videos from a YouTube playlist
- **Request Body**:
  ```json
  {
    "playlistId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "videos": [
      {
        "videoId": "string",
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "publishedAt": "string"
      }
    ]
  }
  ```

### 2. `/api/gemini-generate`
- **Method**: POST
- **Description**: Generates AI-powered content using Google's Gemini API
- **Request Body**:
  ```json
  {
    "prompt": "string",
    "model": "gemini-2.0-flash-exp" // optional, defaults to gemini-2.0-flash-exp
  }
  ```
- **Response**:
  ```json
  {
    "text": "string"
  }
  ```

## Local Development

For local development, create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your API keys:

```
YOUTUBE_API_KEY=AIzaSyBavQiFP2bUrxu5BLRH3-VJKay4ujjhIBQ
GEMINI_API_KEY=your-gemini-api-key-here
```

Run the development server:

```bash
netlify dev
```

This will start the local server with functions emulation on port 8888.

## Security Notes

- API keys are stored securely in Netlify environment variables
- Never commit API keys to the repository
- The `.env` file is included in `.gitignore`
- All API calls are made from the backend to prevent exposing keys to the client

## Deployment

The functions will automatically deploy when you push to your connected Git repository. Make sure environment variables are set in Netlify before deployment.
