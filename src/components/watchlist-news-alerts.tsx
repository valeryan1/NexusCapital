import React, { useState, useMemo } from 'react';
import { Bell, Clock, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: string;
  ticker: string;
  headline: string;
  timestamp: string;
  isUnread: boolean;
}

// 1. Mock Global News Data
const GLOBAL_NEWS: NewsItem[] = [
  { id: 'n1', ticker: 'BBCA', headline: 'Q3 Earnings Exceed Expectations, Loan Growth Hits Double Digits', timestamp: '15 mins ago', isUnread: true },
  { id: 'n2', ticker: 'GOTO', headline: 'Management Announces Strategic Partnership with Global Tech Giant', timestamp: '1 hour ago', isUnread: false }, // Will be filtered out
  { id: 'n3', ticker: 'ADRO', headline: 'Coal Production Target Adjusted Downward Amid Heavy Rains', timestamp: '2 hours ago', isUnread: true },
  { id: 'n4', ticker: 'TLKM', headline: 'Expands Data Center Capacity in Cikarang', timestamp: '4 hours ago', isUnread: false }, // Will be filtered out
  { id: 'n5', ticker: 'BRMS', headline: 'New Gold Vein Discovered at Palu Concession', timestamp: '5 hours ago', isUnread: false },
];

export const WatchlistNewsAlerts: React.FC = () => {
  // 2. Mock State for User's Watchlist
  const [watchlist] = useState<string[]>(['BBCA', 'ADRO', 'BRMS']);

  // 3. CORE LOGIC: Filter global news based on watchlist
  const watchlistNews = useMemo(() => {
    return GLOBAL_NEWS.filter(news => watchlist.includes(news.ticker));
  }, [watchlist]);

  return (
    <div className="flex flex-col w-full max-w-sm h-[500px] bg-[#0A0D12] border border-slate-800 rounded-xl overflow-hidden font-sans shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#11141A]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-blue-500" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Watchlist News</h2>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
          <span className="text-[10px] font-medium text-slate-300">
            {watchlist.length} Tickers
          </span>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {watchlistNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs text-center px-4">
            <p>No recent news for your watched tickers.</p>
          </div>
        ) : (
          watchlistNews.map((news) => (
            <div 
              key={news.id} 
              className="relative group p-3 rounded-lg border border-slate-800/50 bg-[#13171F] hover:bg-[#181D26] hover:border-slate-700 transition-all cursor-pointer"
            >
              {/* Unread Indicator */}
              {news.isUnread && (
                <div className="absolute top-3 left-2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}

              <div className={`flex flex-col gap-1.5 ${news.isUnread ? 'pl-3' : 'pl-0'}`}>
                {/* Top Row: Ticker & Time */}
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-wider border border-blue-500/20">
                    {news.ticker}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={10} />
                    {news.timestamp}
                  </div>
                </div>

                {/* Headline */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-xs leading-snug line-clamp-2 ${news.isUnread ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                    {news.headline}
                  </h3>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
