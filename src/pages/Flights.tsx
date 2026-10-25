import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiClock, FiFilter } from 'react-icons/fi'
import { PiAirplaneTilt } from 'react-icons/pi'
import { toast } from 'sonner'
import { searchFlights } from '../lib/api'

interface Flight {
  id: number
  airline: string
  airline_logo: string
  flight_number: string
  origin_city: string
  origin_code: string
  destination_city: string
  destination_code: string
  departure_time: string
  arrival_time: string
  duration: string
  stops: number
  price: number
  class: string
  seats_left: number
  travel_date: string
}

const CITY_OPTIONS = ['Delhi', 'Mumbai', 'Bengaluru', 'Goa', 'Jaipur', 'Kochi', 'Hyderabad', 'Kolkata']
const AIRLINES = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Flights() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [from, setFrom] = useState(searchParams.get('from') || 'Delhi')
  const [to, setTo] = useState(searchParams.get('to') || 'Goa')
  const [date, setDate] = useState(searchParams.get('date') || todayStr())

  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)

  const [priceRange, setPriceRange] = useState(50000)
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [stopsFilter, setStopsFilter] = useState<'any' | 'nonstop' | 'onestop'>('any')
  const [travelClass, setTravelClass] = useState<'any' | 'Economy' | 'Business'>('any')
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price')

  const runSearch = () => {
    setLoading(true)
    setSearchParams({ from, to, date })
    searchFlights({
      from, to, date,
      maxPrice: priceRange,
      airlines: selectedAirlines.length ? selectedAirlines : undefined,
      stops: stopsFilter === 'any' ? undefined : stopsFilter,
      travelClass: travelClass === 'any' ? undefined : travelClass,
      sortBy,
    })
      .then((data) => setFlights(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load flights. Is the backend running?'))
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
  }, [priceRange, selectedAirlines, stopsFilter, travelClass, sortBy])

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    )
  }

  const swapCities = () => {
    setFrom(to)
    setTo(from)
  }

  const cheapest = useMemo(() => flights.reduce((min, f) => (f.price < min ? f.price : min), Infinity), [flights])

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-muted/40 rounded-lg px-3 py-2.5 font-medium outline-none border border-transparent focus:border-primary">
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-muted/40 rounded-lg px-3 py-2.5 font-medium outline-none border border-transparent focus:border-primary">
                {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={swapCities}
                title="Swap"
                className="hidden sm:flex absolute -left-8 bottom-2.5 w-6 h-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
              >
                ⇄
              </button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Departure</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-muted/40 rounded-lg px-3 py-2.5 font-medium outline-none border border-transparent focus:border-primary" />
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
                <div className="text-sm font-medium mb-2">Max Price: ₹{priceRange.toLocaleString('en-IN')}</div>
                <input
                  type="range"
                  min={1000}
                  max={50000}
                  step={500}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Stops</div>
                <div className="space-y-2">
                  {(['any', 'nonstop', 'onestop'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="stops" checked={stopsFilter === s} onChange={() => setStopsFilter(s)} className="accent-primary" />
                      {s === 'any' ? 'Any' : s === 'nonstop' ? 'Non-stop' : '1+ Stop'}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Airlines</div>
                <div className="space-y-2">
                  {AIRLINES.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedAirlines.includes(a)} onChange={() => toggleAirline(a)} className="accent-primary" />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <div className="text-sm font-medium mb-2">Class</div>
                <div className="space-y-2">
                  {(['any', 'Economy', 'Business'] as const).map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="class" checked={travelClass === c} onChange={() => setTravelClass(c)} className="accent-primary" />
                      {c === 'any' ? 'Any' : c}
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
                {loading ? 'Searching...' : `${flights.length} flights found`}
                {!loading && flights.length > 0 && Number.isFinite(cheapest) && (
                  <span> · Cheapest ₹{cheapest.toLocaleString('en-IN')}</span>
                )}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-muted/40 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="price">Price: Low to High</option>
                <option value="duration">Duration: Shortest</option>
                <option value="departure">Departure: Earliest</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-muted/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : flights.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <PiAirplaneTilt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No flights found for this route/date. Try adjusting filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                      <div className="flex items-center gap-3 sm:w-40">
                        <span className="text-2xl">{f.airline_logo}</span>
                        <div>
                          <div className="font-semibold text-sm">{f.airline}</div>
                          <div className="text-xs text-muted-foreground">{f.flight_number}</div>
                        </div>
                      </div>

                      <div className="flex-1 flex items-center gap-3 sm:gap-6">
                        <div className="text-center">
                          <div className="font-bold text-lg">{f.departure_time}</div>
                          <div className="text-xs text-muted-foreground">{f.origin_code}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-2">
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <FiClock className="w-3 h-3" /> {f.duration}
                          </div>
                          <div className="w-full flex items-center gap-1">
                            <div className="h-px flex-1 bg-border" />
                            <FiArrowRight className="text-primary w-4 h-4 shrink-0" />
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{f.stops === 0 ? 'Non-stop' : `${f.stops} stop`}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{f.arrival_time}</div>
                          <div className="text-xs text-muted-foreground">{f.destination_code}</div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:w-40 gap-2 sm:gap-1 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">₹{f.price.toLocaleString('en-IN')}</div>
                          <div className="text-xs text-muted-foreground">{f.class} · {f.seats_left} left</div>
                        </div>
                        <button
                          onClick={() => toast.success(`${f.airline} ${f.flight_number} selected — proceed to book!`)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                          Book Now
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

export default Flights
