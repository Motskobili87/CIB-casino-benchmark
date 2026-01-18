
import { GoogleGenAI } from "@google/genai";
import { CasinoData, GroundingChunk } from "../types";

/**
 * Using gemini-2.5-flash which is mandatory for Google Maps grounding tools.
 */
const MODEL_NAME = 'gemini-2.5-flash';

interface TargetEntity {
  name: string;
  placeId: string;
}

export const fetchCasinoData = async (
  location: string = "Batumi, Georgia", 
  lat?: number, 
  lng?: number,
  targets: TargetEntity[] = []
): Promise<CasinoData[]> => {
  // Fixed: Initializing with process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const targetInstructions = targets.map(t => `- ${t.name} (REQUIRED Place ID: ${t.placeId})`).join('\n');

  const prompt = `
    REAL-TIME MARKET RESEARCH TASK: 
    Perform a live lookup of the following CASINO entities in ${location}. 
    
    TARGET VENUES (PRIORITY):
    ${targetInstructions}

    CRITICAL RULES:
    - You MUST find and report data for ALL listed target venues.
    - Differentiate between the "Hotel" listing and the "Casino" listing. Report the Casino's ratings.
    - If a venue has multiple entries, pick the one that matches the provided Place ID exactly.
    - Grand Bellagio and Casino Colosseum are essential; do not skip them.

    Format the response as a Markdown table:
    | Venue Name | Rating | Review Count | Place ID | Address |
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: (lat && lng) ? { latitude: lat, longitude: lng } : undefined
          }
        },
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    // Fixed: Cast grounding chunks to any before assigning to local GroundingChunk[] to bypass strict type mismatch with internal SDK types.
    const chunks: GroundingChunk[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any) || [];

    return parseCasinoResponse(text, chunks);
  } catch (error) {
    console.error("Gemini Market Sync Error:", error);
    return [];
  }
};

const parseCasinoResponse = (text: string, chunks: GroundingChunk[]): CasinoData[] => {
  const casinoMap = new Map<string, CasinoData>();
  const lines = text.split('\n');

  lines.forEach((row) => {
    if ((row.match(/\|/g) || []).length >= 4) {
      const parts = row.split('|').map(p => p.trim());
      const cols = parts.filter(p => p !== '');
      
      // Header detection
      if (cols.length >= 4 && !cols[0].toLowerCase().includes('name') && !cols[0].includes('---')) {
        const name = cols[0];
        const ratingStr = cols[1];
        const reviewsStr = cols[2];
        const placeId = cols[3];
        const address = cols[4] || "N/A";

        const ratingMatch = ratingStr.match(/[\d.]+/);
        const rating = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
        
        const reviewsMatch = reviewsStr.replace(/,/g, '').match(/\d+/);
        const reviews = reviewsMatch ? parseInt(reviewsMatch[0]) : 0;

        // Use Place ID as primary key if valid, else normalized name
        const key = (placeId && placeId.length > 5) ? placeId : name.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (key && reviews > 0) {
          casinoMap.set(key, {
            id: key,
            placeId: placeId,
            name,
            rating,
            userRatingsTotal: reviews,
            vicinity: address,
            googleMapsUri: `https://www.google.com/maps/search/${encodeURIComponent(name)}`
          });
        }
      }
    }
  });

  // Cross-reference with Grounding Chunks for verified URIs and Place IDs
  chunks.forEach((chunk) => {
    if (chunk.maps?.title) {
      const title = chunk.maps.title;
      const chunkPlaceId = chunk.maps.placeId;
      
      let existing = chunkPlaceId ? casinoMap.get(chunkPlaceId) : null;
      
      if (!existing) {
        const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (let [key, val] of casinoMap.entries()) {
          const normExisting = val.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (normExisting.includes(normTitle) || normTitle.includes(normExisting)) {
            existing = val;
            break;
          }
        }
      }

      // Fixed: Safe property access with optional chaining and explicit check for uri.
      if (existing && chunk.maps) {
        if (chunk.maps.uri) {
          existing.googleMapsUri = chunk.maps.uri;
        }
        if (!existing.placeId && chunkPlaceId) existing.placeId = chunkPlaceId;
      }
    }
  });

  return Array.from(casinoMap.values());
};
