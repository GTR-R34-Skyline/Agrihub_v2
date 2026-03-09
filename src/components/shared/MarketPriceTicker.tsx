import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CommodityPrice {
  name: string;
  emoji: string;
  price: number;
  change: number;
  unit: string;
}

// Simulated live prices — in production these would come from a market API
const basePrices: CommodityPrice[] = [
  { name: "Basmati Rice", emoji: "🌾", price: 4200, change: 0, unit: "quintal" },
  { name: "Wheat", emoji: "🌾", price: 2275, change: 0, unit: "quintal" },
  { name: "Cotton", emoji: "🏵️", price: 6800, change: 0, unit: "quintal" },
  { name: "Soybean", emoji: "🫘", price: 4500, change: 0, unit: "quintal" },
  { name: "Sugarcane", emoji: "🎋", price: 350, change: 0, unit: "quintal" },
  { name: "Tomato", emoji: "🍅", price: 2800, change: 0, unit: "quintal" },
  { name: "Onion", emoji: "🧅", price: 1900, change: 0, unit: "quintal" },
  { name: "Potato", emoji: "🥔", price: 1200, change: 0, unit: "quintal" },
];

export const MarketPriceTicker = () => {
  const [prices, setPrices] = useState<CommodityPrice[]>(() =>
    basePrices.map((p) => ({
      ...p,
      change: +(Math.random() * 6 - 3).toFixed(1),
    }))
  );

  // Simulate live price fluctuations every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((p) => {
          const delta = +(Math.random() * 4 - 2).toFixed(1);
          const newPrice = Math.max(100, p.price + Math.round(p.price * delta / 100));
          return { ...p, price: newPrice, change: delta };
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden border-y border-border bg-card/80 backdrop-blur-sm">
      <div className="flex animate-marquee items-center gap-8 py-2 px-4 whitespace-nowrap">
        {[...prices, ...prices].map((item, i) => (
          <div key={`${item.name}-${i}`} className="flex items-center gap-2 text-sm">
            <span>{item.emoji}</span>
            <span className="font-medium">{item.name}</span>
            <span className="font-bold">₹{item.price.toLocaleString("en-IN")}</span>
            <span className="text-xs text-muted-foreground">/{item.unit}</span>
            <span
              className={`flex items-center gap-0.5 text-xs font-medium ${
                item.change > 0
                  ? "text-emerald-600"
                  : item.change < 0
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {item.change > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : item.change < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {item.change > 0 ? "+" : ""}
              {item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
