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
        const { client, projects, notes } = await req.json();

        if (!client) {
            return new Response(JSON.stringify({ message: 'Missing client data' }), {
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

        const clientData = `
            Client: ${client.name} (${client.company})
            - Email: ${client.email}
            - Tags: ${client.tags.join(', ')}
        `;
        const projectsData = projects?.map((p: any) => 
            `- Projet: "${p.name}", Statut: ${p.status}, Revenu: ${p.estimatedRevenue}€, Échéance: ${new Date(p.deadline).toLocaleDateString()}`
        ).join('\n') || '';
        const notesData = notes?.map((n: any) => `- ${n.content}`).join('\n') || '';

        const prompt = `
            En tant que consultant stratégique pour un monteur vidéo freelance, effectue une analyse approfondie et complexe du client suivant.
            Utilise ta capacité de raisonnement avancée pour identifier des opportunités de croissance, des risques potentiels, et des suggestions pour améliorer la relation et la valeur à long terme.

            Voici les données complètes :

            **Informations sur le client :**
            ${clientData}

            **Projets avec ce client :**
            ${projectsData || "Aucun projet pour le moment."}

            **Notes sur ce client :**
            ${notesData || "Aucunes notes pour le moment."}

            Fournis une analyse stratégique structurée avec les sections suivantes :
            1.  **Synthèse et Potentiel :** Résume le profil du client et son potentiel de valeur (faible, moyen, élevé).
            2.  **Opportunités Clés :** Identifie 3 à 5 opportunités concrètes et actionnables pour augmenter les revenus ou la collaboration (ex: proposer des contrats de retainer, étendre les services à d'autres plateformes, etc.).
            3.  **Risques et Points de Vigilance :** Souligne les risques potentiels (ex: dépendance à un seul type de projet, concurrence, retards de paiement implicites dans les notes).
            4.  **Plan de Communication :** Suggère des angles et des moments clés pour aborder les opportunités identifiées avec le client.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in gemini-strategic-analysis function:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
