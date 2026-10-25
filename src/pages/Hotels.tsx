import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFilter, FiMapPin, FiStar } from 'react-icons/fi'
import { PiBuildingsBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { searchHotels } from '../lib/api'

interface Hotel {
  id: number
  name: string
  city: string
  area: string
  image: string
  star_rating: number
  guest_rating: number
  reviews: number
  price_per_night: number
  amenities: string[]
  description: string
  free_cancellation: boolean
}

const CITY_OPTIONS = ['Delhi', 'Mumbai', 'Bengaluru', 'Goa', 'Jaipur', 'Kochi', 'Hyderabad', 'Kolkata']
const AMENITY_POOL = ['Free WiFi', 'Pool', 'Spa', 'Breakfast Included', 'Gym', 'Parking', 'AC', 'Bar', 'Airport Shuttle', 'Pet Friendly']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [city, setCity] = useState(searchParams.get('city') || 'Goa')
  const [checkin, setCheckin] = useState(searchParams.get('checkin') || todayStr())
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2)

  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  const [priceRange, setPriceRange] = useState(20000)
  const [starFilter, setStarFilter] = useState<number[]>([])
  const [minRating, setMinRating] = useState(0)
  const [amenityFilter, setAmenityFilter] = useState<string[]>([])
  const [freeCancellation, setFreeCancellation] = useState(false)
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'price_desc'>('price')

  const runSearch = () => {
    setLoading(true)
    setSearchParams({ city, checkin, guests: String(guests) })
    searchHotels({
      city,
      maxPrice: priceRange,
      starRating: starFilter.length ? starFilter : undefined,
      minRating: minRating || undefined,
      amenities: amenityFilter.length ? amenityFilter : undefined,
      freeCancellation: freeCancellation || undefined,
      sortBy,
    })
      .then((data) => setHotels(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load hotels. Is the backend running?'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(runSearch, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, starFilter, minRating, amenityFilter, freeCancellation, sortBy])

  const toggleStar = (s: number) => {
    setStarFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const toggleAmenity = (a: string) => {
    setAmenityFilter((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-muted/40 rounded-lg px-3 py-2.5 font-medium outline-none border border-transparent focus:border-primary">
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Check-in</label>
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="w-full bg-muted/40 rounded-lg px-3 py-2.5 font-medium outline-none border border-transparent focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Guests</label>
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-muted/40 rounded-lg px-3 py-2.5 font-medium outline-none border border-transparent focus:border-primary">
                {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g} {g === 1 ? 'Guest' : 'Guests'}</option>)}
              </select>
            </div>
            <button
              onClick={runSearch}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-5 font-semibold text-foreground">
                <FiFilter /> Filters
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Max Price/Night: ₹{priceRange.toLocaleString('en-IN')}</div>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={250}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Star Rating</div>
                <div className="space-y-2">
                  {[5, 4, 3].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={starFilter.includes(s)} onChange={() => toggleStar(s)} className="accent-primary" />
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: s }).map((_, i) => <FiStar key={i} className="w-3.5 h-3.5 fill-accent text-accent" />)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Guest Rating</div>
                <div className="space-y-2">
                  {[4.5, 4, 3.5, 0].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="minRating" checked={minRating === r} onChange={() => setMinRating(r)} className="accent-primary" />
                      {r === 0 ? 'Any' : `${r}+`}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={freeCancellation} onChange={(e) => setFreeCancellation(e.target.checked)} className="accent-primary" />
                  Free Cancellation
                </label>
              </div>

              <div className="mb-2">
                <div className="text-sm font-medium mb-2">Amenities</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {AMENITY_POOL.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={amenityFilter.includes(a)} onChange={() => toggleAmenity(a)} className="accent-primary" />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="text-muted-foreground text-sm">
                {loading ? 'Searching...' : `${hotels.length} hotels found in ${city}`}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-muted/40 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="price">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-72 bg-muted/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <PiBuildingsBold className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No hotels found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {hotels.map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                    className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                  >
                    <div className="h-44 overflow-hidden bg-muted relative">
                      <img
                        src={h.image}
                        alt={h.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(h.name)}/400/300`; }}
                      />
                      {h.free_cancellation && (
                        <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                          Free Cancellation
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground leading-tight">{h.name}</h3>
                        <span className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: h.star_rating }).map((_, i2) => <FiStar key={i2} className="w-3 h-3 fill-accent text-accent" />)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <FiMapPin className="w-3 h-3" /> {h.area}, {h.city}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{h.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {h.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="text-[10px] bg-muted px-2 py-1 rounded-full text-muted-foreground">{a}</span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-secondary">
                            {h.guest_rating} <span className="text-muted-foreground font-normal">({h.reviews} reviews)</span>
                          </div>
                          <div className="text-xl font-bold text-primary">₹{h.price_per_night.toLocaleString('en-IN')}<span className="text-xs font-normal text-muted-foreground">/night</span></div>
                        </div>
                        <button
                          onClick={() => toast.success(`${h.name} selected — proceed to book!`)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hotels
