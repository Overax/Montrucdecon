import type { Context } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

export default async (req: Request, context: Context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { projectName } = await req.json();

        if (!projectName || typeof projectName !== 'string' || !projectName.trim()) {
            return new Response(JSON.stringify({ message: 'Missing or invalid project name' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const apiKey = Netlify.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            return new Response(JSON.stringify({ message: 'Gemini API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Pour un projet de montage vidéo intitulé "${projectName}", suggère une liste de tâches typiques. Réponds avec une simple liste de points, chaque point commençant par un tiret. Ne mets pas de titre ou d'introduction.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in gemini-suggest-tasks function:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
