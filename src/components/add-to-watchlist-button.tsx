"use client";

import { Star, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AddToWatchlistButtonProps {
  symbol: string;
  name?: string;
  companyName?: string;
  currentPrice?: number;
  className?: string;
}

export function AddToWatchlistButton({ symbol, name, companyName, currentPrice, className }: AddToWatchlistButtonProps) {
  const displayName = name || companyName;
  void currentPrice;
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isAdded) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, name: displayName }),
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
    <button
      onClick={handleClick}
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
        </>
      )}
      {isLoading && <span className="animate-pulse">...</span>}
    </button>
  );
}