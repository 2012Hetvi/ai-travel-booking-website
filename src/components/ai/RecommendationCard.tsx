// src/components/ai/RecommendationCard.tsx
import { Star, ChevronRight } from 'lucide-react';
import { Destination } from '../../data/destinations';

interface Props {
  title: string;
  items: Destination[];
  onViewDetails: (id: number) => void;
}

export default function RecommendationCard({ title, items, onViewDetails }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-card-foreground mb-3">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewDetails(item.id)}
            className="text-left rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="relative h-24">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-2 left-3 text-white font-semibold text-sm">{item.name}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star size={11} className="fill-amber-400 text-amber-400" /> {item.rating} · {item.category}
                </span>
                <p className="text-primary font-bold text-sm mt-0.5">From {item.price}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}