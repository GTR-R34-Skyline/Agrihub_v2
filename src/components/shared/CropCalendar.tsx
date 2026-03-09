import { Calendar as CalendarIcon, Sprout } from "lucide-react";

interface CropSeason {
  crop: string;
  emoji: string;
  sowing: string;
  harvest: string;
  season: "Kharif" | "Rabi" | "Zaid";
  months: number[]; // 0-indexed months
}

const cropCalendarData: CropSeason[] = [
  { crop: "Rice", emoji: "🌾", sowing: "Jun-Jul", harvest: "Oct-Nov", season: "Kharif", months: [5, 6, 7, 8, 9, 10] },
  { crop: "Wheat", emoji: "🌾", sowing: "Oct-Nov", harvest: "Mar-Apr", season: "Rabi", months: [9, 10, 11, 0, 1, 2, 3] },
  { crop: "Cotton", emoji: "🏵️", sowing: "Apr-May", harvest: "Oct-Dec", season: "Kharif", months: [3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { crop: "Maize", emoji: "🌽", sowing: "Jun-Jul", harvest: "Sep-Oct", season: "Kharif", months: [5, 6, 7, 8, 9] },
  { crop: "Mustard", emoji: "🌼", sowing: "Oct-Nov", harvest: "Feb-Mar", season: "Rabi", months: [9, 10, 11, 0, 1, 2] },
  { crop: "Sugarcane", emoji: "🎋", sowing: "Feb-Mar", harvest: "Jan-Mar", season: "Zaid", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] },
  { crop: "Tomato", emoji: "🍅", sowing: "Jun-Jul", harvest: "Sep-Oct", season: "Kharif", months: [5, 6, 7, 8, 9] },
  { crop: "Potato", emoji: "🥔", sowing: "Oct-Nov", harvest: "Jan-Feb", season: "Rabi", months: [9, 10, 11, 0, 1] },
  { crop: "Mango", emoji: "🥭", sowing: "Jul-Aug", harvest: "Apr-Jun", season: "Zaid", months: [3, 4, 5, 6, 7] },
  { crop: "Watermelon", emoji: "🍉", sowing: "Feb-Mar", harvest: "May-Jun", season: "Zaid", months: [1, 2, 3, 4, 5] },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const seasonColors = {
  Kharif: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
  Rabi: "bg-amber-500/20 text-amber-700 border-amber-500/30",
  Zaid: "bg-blue-500/20 text-blue-700 border-blue-500/30",
};

export const CropCalendar = () => {
  const currentMonth = new Date().getMonth();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
        <Sprout className="h-5 w-5 text-primary" />
        Crop Calendar
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Seasonal planting guide for Indian agriculture</p>

      {/* Season legend */}
      <div className="flex gap-3 mb-4">
        {(["Kharif", "Rabi", "Zaid"] as const).map((s) => (
          <span key={s} className={`rounded-full px-3 py-1 text-xs font-medium border ${seasonColors[s]}`}>
            {s}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-1 font-medium text-muted-foreground min-w-[120px]">Crop</th>
              {monthNames.map((m, i) => (
                <th
                  key={m}
                  className={`text-center py-2 px-0.5 font-medium min-w-[36px] ${i === currentMonth ? "text-primary" : "text-muted-foreground"}`}
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cropCalendarData.map((crop) => (
              <tr key={crop.crop} className="border-t border-border/50">
                <td className="py-2 px-1">
                  <span className="flex items-center gap-1.5">
                    <span>{crop.emoji}</span>
                    <span className="font-medium text-xs">{crop.crop}</span>
                  </span>
                </td>
                {monthNames.map((_, i) => {
                  const isActive = crop.months.includes(i);
                  const bgColor = isActive
                    ? crop.season === "Kharif" ? "bg-emerald-500/30" : crop.season === "Rabi" ? "bg-amber-500/30" : "bg-blue-500/30"
                    : "";
                  return (
                    <td key={i} className="py-2 px-0.5">
                      <div
                        className={`h-5 rounded-sm ${bgColor} ${i === currentMonth ? "ring-2 ring-primary/50" : ""}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        📍 Current month highlighted. Timings may vary by region.
      </p>
    </div>
  );
};
