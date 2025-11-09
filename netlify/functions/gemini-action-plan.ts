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
        const { notes } = await req.json();

        if (!notes || !Array.isArray(notes)) {
            return new Response(JSON.stringify({ message: 'Missing or invalid notes data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (notes.length === 0) {
            return new Response(JSON.stringify({ message: 'Veuillez ajouter au moins une note pour lancer l\'analyse.' }), {
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

        const notesContent = notes.map((n: any) => `- ${n.content}`).join('\n');
        const prompt = `
            En tant qu'assistant expert pour un monteur vidéo freelance, analyse les notes suivantes concernant un client. 
            Génère un plan d'action concis et pertinent sous forme de liste à puces. 
            Les actions doivent être directement exploitables (ex: "Proposer une série de 3 Reels sur le thème X", "Planifier un point sur le projet Y", "Envoyer la facture Z").
            
            Notes du client :
            ${notesContent}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in gemini-action-plan function:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
