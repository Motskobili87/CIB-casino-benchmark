
import React, { useState } from 'react';
import { RefreshCw, MapPin, Moon, Sun, Mail, Link as LinkIcon, Globe, ClipboardCheck } from 'lucide-react';

interface Props {
  lastUpdated: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenEmail: () => void;
  onCopyLink: () => Promise<boolean>;
}

const DashboardHeader: React.FC<Props> = ({ 
  lastUpdated, 
  onRefresh, 
  isRefreshing, 
  theme, 
  onToggleTheme, 
  onOpenEmail,
  onCopyLink 
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopyLink();
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const headerBg = theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <header className={`${headerBg} border-b p-4 md:px-6 md:py-4 sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300 shadow-sm no-print`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Globe className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${textColor} tracking-tight leading-none`}>Casino Benchmark</h1>
            <p className={`${subTextColor} text-[10px] font-black uppercase tracking-widest mt-1`}>Intelligence Engine</p>
          </div>
          
          <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 hidden sm:flex">
            <MapPin className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Batumi, Georgia</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all active:scale-95 text-[10px] font-black uppercase tracking-wider ${
                isCopied
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  : theme === 'dark' 
                    ? 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700' 
                    : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {isCopied ? <ClipboardCheck className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              <span className="hidden xl:inline">{isCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={onOpenEmail}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all active:scale-95 text-[10px] font-black uppercase tracking-wider ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden xl:inline">Export</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
            <button
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'Sync Market'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
