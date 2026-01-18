
export interface CasinoData {
  id: string; // Internal stable ID (usually placeId)
  placeId?: string; 
  name: string;
  rating: number;
  userRatingsTotal: number;
  vicinity: string;
  googleMapsUri: string;
}

export interface HistoricalSnapshot {
  timestamp: string;
  casinos: CasinoData[];
}

export interface BenchmarkResult {
  casinos: CasinoData[];
  lastUpdated: string;
  history: HistoricalSnapshot[];
}

// Fixed: Made uri and title optional to match the official @google/genai GroundingChunk schema.
export interface GroundingChunk {
  maps?: {
    uri?: string;
    title?: string;
    placeId?: string;
  };
}

/**
 * Assigns a permanent fixed color to major Batumi casinos.
 * Fallbacks to a deterministic color for unknown venues.
 */
export const getVenueColor = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('international')) return '#ef4444'; // Red (Subject Brand Color)
  if (n.includes('iveria')) return '#6366f1';        // Indigo
  if (n.includes('peace')) return '#8b5cf6';         // Violet
  if (n.includes('princess')) return '#ec4899';      // Pink
  if (n.includes('eclipse')) return '#f43f5e';       // Rose
  if (n.includes('otium')) return '#10b981';         // Emerald
  if (n.includes('soho')) return '#06b6d4';          // Cyan
  if (n.includes('royal')) return '#f59e0b';         // Amber/Gold
  if (n.includes('empire')) return '#84cc16';        // Lime
  if (n.includes('bellagio')) return '#059669';      // Emerald Green
  if (n.includes('billionaire') || n.includes('billioner')) return '#0ea5e9'; // Sky Blue
  if (n.includes('colosseum') || n.includes('collosseum')) return '#7c3aed'; // Deep Purple
  
  // Deterministic fallback for unmapped casinos
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308'];
  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = n.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
