
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { HistoricalSnapshot, getVenueColor } from '../types';
import { TrendingUp, Clock } from 'lucide-react';

interface Props {
  history: HistoricalSnapshot[];
  theme: 'dark' | 'light';
}

const HistoryChart: React.FC<Props> = ({ history, theme }) => {
  const SUBJECT_KEY = "international";

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const labelColor = theme === 'dark' ? '#475569' : '#94a3b8';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  if (history.length < 2) {
    return (
      <div className={`${cardBg} border p-8 rounded-3xl h-[450px] flex flex-col items-center justify-center text-center shadow-sm`}>
        <div className="p-4 bg-indigo-500/10 rounded-2xl mb-4">
          <Clock className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <h3 className={`text-lg font-black uppercase tracking-tight ${textColor}`}>Growth Vector Warming Up</h3>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
          Historical trend analysis requires at least two market snapshots.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full transition-all duration-1000" 
              style={{ width: history.length === 1 ? '50%' : '5%' }}
            ></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
            {history.length}/2 Snapshots captured
          </span>
        </div>
        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-8 animate-bounce">
          Click "Sync Market" to record next snapshot
        </p>
      </div>
    );
  }

  const hasMultipleSameDay = history.some((s, idx) => {
    if (idx === 0) return false;
    const current = new Date(s.timestamp).toLocaleDateString();
    const prev = new Date(history[idx - 1].timestamp).toLocaleDateString();
    return current === prev;
  });

  const chartData = history.map(snapshot => {
    const d = new Date(snapshot.timestamp);
    const dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const label = hasMultipleSameDay ? `${dateLabel} ${timeLabel}` : dateLabel;
    
    const entry: any = {
      date: label,
      fullDate: d.toLocaleString()
    };
    snapshot.casinos.forEach(casino => {
      entry[casino.name] = casino.userRatingsTotal;
    });
    return entry;
  });

  const casinoNames: string[] = Array.from(new Set(history.flatMap(s => s.casinos.map(c => c.name))));

  return (
    <div className={`${cardBg} border p-8 rounded-3xl h-[450px] shadow-sm flex flex-col`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className={`text-lg font-black uppercase tracking-tight flex items-center gap-2 ${textColor}`}>
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Growth Vector
          </h3>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Review Volume Trends over Time</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[9px] text-red-600 font-black uppercase tracking-widest">Subject</span>
          </div>
          <div className="w-px h-3 bg-slate-700/50"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-slate-500 rounded-full opacity-40"></div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Market Cluster</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 110, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke={labelColor} 
              fontSize={9} 
              tickMargin={12} 
              tick={{ fontWeight: 800 }}
              axisLine={{ opacity: 0.1 }}
            />
            <YAxis 
              stroke={labelColor} 
              fontSize={11} 
              tick={{ fontWeight: 800 }}
              axisLine={{ opacity: 0.1 }}
            />
            <Tooltip 
              itemSorter={(item) => -(item.value as number)}
              contentStyle={{ 
                backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                border: `1px solid ${theme === 'dark' ? '#1e293b' : '#f1f5f9'}`, 
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
              labelStyle={{ fontSize: '10px', fontWeight: 900, color: '#6366f1', marginBottom: '8px', textTransform: 'uppercase' }}
              itemStyle={{ fontSize: '10px', fontWeight: 800, padding: '2px 0' }}
              labelFormatter={(value, payload) => payload?.[0]?.payload?.fullDate || value}
            />
            {casinoNames.map((name) => {
              const isSubject = name.toLowerCase().includes(SUBJECT_KEY);
              const venueColor = getVenueColor(name);
              return (
                <Line 
                  key={name}
                  type="monotone" 
                  dataKey={name} 
                  stroke={venueColor} 
                  strokeWidth={isSubject ? 4 : 1.5}
                  strokeOpacity={isSubject ? 1 : 0.3}
                  dot={isSubject ? { r: 4, fill: venueColor, stroke: theme === 'dark' ? '#0f172a' : '#fff', strokeWidth: 1.5 } : false}
                  activeDot={{ r: isSubject ? 6 : 4, strokeWidth: 0 }}
                  animationDuration={1500}
                  connectNulls
                  isAnimationActive={false}
                >
                  <LabelList 
                    dataKey={name}
                    position="right"
                    content={(props: any) => {
                      const { x, y, index } = props;
                      if (index === chartData.length - 1) {
                        return (
                          <text 
                            x={x + 10} 
                            y={y + 4} 
                            fill={venueColor} 
                            fontSize={8} 
                            fontWeight={900} 
                            textAnchor="start" 
                            className="uppercase tracking-tighter"
                            style={{ opacity: isSubject ? 1 : 0.7 }}
                          >
                            {name.replace(/Casino/gi, '').trim()}
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Line>
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
