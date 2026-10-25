// src/components/ai/TransportCard.tsx
import { Car } from 'lucide-react';
import { CabInfo } from '../../services/aiTravelAssistant';

export default function TransportCard({ cabs }: { cabs: CabInfo[] }) {
  return (
    <div className="space-y-2">
      {cabs.map((cab, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Car size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-card-foreground">{cab.type}</p>
            <p className="text-muted-foreground text-xs">{cab.note}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-primary font-bold text-sm">{cab.price}</span>
            <span className="text-muted-foreground text-xs">{cab.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}