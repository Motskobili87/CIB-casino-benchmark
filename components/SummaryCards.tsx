
import React from 'react';
import { Star, Award, Users, Target, Crown, TrendingDown, TrendingUp } from 'lucide-react';
import { CasinoData } from '../types';

interface Props {
  casinos: CasinoData[];
  theme: 'dark' | 'light';
  subjectId: string | null;
}

const SummaryCards: React.FC<Props> = ({ casinos, theme, subjectId }) => {
  const subjectCasino = casinos.find(c => c.id === subjectId);

  const sortedByQuality = [...casinos].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.userRatingsTotal - a.userRatingsTotal;
  });
  
  const marketLeader = sortedByQuality[0];
  const sortedByReviews = [...casinos].sort((a, b) => b.userRatingsTotal - a.userRatingsTotal);
  
  const presenceRank = subjectCasino ? sortedByReviews.findIndex(c => c.id === subjectCasino.id) + 1 : null;
  const qualityRank = subjectCasino ? sortedByQuality.findIndex(c => c.id === subjectCasino.id) + 1 : null;
  
  const competitorCount = casinos.length > 0 ? casinos.length - 1 : 0;
  const avgRating = casinos.length ? (casinos.reduce((acc, c) => acc + c.rating, 0) / casinos.length) : 0;

  const vsAvg = subjectCasino ? (subjectCasino.rating - avgRating) : 0;
  const vsLeader = (subjectCasino && marketLeader) ? (subjectCasino.rating - marketLeader.rating) : 0;

  const cardBg = theme === 'dark' ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-slate-500' : 'text-slate-500';

  const DeltaDisplay = ({ delta }: { delta: number }) => {
    const isPositive = delta >= 0;
    const colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
    return (
      <span className={`inline-flex items-center gap-0.5 ${colorClass}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? '+' : ''}{delta.toFixed(1)}
      </span>
    );
  };

  const cards = [
    {
      title: "Subject Property Score",
      value: subjectCasino ? `${subjectCasino.rating.toFixed(1)} ★` : "Select Target",
      icon: <Star className="text-red-600" />,
      customSub: subjectCasino ? (
        <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-slate-800/50 dark:border-slate-700/30">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
            <span className={subTextColor}>VS Market Avg</span>
            <DeltaDisplay delta={vsAvg} />
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
            <span className={subTextColor}>VS Market Leader</span>
            <DeltaDisplay delta={vsLeader} />
          </div>
        </div>
      ) : null,
      highlight: !!subjectCasino
    },
    {
      title: "Market Position Ranks",
      value: presenceRank ? `#${presenceRank}` : "N/A",
      icon: <Award className="text-indigo-500" />,
      customSub: presenceRank ? (
        <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-slate-800/50 dark:border-slate-700/30">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
            <span className={subTextColor}>Presence (Volume)</span>
            <span className={`${textColor} font-bold`}>#{presenceRank}</span>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
            <span className={subTextColor}>Quality (Score)</span>
            <span className={`${textColor} font-bold`}>#{qualityRank}</span>
          </div>
        </div>
      ) : null,
      highlight: !!presenceRank
    },
    {
      title: "Market Leader",
      value: marketLeader?.name || "N/A",
      icon: <Crown className="text-yellow-500" />,
      sub: marketLeader ? `${marketLeader.rating.toFixed(1)} ★ | ${marketLeader.userRatingsTotal.toLocaleString()} Reviews` : "N/A",
      highlight: false
    },
    {
      title: "Competitive Landscape",
      value: casinos.length.toString(),
      icon: <Users className="text-blue-500" />,
      sub: "Active Entities Tracked",
      highlight: false
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-red-500/10' : 'bg-red-100'}`}>
            <Target className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h2 className={`text-2xl font-black tracking-tight leading-none ${textColor}`}>
              {subjectCasino?.name || "Benchmark Analysis"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-red-500/80' : 'text-red-700'}`}>
                {subjectCasino ? "Primary Benchmarking Subject" : "Select a casino from the registry to set target"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`${cardBg} border transition-all duration-300 p-5 rounded-2xl flex flex-col justify-between shadow-lg ${
              card.highlight 
                ? theme === 'dark' 
                  ? 'border-red-500/50 shadow-[0_10px_20px_rgba(239,68,68,0.1)] ring-1 ring-red-500/20' 
                  : 'border-red-400 shadow-[0_10px_20px_rgba(239,68,68,0.05)] ring-1 ring-red-200'
                : `${borderColor} hover:border-slate-400`
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`p-2 rounded-lg ${card.highlight ? (theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50') : (theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100')}`}>
                  {card.icon}
                </span>
              </div>
              <p className={`${subTextColor} text-[10px] font-black uppercase tracking-wider mb-1`}>{card.title}</p>
              <h3 className={`text-2xl font-black leading-tight ${card.highlight ? (theme === 'dark' ? 'text-red-50' : 'text-red-900') : textColor}`}>
                {card.value}
              </h3>
            </div>
            {card.customSub ? card.customSub : <p className={`${subTextColor} text-xs mt-3 font-semibold border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'} pt-3`}>{card.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards;
