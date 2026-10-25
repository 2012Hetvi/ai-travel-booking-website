// src/services/aiTravelAssistant.ts
//
// Rule-based "AI" query engine for the Wanderlust travel assistant.
// No external AI API is used — this module only ever returns information
// that already exists in the project's destination data, so it can never
// hallucinate prices, hotels, or itinerary details.

import destinations, { Destination } from '../data/destinations';
import { fetchDestinationDetails } from '../lib/api';

// ── Shape returned by /api/destinations/:id/details (see server.ts) ────────

export interface ItineraryItem {
  day: string;
  title: string;
  desc: string;
}

export interface HotelInfo {
  name: string;
  stars: number;
  location: string;
  perks: string;
  pricePerNight: string;
  tier: string;
  image: string;
}

export interface CabInfo {
  type: string;
  price: string;
  unit: string;
  note: string;
}

export interface DestinationInfo {
  airport: string;
  currency: string;
  language: string;
  bestSeason: string;
  visa: string;
  timezone: string;
}

export interface DestinationDetails {
  id: number;
  name: string;
  country: string;
  image: string;
  price: string;
  rating: number;
  description: string;
  category: string;
  featured: boolean;
  duration: string;
  itinerary: ItineraryItem[];
  hotels: HotelInfo[];
  cabs: CabInfo[];
  info: DestinationInfo;
}

// ── AI response types ────────────────────────────────────────────────────

export type AIResponse =
  | { type: 'destination'; destination: Destination; details: DestinationDetails }
  | { type: 'hotels'; destination: Destination; details: DestinationDetails }
  | { type: 'transport'; destination: Destination; details: DestinationDetails }
  | { type: 'itinerary'; destination: Destination; details: DestinationDetails }
  | { type: 'comparison'; a: Destination; b: Destination; detailsA: DestinationDetails; detailsB: DestinationDetails }
  | { type: 'recommendation'; title: string; items: Destination[] }
  | { type: 'notFound'; message: string };

// ── Helpers ──────────────────────────────────────────────────────────────

function parsePrice(price: string): number {
  const n = Number(price.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function findDestinationsInQuery(query: string): Destination[] {
  const q = query.toLowerCase();
  // Sort longer names first so "New Zealand" matches before a hypothetical
  // shorter overlapping name would.
  const sorted = [...destinations].sort((a, b) => b.name.length - a.name.length);
  const found: Destination[] = [];
  for (const d of sorted) {
    if (q.includes(d.name.toLowerCase()) && !found.some((f) => f.id === d.id)) {
      found.push(d);
    }
  }
  return found;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Romantic: ['romantic', 'honeymoon', 'couple'],
  Beach: ['beach', 'beaches', 'sea', 'ocean', 'island'],
  Adventure: ['adventure', 'trek', 'trekking', 'hiking', 'ski', 'skiing'],
  Culture: ['culture', 'cultural', 'heritage', 'history', 'historic'],
  Nature: ['nature', 'wildlife', 'safari', 'wilderness'],
};

const HOTEL_INTENT = /\bhotel|stay|resort\b/i;
const TRANSPORT_INTENT = /\btransport|cab|taxi|car rental|getting around\b/i;
const ITINERARY_INTENT = /\bitinerary|plan|day.?wise|schedule|trip plan\b/i;
const COMPARISON_INTENT = /\bcompare|comparison|vs\.?|versus\b|\bor\b/i;
const BUDGET_INTENT = /\bcheap|cheapest|budget|lowest price|affordable\b/i;
const DAYS_PATTERN = /(\d+)\s*-?\s*days?/i;

// ── Main entry point ─────────────────────────────────────────────────────

export async function processQuery(rawQuery: string): Promise<AIResponse> {
  const query = rawQuery.trim();
  const q = query.toLowerCase();
  const matched = findDestinationsInQuery(q);

  // 1. Comparison — two or more destinations mentioned together
  if (matched.length >= 2 && (COMPARISON_INTENT.test(q) || matched.length >= 2)) {
    const [a, b] = matched;
    const [detailsA, detailsB] = await Promise.all([
      fetchDestinationDetails(a.id),
      fetchDestinationDetails(b.id),
    ]);
    return { type: 'comparison', a, b, detailsA, detailsB };
  }

  // 2. Budget / cheapest — no specific destination named
  if (matched.length === 0 && BUDGET_INTENT.test(q)) {
    const sorted = [...destinations].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    return { type: 'recommendation', title: 'Budget-friendly destinations (lowest price first)', items: sorted.slice(0, 6) };
  }

  // 3. Category-based recommendation ("romantic", "beach", "adventure"...)
  if (matched.length === 0) {
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((k) => q.includes(k))) {
        const items = destinations.filter((d) => d.category === category);
        if (items.length) {
          return { type: 'recommendation', title: `${category} destinations`, items };
        }
      }
    }
  }

  // 4. Duration-based recommendation ("best for 5 days", "5 day trip")
  const daysMatch = q.match(DAYS_PATTERN);
  if (matched.length === 0 && daysMatch) {
    const days = daysMatch[1];
    const allDetails = await Promise.all(destinations.map((d) => fetchDestinationDetails(d.id)));
    const items = destinations.filter((_, i) => allDetails[i]?.duration?.includes(days));
    if (items.length) {
      return { type: 'recommendation', title: `${days}-day trip ideas`, items };
    }
    return { type: 'notFound', message: "I don't have this information in the current Wanderlust destination data." };
  }

  // 5. No destination recognized at all
  if (matched.length === 0) {
    return { type: 'notFound', message: 'Sorry, I currently have information for the destinations available on Wanderlust.' };
  }

  // 6. A single destination was recognized — fetch its full details
  const destination = matched[0];
  const details: DestinationDetails = await fetchDestinationDetails(destination.id);

  if (HOTEL_INTENT.test(q)) return { type: 'hotels', destination, details };
  if (TRANSPORT_INTENT.test(q)) return { type: 'transport', destination, details };
  if (ITINERARY_INTENT.test(q)) return { type: 'itinerary', destination, details };

  return { type: 'destination', destination, details };
}

export const EXAMPLE_QUERIES = [
  'Tell me about Paris',
  'Plan a 5-day Tokyo trip',
  'Compare Bali and Maldives',
  'Show me budget destinations',
  'Show hotels in Dubai',
  'Which destination is best for 5 days?',
];