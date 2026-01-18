
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CasinoData, BenchmarkResult, HistoricalSnapshot } from './types';
import { fetchCasinoData } from './services/geminiService';
import DashboardHeader from './components/DashboardHeader';
import SummaryCards from './components/SummaryCards';
import Visualizations from './components/Visualizations';
import HistoryChart from './components/HistoryChart';
import EmailModal from './components/EmailModal';
import { 
  ExternalLink, 
  Star, 
  StarHalf,
  MapPin, 
  Search, 
  Target,
  Trophy,
  AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'batumi_casino_registry_v18'; // Incremented version to ensure fresh storage logic
const THEME_KEY = 'batumi_casino_theme';

const FIXED_MARKET_ENTITIES = [
  { name: "Casino International", placeId: "ChIJuXW-p9-HZ0ARF0k28v9fE-g" },
  { name: "Casino Iveria Batumi", placeId: "ChIJ7wL_S9yHZ0ARmH1f_9fE-g" },
  { name: "Casino Peace", placeId: "ChIJQ67_S9yHZ0AR-H1f_9fE-g" },
  { name: "Princess Casino", placeId: "ChIJtX_S_9yHZ0ARiH1f_9fE-g" },
  { name: "Eclipse Casino", placeId: "ChIJu_S_S9yHZ0ARmX1f_9fE-g" },
  { name: "Casino Otium", placeId: "ChIJu-Otium-PlaceID" },
  { name: "Casino Soho", placeId: "ChIJTR0cAQCHZ0ARE7aWIZhZGuU" },
  { name: "Royal Casino", placeId: "ChIJRoyal-Casino-PlaceID" },
  { name: "Empire Casino", placeId: "ChIJEmpire-Casino-PlaceID" },
  { name: "Grand Bellagio", placeId: "ChIJCz76Zk-FZ0ARz1T95QGgJA8" },
  { name: "Billionaire Casino", placeId: "ChIJ8U3Z0teHZ0AR8_6pXn_pXnc" },
  { name: "Casino Colosseum", placeId: "ChIJYYGQeIuFZ0ARmkcRZU1VJOA" }
];

const getCanonicalKey = (name: string) => name.toLowerCase()
  .replace(/casino/g, '')
  .replace(/batumi/g, '')
  .replace(/[^a-z0-9]/g, '')
  .trim();

type SortConfig = {
  key: keyof CasinoData | null;
  direction: 'asc' | 'desc';
};

const RenderStars = ({ rating, theme }: { rating: number, theme: 'dark' | 'light' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<StarHalf key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
    } else {
      stars.push(<Star key={i} className={`w-3 h-3 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />);
    }
  }
  return <div className="flex items-center gap-0.5 mt-1">{stars}</div>;
};

const App: React.FC = () => {
  const [data, setData] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isExternalReport, setIsExternalReport] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'userRatingsTotal', direction: 'desc' });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved as 'dark' | 'light') || 'dark';
  });

  const SUBJECT_KEY = "international";
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const headerTextColor = theme === 'dark' ? 'text-white' : 'text-slate-400';
  const subTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-500';

  const subjectId = useMemo(() => {
    if (!data) return null;
    const subject = data.casinos.find(c => c.name.toLowerCase().includes(SUBJECT_KEY));
    return subject ? subject.id : null;
  }, [data]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  const requestSort = (key: keyof CasinoData) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getLiveLink = useCallback(() => {
    const url = new URL(window.location.href);
    return `${url.origin}${url.pathname}`;
  }, []);

  const getSnapshotLink = useCallback(() => {
    if (!data) return getLiveLink();
    try {
      const minData = data.casinos.map(c => ({
        n: c.name,
        r: c.rating,
        v: c.userRatingsTotal,
        p: c.placeId
      }));
      const payload = { c: minData, u: data.lastUpdated, t: theme };
      const json = JSON.stringify(payload);
      const encoded = btoa(encodeURIComponent(json));
      return `${getLiveLink()}#rpt=${encoded}`;
    } catch (e) {
      return getLiveLink();
    }
  }, [data, theme, getLiveLink]);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error("Clipboard API unavailable");
    } catch (err) {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const success = document.execCommand('copy');
      document.body.removeChild(input);
      return success;
    }
  };

  const handleCopyLiveLink = useCallback(async () => await copyToClipboard(getLiveLink()), [getLiveLink]);
  const handleCopySnapshotLink = useCallback(async () => await copyToClipboard(getSnapshotLink()), [getSnapshotLink]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    let lat: number | undefined;
    let lng: number | undefined;
    
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (e) {}

    try {
      const liveResults = await fetchCasinoData("Batumi, Georgia", lat, lng, FIXED_MARKET_ENTITIES);
      const now = new Date().toISOString();
      
      setData(prev => {
        const registry = new Map<string, CasinoData>();
        
        FIXED_MARKET_ENTITIES.forEach(entity => {
          const prevEntry = prev?.casinos.find(c => c.placeId === entity.placeId);
          registry.set(entity.placeId, prevEntry || {
            id: entity.placeId,
            placeId: entity.placeId,
            name: entity.name, 
            rating: 0,
            userRatingsTotal: 0,
            vicinity: "Searching Market...",
            googleMapsUri: `https://www.google.com/maps/search/${encodeURIComponent(entity.name)}`
          });
        });

        liveResults.forEach(updated => {
          let targetId: string | null = null;
          if (updated.placeId && registry.has(updated.placeId)) {
            targetId = updated.placeId;
          } else {
            const updatedNorm = getCanonicalKey(updated.name);
            for (const [id, current] of registry.entries()) {
              const fixedNorm = getCanonicalKey(current.name);
              if (updatedNorm === fixedNorm || updatedNorm.includes(fixedNorm) || fixedNorm.includes(updatedNorm)) {
                targetId = id;
                break;
              }
            }
          }

          if (targetId) {
            const existing = registry.get(targetId)!;
            if (updated.userRatingsTotal > 0) {
              registry.set(targetId, {
                ...existing,
                rating: updated.rating,
                userRatingsTotal: updated.userRatingsTotal,
                vicinity: updated.vicinity || existing.vicinity,
                googleMapsUri: updated.googleMapsUri || existing.googleMapsUri,
                name: existing.name
              });
            }
          }
        });

        const finalCasinos = Array.from(registry.values());
        const history = prev?.history ? [...prev.history] : [];
        
        const lastEntry = history[history.length - 1];
        const lastTime = lastEntry ? new Date(lastEntry.timestamp).getTime() : 0;
        const currentTime = new Date(now).getTime();
        const hasData = finalCasinos.some(c => c.userRatingsTotal > 0);
        
        const countsChanged = !lastEntry || JSON.stringify(lastEntry.casinos.map(c => c.userRatingsTotal)) !== JSON.stringify(finalCasinos.map(c => c.userRatingsTotal));
        const isNewDay = !lastEntry || new Date(lastEntry.timestamp).toDateString() !== new Date(now).toDateString();
        const sixHoursElapsed = currentTime - lastTime > 6 * 60 * 60 * 1000;

        // Recording logic:
        // 1. If data changed, always record.
        // 2. If it's a new calendar day, record.
        // 3. If no change, only record every 6 hours to avoid filling the 1000-item buffer with redundant same-day session data.
        if (hasData && (countsChanged || isNewDay || sixHoursElapsed)) {
          history.push({ timestamp: now, casinos: finalCasinos });
        }
        
        const newResult: BenchmarkResult = {
          casinos: finalCasinos,
          lastUpdated: now,
          history: history.slice(-1000) // Increased buffer size to preserve long-term history
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newResult));
        return newResult;
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    const rptMatch = hash.match(/#(?:report|rpt)=(.+)/);
    if (rptMatch) {
      try {
        const encoded = rptMatch[1];
        const json = decodeURIComponent(atob(encoded));
        const payload = JSON.parse(json);
        
        const casinos = (payload.c || []).map((p: any) => ({
          id: p.p || p.id || Math.random().toString(),
          placeId: p.p || p.placeId,
          name: p.n || p.name,
          rating: p.r || p.rating,
          userRatingsTotal: p.v || p.userRatingsTotal,
          vicinity: p.address || "Snapshot Location",
          googleMapsUri: `https://www.google.com/maps/search/${encodeURIComponent(p.n || p.name)}`
        }));

        setData({ casinos, lastUpdated: payload.u || payload.updated, history: [] });
        if (payload.t) setTheme(payload.t);
        setIsExternalReport(true);
        return;
      } catch (e) {
        console.error("Failed to parse report URL", e);
      }
    }

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed: BenchmarkResult = JSON.parse(cached);
      setData(parsed);
      const lastUpdate = new Date(parsed.lastUpdated);
      const today9AM = new Date();
      today9AM.setHours(9, 0, 0, 0);
      if (new Date() > today9AM && lastUpdate < today9AM) refreshData();
    } else {
      refreshData();
    }
  }, [refreshData]);

  const processedCasinos = useMemo(() => {
    if (!data) return [];
    let list = data.casinos.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (sortConfig.key) {
      list.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === 'asc' 
          ? String(aVal).localeCompare(String(bVal)) 
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return list;
  }, [data, searchTerm, sortConfig]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300 pb-12`}>
      <DashboardHeader 
        lastUpdated={data?.lastUpdated || null}
        onRefresh={() => refreshData()}
        isRefreshing={loading}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenEmail={() => setIsEmailModalOpen(true)}
        onCopyLink={handleCopyLiveLink}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8" id="dashboard-capture-root">
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-500">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => refreshData()} className="ml-auto text-xs font-black uppercase bg-rose-500 text-white px-4 py-2 rounded-lg">Retry</button>
          </div>
        )}

        {data ? (
          <>
            <SummaryCards casinos={data.casinos} theme={theme} subjectId={subjectId} />
            <div className="grid grid-cols-1 gap-8 mb-8">
               <Visualizations casinos={data.casinos} theme={theme} subjectId={subjectId} />
               {!isExternalReport && <HistoryChart history={data.history} theme={theme} />}
            </div>

            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-xl'} border rounded-3xl overflow-hidden no-print`}>
              <div className="p-6 border-b border-slate-800/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <h3 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${textColor}`}>
                    <Trophy className="w-4 h-4 text-red-500" /> Market Registry
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Standalone Entity Benchmarks</p>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search venues..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} text-sm outline-none focus:ring-2 focus:ring-red-500/50`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className={`${theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-100/50'}`}>
                    <tr>
                      <th onClick={() => requestSort('name')} className="p-5 cursor-pointer w-[45%]">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${headerTextColor}`}>Venue</div>
                      </th>
                      <th onClick={() => requestSort('rating')} className="p-5 cursor-pointer w-[20%]">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${headerTextColor}`}>Score</div>
                      </th>
                      <th onClick={() => requestSort('userRatingsTotal')} className="p-5 cursor-pointer text-right w-[20%]">
                        <div className={`flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest ${headerTextColor}`}>Volume</div>
                      </th>
                      <th className="p-5 text-center w-[15%]"><span className={`text-[10px] font-black uppercase tracking-widest ${headerTextColor}`}>Maps</span></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-800/10'}`}>
                    {processedCasinos.map((c, idx) => {
                      const isSubject = c.id.includes(SUBJECT_KEY) || c.name.toLowerCase().includes(SUBJECT_KEY);
                      const rowTextColor = isSubject ? (theme === 'dark' ? 'text-red-400' : 'text-red-700') : (theme === 'dark' ? 'text-white' : 'text-slate-900');
                      const hasData = c.userRatingsTotal > 0;
                      
                      return (
                        <tr key={c.id} className={`${isSubject ? (theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50') : ''} ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-800/5'} transition-all group relative`}>
                          <td className="p-5 relative">
                            {isSubject && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 flex-shrink-0 rounded-md flex items-center justify-center text-[10px] font-black ${isSubject ? 'bg-red-600 text-white' : (theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500')}`}>
                                {isSubject ? <Target className="w-3 h-3" /> : idx + 1}
                              </span>
                              <div className="min-w-0">
                                <span className={`font-bold text-sm truncate block ${rowTextColor}`}>{c.name}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <MapPin className={`w-3 h-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`} />
                                  <span className={`text-[10px] font-medium truncate ${subTextColor}`}>{c.vicinity}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            {hasData ? (
                              <div className="flex flex-col">
                                <span className={`font-mono font-black text-sm ${rowTextColor}`}>{c.rating.toFixed(1)}</span>
                                <RenderStars rating={c.rating} theme={theme} />
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-black uppercase italic ${theme === 'dark' ? 'text-slate-200' : 'text-slate-500'}`}>Pending...</span>
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(i => <Star key={i} className={`w-2.5 h-2.5 ${theme === 'dark' ? 'text-slate-800' : 'text-slate-200'}`} />)}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-right">
                            <span className={`font-mono font-bold text-sm ${rowTextColor}`}>
                              {hasData ? c.userRatingsTotal.toLocaleString() : "---"}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <a href={c.googleMapsUri} target="_blank" className="inline-flex p-2 rounded-xl bg-slate-800/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-black uppercase tracking-widest text-sm text-slate-500">Syncing Market Benchmarks...</p>
          </div>
        )}
      </main>

      {data && (
        <EmailModal 
          isOpen={isEmailModalOpen} 
          onClose={() => setIsEmailModalOpen(false)} 
          theme={theme} 
          defaultSubject={`BATUMI CASINO REPORT - ${new Date().toLocaleDateString()}`} 
          defaultBody={""} 
          casinos={data.casinos} 
          onCopyLiveLink={handleCopyLiveLink}
          onCopySnapshot={handleCopySnapshotLink}
        />
      )}
    </div>
  );
};

export default App;
