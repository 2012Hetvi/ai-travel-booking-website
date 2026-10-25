// src/components/ai/DestinationComparison.tsx
import { ChevronRight } from 'lucide-react';
import { Destination } from '../../data/destinations';
import { DestinationDetails } from '../../services/aiTravelAssistant';

interface Props {
  a: Destination;
  b: Destination;
  detailsA: DestinationDetails;
  detailsB: DestinationDetails;
  onViewDetails: (id: number) => void;
}

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d.]/g, '')) || 0;
}

export default function DestinationComparison({ a, b, detailsA, detailsB, onViewDetails }: Props) {
  const cheaper = parsePrice(a.price) <= parsePrice(b.price) ? a.name : b.name;

  const rows: { label: string; a: string; b: string }[] = [
    { label: 'Rating', a: `⭐ ${a.rating}`, b: `⭐ ${b.rating}` },
    { label: 'Duration', a: detailsA.duration, b: detailsB.duration },
    { label: 'Price', a: a.price, b: b.price },
    { label: 'Category', a: a.category, b: b.category },
    { label: 'Best Time', a: detailsA.info.bestSeason, b: detailsB.info.bestSeason },
    { label: 'Currency', a: detailsA.info.currency, b: detailsB.info.currency },
    { label: 'Visa', a: detailsA.info.visa, b: detailsB.info.visa },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-card-foreground mb-3">
        {a.name} vs {b.name}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground text-xs">
              <th className="py-2 pr-2 font-medium">Feature</th>
              <th className="py-2 px-2 font-medium">{a.name}</th>
              <th className="py-2 pl-2 font-medium">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="py-2 pr-2 text-muted-foreground text-xs">{row.label}</td>
                <td className="py-2 px-2 text-card-foreground font-medium text-xs">{row.a}</td>
                <td className="py-2 pl-2 text-card-foreground font-medium text-xs">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        💰 {cheaper} is the cheaper option of the two.
      </p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onViewDetails(a.id)}
          className="flex-1 py-2 rounded-xl border border-border text-xs font-medium text-card-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          View {a.name} <ChevronRight size={12} />
        </button>
        <button
          onClick={() => onViewDetails(b.id)}
          className="flex-1 py-2 rounded-xl border border-border text-xs font-medium text-card-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
        >
          View {b.name} <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}