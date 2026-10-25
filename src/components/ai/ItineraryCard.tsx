// src/components/ai/ItineraryCard.tsx
import { ItineraryItem } from '../../services/aiTravelAssistant';

export default function ItineraryCard({ itinerary }: { itinerary: ItineraryItem[] }) {
  return (
    <div className="space-y-2">
      {itinerary.map((item, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl border border-border bg-card">
          <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap h-fit">
            {item.day}
          </span>
          <div>
            <p className="font-medium text-sm text-card-foreground">{item.title}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}