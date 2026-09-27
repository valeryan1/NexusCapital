"use client";

import { Star, Check, ChevronDown, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AddToWatchlistButtonProps {
  symbol: string;
  name?: string;
  companyName?: string;
  currentPrice?: number;
  className?: string;
}

const COMMON_GROUPS = ["Bank", "Tech", "Bluechip", "Dividend", "Trading", "Default"];

export function AddToWatchlistButton({ symbol, name, companyName, currentPrice, className }: AddToWatchlistButtonProps) {
  const displayName = name || companyName;
  void currentPrice;
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [customGroup, setCustomGroup] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = async (groupName: string) => {
    setIsLoading(true);
    setIsOpen(false);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, name: displayName, groupName: groupName || "Default" }),
      });
      if (response.ok) {
        setIsAdded(true);
        window.dispatchEvent(new Event("nexus:notifications-updated"));
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => !isAdded && setIsOpen(!isOpen)}
        disabled={isAdded || isLoading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
          isAdded
            ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
            : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30",
          className
        )}
        aria-label={isAdded ? "Already in watchlist" : `Add ${symbol} to watchlist`}
      >
        {isAdded ? (
          <>
            <Check size={14} />
            <span>Added</span>
          </>
        ) : (
          <>
            <Star size={14} />
            <span>Watchlist</span>
            <ChevronDown size={12} className="ml-0.5 opacity-70" />
          </>
        )}
        {isLoading && <span className="animate-pulse ml-1">...</span>}
      </button>

      {isOpen && !isAdded && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-dark-800">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Pilih Group</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {COMMON_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => handleAdd(group)}
                  className="w-full text-left px-2 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-brand-500/20 hover:border-brand-500/30 border border-transparent rounded-md transition-colors"
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 bg-dark-950">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Grup Baru</p>
            <div className="flex gap-1">
              <input
                type="text"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                placeholder="Nama grup..."
                className="flex-1 min-w-0 bg-dark-800 border border-dark-700 rounded-md px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customGroup.trim()) {
                    e.preventDefault();
                    handleAdd(customGroup.trim());
                  }
                }}
              />
              <button
                onClick={() => customGroup.trim() && handleAdd(customGroup.trim())}
                disabled={!customGroup.trim()}
                className="p-1.5 bg-brand-500 text-white rounded-md hover:bg-brand-400 disabled:opacity-50 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}