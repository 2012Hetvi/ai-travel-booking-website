// src/components/DestinationDetailModal.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Star, Clock, Calendar, Building2, Car,
  Info, Plane, Banknote, Languages, Sun, Shield, Timer,
  ChevronRight, Heart, Share2, ExternalLink
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ItineraryItem {
  day: string;
  title: string;
  desc: string;
}

interface Hotel {
  name: string;
  stars: number;
  location: string;
  perks: string;
  pricePerNight: string;
  tier: string;
  image: string;
}

interface Cab {
  type: string;
  price: string;
  unit: string;
  note: string;
}

interface DestinationInfo {
  airport: string;
  currency: string;
  language: string;
  bestSeason: string;
  visa: string;
  timezone: string;
}

interface DestinationDetail {
  id: number;
  name: string;
  country: string;
  image: string;
  price: string;
  rating: number;
  description: string;
  category: string;
  duration: string;
  itinerary: ItineraryItem[];
  hotels: Hotel[];
  cabs: Cab[];
  info: DestinationInfo;
}
const getMapEmbedUrl = (place: string, country: string) => {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    `${place}, ${country}`
  )}&output=embed`;
};

interface Props {
  destinationId: number | null;
  onClose: () => void;
}

// ─── Tier color helper ────────────────────────────────────────────────────────
const tierColors: Record<string, string> = {
  'Ultra Luxury': 'bg-purple-100 text-purple-700',
  'Luxury':       'bg-amber-100 text-amber-700',
  'Premium':      'bg-sky-100 text-sky-700',
  'Mid-range':    'bg-emerald-100 text-emerald-700',
  'Budget':       'bg-slate-100 text-slate-600',
};

// ─── Star renderer ────────────────────────────────────────────────────────────
const Stars = ({ count }: { count: number }) => (
  <span className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < count ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
      />
    ))}
  </span>
);

// ─── Section heading ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center gap-2 mt-7 mb-3">
    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-orange-500" />
    </div>
    <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
  </div>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function DestinationDetailModal({ destinationId, onClose }: Props) {
  const navigate = useNavigate();
  const [data, setData] = useState<DestinationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'transport'>('itinerary');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Fetch destination details when ID changes
  useEffect(() => {
    if (destinationId === null) return;
    setLoading(true);
    setError(null);
    setData(null);
    setActiveTab('itinerary');
    setSelectedHotel(null);

   fetch(`${import.meta.env.VITE_API_URL || ''}/api/destinations/${destinationId}/details`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then((d: DestinationDetail) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Details load karne mein problem aayi. Please dobara try karo.');
        setLoading(false);
      });
  }, [destinationId]);

  // Close on Escape key
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (selectedHotel) {
        setSelectedHotel(null);
      } else {
        onClose();
      }
    }
  }, [onClose, selectedHotel]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Lock body scroll when open
  useEffect(() => {
    if (destinationId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [destinationId]);

  const tabs = [
    { key: 'itinerary' as const, label: 'Itinerary', icon: Calendar },
    { key: 'hotels'    as const, label: 'Hotels',    icon: Building2 },
    { key: 'transport' as const, label: 'Transport', icon: Car },
  ];

  return (
    <>
    <AnimatePresence>
      {destinationId !== null && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dimmed background */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95dvh] flex flex-col overflow-hidden shadow-2xl z-10"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            {/* ── Loading state ── */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Details aa rahi hain...</p>
              </div>
            )}

            {/* ── Error state ── */}
            {error && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 px-8 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <X size={20} className="text-red-400" />
                </div>
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium"
                >
                  Close
                </button>
              </div>
            )}

            {/* ── Main content ── */}
            {data && !loading && (
              <>
                {/* Hero image */}
                <div className="relative h-52 sm:h-64 flex-shrink-0">
                  <img
                    src={data.image}
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top-right actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setWishlist(w => !w)}
                      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform active:scale-90"
                    >
                      <Heart
                        size={16}
                        className={wishlist ? 'fill-red-500 text-red-500' : 'text-white'}
                      />
                    </button>
                    <button
                      onClick={onClose}
                      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-transform active:scale-90"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>

                  {/* Bottom info on hero */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin size={13} className="text-orange-300" />
                      <span className="text-white/80 text-xs">{data.country}</span>
                      <span className="text-white/40 text-xs mx-1">·</span>
                      <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {data.category}
                      </span>
                    </div>
                    <h2 className="text-white text-2xl font-bold leading-tight">{data.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-white text-sm font-medium">{data.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-white/70" />
                        <span className="text-white/80 text-sm">{data.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Banknote size={13} className="text-white/70" />
                        <span className="text-white/80 text-sm">From {data.price}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">
                  {/* Description */}
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-gray-500 text-sm leading-relaxed">{data.description}</p>
                  </div>

                  {/* Quick info pills */}
                  <div className="px-5 pb-3">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { icon: Plane,     label: data.info.airport },
                        { icon: Banknote,  label: data.info.currency },
                        { icon: Languages, label: data.info.language },
                        { icon: Sun,       label: data.info.bestSeason },
                        { icon: Shield,    label: data.info.visa },
                        { icon: Timer,     label: data.info.timezone },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5"
                        >
                          <Icon size={11} className="text-orange-500 flex-shrink-0" />
                          <span className="text-gray-600 text-xs">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div className="flex gap-1 mx-5 p-1 bg-gray-100 rounded-xl mb-1">
                    {tabs.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === key
                            ? 'bg-white text-orange-500 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="px-5 pb-4">
                    {/* ── ITINERARY TAB ── */}
                    {activeTab === 'itinerary' && (
                      <div className="mt-3 space-y-3">
                        {data.itinerary.map((item, i) => (
                          <div
                            key={i}
                            className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap">
                                {item.day}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── HOTELS TAB ── */}
                    {activeTab === 'hotels' && (
                      <div className="mt-3 space-y-3">
                        {data.hotels.map((hotel, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedHotel(hotel)}
                            className="w-full text-left rounded-xl border border-gray-100 overflow-hidden hover:border-orange-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex gap-3 p-3.5">
                              <img
                                src={hotel.image}
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/200/200`; }}
                                alt={hotel.name}
                                loading="lazy"
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                              />
                              <div className="flex items-start justify-between gap-2 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-gray-900 text-sm">{hotel.name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[hotel.tier] || tierColors['Budget']}`}>
                                      {hotel.tier}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Stars count={hotel.stars} />
                                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                                      <MapPin size={10} />
                                      {hotel.location}
                                    </span>
                                  </div>
                                  <p className="text-gray-500 text-xs mt-1.5">{hotel.perks}</p>
                                  <p className="text-orange-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                                    View details <ChevronRight size={12} />
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-orange-500 font-bold text-base">{hotel.pricePerNight}</p>
                                  <p className="text-gray-400 text-xs">per night</p>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}


                    {/* ── TRANSPORT TAB ── */}
                    {activeTab === 'transport' && (
                      <div className="mt-3 grid grid-cols-1 gap-3">
                        {data.cabs.map((cab, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <Car size={18} className="text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm">{cab.type}</p>
                              <p className="text-gray-400 text-xs mt-0.5">{cab.note}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-orange-500 font-bold text-sm">{cab.price}</span>
                              <span className="text-gray-400 text-xs">{cab.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
{/* ── GOOGLE MAP ── */}
<div className="px-5 pb-5">
  <Section icon={MapPin} title="Location on Google Maps" />

  <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
    <iframe
      src={getMapEmbedUrl(data.name, data.country)}
      width="100%"
      height="170"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      title={`${data.name} Map`}
    />
  </div>

  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${data.name}, ${data.country}`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-3 inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm"
  >
    <ExternalLink size={15} />
    Open in Google Maps
  </a>
</div>

                {/* ── Sticky bottom CTA ── */}
                <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
                  <button
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                    onClick={() => {
                      onClose();
                      // ✅ price aur destinationName state ke saath pass ho raha hai
                      navigate('/login', {
                        state: {
                          price: data.price,
                          destinationName: data.name,
                        }
                      });
                    }}
                  >
                    <Calendar size={18} />
                    Book Now — From {data.price}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── HOTEL DETAIL OVERLAY ── */}
    <AnimatePresence>
      {selectedHotel && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedHotel(null)}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
          >
            {/* Image header */}
            <div className="relative h-56 flex-shrink-0">
              <img
                src={selectedHotel.image}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(selectedHotel.name)}/600/400`; }}
                alt={selectedHotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <button
                onClick={() => setSelectedHotel(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
              >
                <X size={18} className="text-gray-700" />
              </button>

              <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold ${tierColors[selectedHotel.tier] || tierColors['Budget']}`}>
                {selectedHotel.tier}
              </span>

              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-bold text-xl leading-tight drop-shadow">{selectedHotel.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Stars count={selectedHotel.stars} />
                  <span className="flex items-center gap-1 text-white/90 text-xs">
                    <MapPin size={11} />
                    {selectedHotel.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-orange-500">{selectedHotel.pricePerNight}</p>
                  <p className="text-gray-400 text-xs">per night, taxes excluded</p>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <Star size={12} className="fill-orange-500 text-orange-500" />
                  {selectedHotel.stars}.0
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Highlights</p>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.perks.split('·').map((perk, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {perk.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                <MapPin size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Located in {selectedHotel.location}. Exact address and check-in details are shared after booking.</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  const hotel = selectedHotel;
                  setSelectedHotel(null);
                  onClose();
                  navigate('/login', {
                    state: {
                      price: hotel?.pricePerNight,
                      destinationName: hotel?.name,
                    }
                  });
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
              >
                <Building2 size={18} />
                Book {selectedHotel.name}
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}