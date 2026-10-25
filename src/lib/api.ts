const API_BASE = import.meta.env.VITE_API_URL || 'https://wenderlust-api.onrender.com';

export const fetchDestinations = () =>
  fetch(`${API_BASE}/api/destinations`).then(r => r.json());

export const fetchDestinationDetails = (id: number) =>
  fetch(`${API_BASE}/api/destinations/${id}/details`).then(r => r.json());

// ── Flights ──────────────────────────────────────────────────────────────

export interface FlightFilters {
  from?: string;
  to?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  airlines?: string[];
  stops?: 'nonstop' | 'onestop' | 'any';
  travelClass?: 'Economy' | 'Business';
  sortBy?: 'price' | 'duration' | 'departure';
}

export const fetchFlightCities = () =>
  fetch(`${API_BASE}/api/flights/meta/cities`).then(r => r.json());

export const searchFlights = (filters: FlightFilters) => {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.date) params.set('date', filters.date);
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.airlines?.length) params.set('airlines', filters.airlines.join(','));
  if (filters.stops) params.set('stops', filters.stops);
  if (filters.travelClass) params.set('travelClass', filters.travelClass);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  return fetch(`${API_BASE}/api/flights?${params.toString()}`).then(r => r.json());
};

// ── Hotels ───────────────────────────────────────────────────────────────

export interface HotelFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  starRating?: number[];
  amenities?: string[];
  freeCancellation?: boolean;
  sortBy?: 'price' | 'rating' | 'price_desc';
}

export const fetchHotelCities = () =>
  fetch(`${API_BASE}/api/hotels/meta/cities`).then(r => r.json());

export const searchHotels = (filters: HotelFilters) => {
  const params = new URLSearchParams();
  if (filters.city) params.set('city', filters.city);
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minRating != null) params.set('minRating', String(filters.minRating));
  if (filters.starRating?.length) params.set('starRating', filters.starRating.join(','));
  if (filters.amenities?.length) params.set('amenities', filters.amenities.join(','));
  if (filters.freeCancellation) params.set('freeCancellation', 'true');
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  return fetch(`${API_BASE}/api/hotels?${params.toString()}`).then(r => r.json());
};