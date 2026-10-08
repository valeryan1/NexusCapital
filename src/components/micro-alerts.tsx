import React, { useState, useEffect, useCallback } from 'react';
import { Zap, X, Plus, Filter } from 'lucide-react';

interface NewsItem {
  id: string;
  ticker: string;
  headline: string;
}

// 1. Mock Data Stream
const MOCK_NEWS_STREAM: NewsItem[] = [
  { id: '1', ticker: 'BBCA', headline: 'Foreign inflow surge detected, hits all-time high.' },
  { id: '2', ticker: 'GOTO', headline: 'New strategic partnership signed in Singapore.' }, // Ignore
  { id: '3', ticker: 'ADRO', headline: 'Dividend payout date announced for next month.' },
  { id: '4', ticker: 'TLKM', headline: 'Revenue drops slightly in Q3.' }, // Ignore
  { id: '5', ticker: 'BRMS', headline: 'Gold production target exceeded by 15%.' },
  { id: '6', ticker: 'BREN', headline: 'Acquires new geothermal plant.' }, // Ignore
  { id: '7', ticker: 'BBCA', headline: 'Interest rate cut boosts loan growth projections.' },
];

// --- Toast Item Component ---
interface ToastProps {
  news: NewsItem;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ news, onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for the animation to finish before removing from state
    setTimeout(() => onDismiss(news.id), 300);
  }, [news.id, onDismiss]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl 
        bg-[#0f1219]/80 backdrop-blur-md border border-slate-700/50 shadow-2xl
        transition-all duration-300 ease-in-out transform
        ${isClosing ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-8 fade-in'}
      `}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <div className="p-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
            <Zap size={14} className="text-blue-400" fill="currentColor" />
          </div>
        </div>
        
        {/* Content */}
        <div className="w-0 flex-1 flex flex-col gap-1">
          <p className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            Alert
            <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
              {news.ticker}
            </span>
          </p>
          <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-tight">
            {news.headline}
          </p>
        </div>

        {/* Close Button */}
        <div className="flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="rounded-md inline-flex text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <span className="sr-only">Close</span>
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Progress Bar (Visual indicator for 5s) */}
      <div className="h-[2px] w-full bg-slate-800">
        <div 
          className="h-full bg-blue-500 origin-left"
          style={{ animation: 'shrink 5s linear forwards' }}
        />
      </div>
    </div>
  );
};

interface ComplexRule {
  id: string;
  ticker: string;
  keyword: string;
}

// --- Main System Component ---
export const MicroAlertsSystem: React.FC = () => {
  const [rules, setRules] = useState<ComplexRule[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRuleTicker, setNewRuleTicker] = useState('');
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [activeAlerts, setActiveAlerts] = useState<NewsItem[]>([]);

  // Simulation Logic: Emit news every 3 seconds
  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex >= MOCK_NEWS_STREAM.length) {
        currentIndex = 0; // loop back for demo purposes
      }
      
      const incomingNews = MOCK_NEWS_STREAM[currentIndex];
      
      // CORE LOGIC: Evaluate complex rules
      const matchesRule = rules.length === 0 ? false : rules.some(rule => {
        const matchTicker = rule.ticker === '*' || incomingNews.ticker.toLowerCase() === rule.ticker.toLowerCase();
        const matchKeyword = rule.keyword === '' || incomingNews.headline.toLowerCase().includes(rule.keyword.toLowerCase());
        return matchTicker && matchKeyword;
      });

      if (matchesRule) {
        // Add a unique timestamp ID to allow duplicate news from loop
        const newAlert = { ...incomingNews, id: incomingNews.id + '-' + Date.now() };
        setActiveAlerts(prev => [...prev, newAlert]);
      }
      
      currentIndex++;
    }, 3000);

    return () => clearInterval(interval);
  }, [rules]);

  const removeAlert = useCallback((id: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const handleAddRule = () => {
    if (!newRuleTicker && !newRuleKeyword) return;
    setRules(prev => [...prev, { id: Date.now().toString(), ticker: newRuleTicker || '*', keyword: newRuleKeyword }]);
    setNewRuleTicker('');
    setNewRuleKeyword('');
    setShowRuleForm(false);
  };

  return (
    <>
      {/* Inject custom keyframes for the progress bar */}
      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>

      {/* Rules UI */}
      <div className="fixed top-4 right-4 z-50 p-4 bg-[#0f1219]/90 border border-slate-700 rounded-xl shadow-xl max-w-sm w-full text-slate-200 pointer-events-auto font-sans">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Filter size={16}/> Complex Rules</h3>
          <button onClick={() => setShowRuleForm(!showRuleForm)} className="p-1 hover:bg-slate-800 rounded">
            <Plus size={16} />
          </button>
        </div>
        
        {showRuleForm && (
          <div className="mb-4 flex flex-col gap-2 p-3 bg-slate-800/50 rounded-lg">
            <input 
              placeholder="Ticker (e.g. BBCA, or * for all)" 
              value={newRuleTicker} 
              onChange={e => setNewRuleTicker(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
            />
            <input 
              placeholder="Keyword in headline" 
              value={newRuleKeyword} 
              onChange={e => setNewRuleKeyword(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 rounded transition-colors">
              Add Rule
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
          {rules.length === 0 && <p className="text-xs text-slate-500">No active rules. Add one to see alerts.</p>}
          {rules.map(rule => (
            <div key={rule.id} className="flex justify-between items-center text-xs bg-slate-800 p-2 rounded border border-slate-700">
              <span className="truncate pr-2">
                <span className="font-bold text-blue-400">{rule.ticker === '*' ? 'ANY TICKER' : rule.ticker.toUpperCase()}</span>
                {rule.keyword && <span> + "{rule.keyword}"</span>}
              </span>
              <button 
                onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                className="text-slate-400 hover:text-red-400 p-1 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 
        Container for Toasts 
        Fixed at bottom-right. pointer-events-none so it doesn't block clicks 
        on the underlying app, but children (toasts) have pointer-events-auto 
      */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none font-sans">
        {activeAlerts.map(alert => (
          <Toast 
            key={alert.id} 
            news={alert} 
            onDismiss={removeAlert} 
          />
        ))}
      </div>
    </>
  );
};

export default MicroAlertsSystem;
