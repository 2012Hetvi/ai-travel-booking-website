// src/components/ai/DestinationResult.tsx
import { Star, Clock, Banknote, Plane, Languages, Sun, Shield, Timer, ChevronRight, Calendar } from 'lucide-react';
import { Destination } from '../../data/destinations';
import { DestinationDetails } from '../../services/aiTravelAssistant';
import ItineraryCard from './ItineraryCard';
import HotelCard from './HotelCard';
import TransportCard from './TransportCard';

interface Props {
  destination: Destination;
  details: DestinationDetails;
  section?: 'full' | 'hotels' | 'transport' | 'itinerary';
  onViewDetails: (id: number) => void;
  onBookNow: (destination: Destination) => void;
}

export default function DestinationResult({ destination, details, section = 'full', onViewDetails, onBookNow }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="relative h-36">
        <img src={destination.image} alt={destination.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/80 text-xs">{destination.country}</span>
            <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
              {destination.category}
            </span>
          </div>
          <h3 className="text-white text-xl font-bold leading-tight">{destination.name}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-white text-xs">
              <Star size={12} className="fill-amber-400 text-amber-400" /> {destination.rating}
            </span>
            <span className="flex items-center gap-1 text-white/80 text-xs">
              <Clock size={12} /> {details.duration}
            </span>
            <span className="flex items-center gap-1 text-white/80 text-xs">
              <Banknote size={12} /> From {destination.price}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {section === 'full' && (
          <>
            <p className="text-muted-foreground text-sm mb-3">{destination.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { icon: Plane, label: details.info.airport },
                { icon: Banknote, label: details.info.currency },
                { icon: Languages, label: details.info.language },
                { icon: Sun, label: details.info.bestSeason },
                { icon: Shield, label: details.info.visa },
                { icon: Timer, label: details.info.timezone },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1 bg-muted/50 rounded-full px-2.5 py-1">
                  <Icon size={10} className="text-primary" />
                  <span className="text-muted-foreground text-[11px]">{label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-card-foreground mb-2">Itinerary</p>
            <ItineraryCard itinerary={details.itinerary.slice(0, 3)} />

            <p className="text-xs font-semibold text-card-foreground mt-4 mb-2">Hotels</p>
            <HotelCard hotels={details.hotels.slice(0, 2)} />

            <p className="text-xs font-semibold text-card-foreground mt-4 mb-2">Transport</p>
            <TransportCard cabs={details.cabs.slice(0, 2)} />
          </>
        )}

        {section === 'hotels' && <HotelCard hotels={details.hotels} />}
        {section === 'transport' && <TransportCard cabs={details.cabs} />}
        {section === 'itinerary' && <ItineraryCard itinerary={details.itinerary} />}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onViewDetails(destination.id)}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-card-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1"
          >
            View Details <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onBookNow(destination)}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
          >
            <Calendar size={14} /> Book Now
          </button>
        </div>
      </div>
    </div>
  );
}