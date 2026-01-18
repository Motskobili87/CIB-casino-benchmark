
import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ScatterChart, 
  Scatter, 
  ZAxis,
  ReferenceLine
} from 'recharts';
import { CasinoData, getVenueColor } from '../types';
import { Award, Target, Zap, BarChart3, TrendingUp } from 'lucide-react';

interface Props {
  casinos: CasinoData[];
  theme: 'dark' | 'light';
  subjectId: string | null;
}

const CustomTooltip = ({ active, payload, theme, totalVolume, allCasinos }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const share = totalVolume > 0 ? ((data.userRatingsTotal / totalVolume) * 100).toFixed(1) : "0";
    const tooltipBg = theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
    const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
    
    // Calculate rank by volume
    const sortedByVolume = [...allCasinos].sort((a, b) => b.userRatingsTotal - a.userRatingsTotal);
    const rank = sortedByVolume.findIndex(c => c.name === data.name) + 1;

    return (
      <div className={`${tooltipBg} border p-4 rounded-2xl shadow-2xl backdrop-blur-md min-w-[180px]`}>
        <div className="flex justify-between items-start mb-2">
          <p className={`${textColor} font-black text-sm uppercase tracking-tight`}>{data.name}</p>
          <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Rank #{rank}</span>
        </div>
        
        <div className="space-y-2 border-t border-slate-700/30 pt-2">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-[9px] font-black uppercase">Market Share</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-mono text-xs font-bold`}>{share}%</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-[9px] font-black uppercase">Review Volume</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-mono text-xs font-bold`}>{data.userRatingsTotal.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-amber-500 text-[9px] font-black uppercase">Avg Score</p>
            <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-mono text-xs font-bold`}>{data.rating.toFixed(1)} ★</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const Visualizations: React.FC<Props> = ({ casinos, theme, subjectId }) => {
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const labelColor = theme === 'dark' ? '#475569' : '#94a3b8';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  const validCasinos = casinos.filter(c => c.userRatingsTotal > 0);
  const totalVolume = validCasinos.reduce((acc, c) => acc + c.userRatingsTotal, 0);
  const avgRating = validCasinos.length > 0 
    ? validCasinos.reduce((acc, c) => acc + c.rating, 0) / validCasinos.length 
    : 0;

  const sortedData = [...casinos].sort((a, b) => b.userRatingsTotal - a.userRatingsTotal).slice(0, 10);
  const scatterData = casinos.map(c => ({
    ...c,
    x: c.userRatingsTotal,
    y: c.rating,
    z: 100
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Volume & Quality Hybrid Chart */}
      <div className={`${cardBg} border rounded-3xl p-8 shadow-sm flex flex-col h-[500px]`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${textColor}`}>
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Market Reach & Score
            </h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Review Share vs Average Score Benchmark</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                 <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                 <span className="text-[9px] font-black uppercase text-slate-500">Vol Share</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-3 h-0.5 bg-amber-400"></div>
                 <span className="text-[9px] font-black uppercase text-slate-500">Avg Score</span>
               </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 mt-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Market Avg: {avgRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sortedData} margin={{ left: 0, right: 0, top: 0, bottom: 40 }}>
              <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                type="category" 
                stroke={labelColor} 
                fontSize={8} 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontWeight: 800, fill: labelColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis yAxisId="volume" hide />
              <YAxis yAxisId="score" domain={[0, 5]} hide />
              <Tooltip 
                cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                content={<CustomTooltip theme={theme} totalVolume={totalVolume} allCasinos={casinos} />}
              />
              <Bar dataKey="userRatingsTotal" yAxisId="volume" radius={[4, 4, 0, 0]} barSize={32}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.id.includes('international') || entry.name.toLowerCase().includes('international') ? '#ef4444' : getVenueColor(entry.name)} 
                    fillOpacity={0.4}
                  />
                ))}
              </Bar>
              <ReferenceLine yAxisId="score" y={avgRating} stroke="#64748b" strokeDasharray="5 5" strokeWidth={1} label={{ position: 'right', value: 'AVG', fill: '#64748b', fontSize: 7, fontWeight: 900 }} />
              <Line 
                type="monotone" 
                dataKey="rating" 
                yAxisId="score" 
                stroke="#fbbf24" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: '#fbbf24' }}
                animationDuration={2000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matrix Scatter Chart */}
      <div className={`${cardBg} border rounded-3xl p-8 shadow-sm flex flex-col h-[500px]`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${textColor}`}>
              <Target className="w-5 h-5 text-emerald-500" /> Performance Matrix
            </h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Volume Reach (X) vs. Quality Rating (Y)</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
            <Award className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Benchmarking</span>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Reviews" 
                stroke={labelColor} 
                fontSize={10} 
                tick={{ fontWeight: 800 }}
                label={{ value: 'Review Volume', position: 'bottom', offset: -10, fontSize: 8, fontWeight: 900, fill: labelColor, textAnchor: 'middle' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Rating" 
                domain={[3.5, 5]} 
                stroke={labelColor} 
                fontSize={10} 
                tick={{ fontWeight: 800 }}
                label={{ value: 'Quality Score', angle: -90, position: 'insideLeft', offset: 10, fontSize: 8, fontWeight: 900, fill: labelColor }}
              />
              <ZAxis type="number" dataKey="z" range={[100, 1000]} />
              <Tooltip content={<CustomTooltip theme={theme} totalVolume={totalVolume} allCasinos={casinos} />} />
              <Scatter name="Casinos" data={scatterData}>
                {scatterData.map((entry, index) => {
                  const isSubject = entry.id.includes('international') || entry.name.toLowerCase().includes('international');
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isSubject ? '#ef4444' : getVenueColor(entry.name)} 
                      stroke={isSubject ? '#fff' : 'transparent'}
                      strokeWidth={2}
                      fillOpacity={isSubject ? 1 : 0.6}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
