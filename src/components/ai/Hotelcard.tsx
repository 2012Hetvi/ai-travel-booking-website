// src/components/ai/HotelCard.tsx
import { Star, MapPin } from 'lucide-react';
import { HotelInfo } from '../../services/aiTravelAssistant';

const tierColors: Record<string, string> = {
  'Ultra Luxury': 'bg-purple-100 text-purple-700',
  'Luxury': 'bg-amber-100 text-amber-700',
  'Premium': 'bg-sky-100 text-sky-700',
  'Mid-range': 'bg-emerald-100 text-emerald-700',
  'Budget': 'bg-slate-100 text-slate-600',
};

const Stars = ({ count }: { count: number }) => (
  <span className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={11} className={i < count ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
    ))}
  </span>
);

export default function HotelCard({ hotels }: { hotels: HotelInfo[] }) {
  return (
    <div className="space-y-2">
      {hotels.map((hotel, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
          <img
            src={hotel.image}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/160/160`; }}
            alt={hotel.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted"
          />
          <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-card-foreground">{hotel.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColors[hotel.tier] || tierColors['Budget']}`}>
                  {hotel.tier}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Stars count={hotel.stars} />
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <MapPin size={10} /> {hotel.location}
                </span>
              </div>
              <p className="text-muted-foreground text-xs mt-1">{hotel.perks}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-primary font-bold text-sm">{hotel.pricePerNight}</p>
              <p className="text-muted-foreground text-[10px]">per night</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}