import db from './database.js';
import destinations from '../src/data/destinations.js';

// Domestic cities — these are the ORIGIN airports (where users fly FROM)
const ORIGIN_CITIES = [
  { city: 'Delhi', code: 'DEL' },
  { city: 'Mumbai', code: 'BOM' },
  { city: 'Bengaluru', code: 'BLR' },
  { city: 'Goa', code: 'GOI' },
  { city: 'Jaipur', code: 'JAI' },
  { city: 'Kochi', code: 'COK' },
  { city: 'Hyderabad', code: 'HYD' },
  { city: 'Kolkata', code: 'CCU' },
];

// International destinations — matches the names used in destinationExtras
// (server/server.ts) and src/data/destinations.js, so flights line up with
// each destination detail page.
const INTERNATIONAL_DESTINATIONS = [
  { city: 'Bali', code: 'DPS' },
  { city: 'Santorini', code: 'JTR' },
  { city: 'Swiss Alps', code: 'ZRH' },
  { city: 'Tokyo', code: 'NRT' },
  { city: 'Maldives', code: 'MLE' },
  { city: 'Machu Picchu', code: 'CUZ' },
  { city: 'Paris', code: 'CDG' },
  { city: 'Safari Kenya', code: 'NBO' },
  { city: 'New Zealand', code: 'AKL' },
  { city: 'Dubai', code: 'DXB' },
  { city: 'Iceland', code: 'KEF' },
  { city: 'Amalfi Coast', code: 'NAP' },
];

// All possible destinations a flight can land at (domestic + international)
const ALL_DESTINATIONS = [...ORIGIN_CITIES, ...INTERNATIONAL_DESTINATIONS];

const AIRLINES = [
  { name: 'IndiGo', logo: '🟦' },
  { name: 'Air India', logo: '🔴' },
  { name: 'Vistara', logo: '🟣' },
  { name: 'SpiceJet', logo: '🟠' },
  { name: 'Akasa Air', logo: '🟢' },
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function nextDates(count: number) {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }
  return dates;
}

function isInternational(code: string) {
  return INTERNATIONAL_DESTINATIONS.some((d) => d.code === code);
}

function generateFlights() {
  const flights: any[] = [];
  const dates = nextDates(14);

  for (const origin of ORIGIN_CITIES) {
    for (const destination of ALL_DESTINATIONS) {
      if (origin.code === destination.code) continue;

      const international = isInternational(destination.code);

      // 2-3 flights per route per a handful of dates (keep dataset reasonable)
      for (const date of dates.slice(0, 7)) {
        const flightsPerRoute = randInt(1, international ? 2 : 3);
        for (let f = 0; f < flightsPerRoute; f++) {
          const airline = AIRLINES[randInt(0, AIRLINES.length - 1)];
          const depHour = randInt(0, 23);
          const depMin = [0, 15, 30, 45][randInt(0, 3)];

          // International routes fly much longer than domestic hops
          const durationMins = international ? randInt(300, 900) : randInt(75, 220);

          const arrTotalMins = depHour * 60 + depMin + durationMins;
          const arrHour = Math.floor(arrTotalMins / 60) % 24;
          const arrMin = arrTotalMins % 60;

          // International flights are almost always at least one stop
          const stops = international
            ? (Math.random() < 0.35 ? 0 : 1)
            : (Math.random() < 0.75 ? 0 : 1);

          const basePrice = international
            ? 18000 + durationMins * 40 + stops * 3000
            : 2500 + durationMins * 15 + stops * 800;

          const price = Math.round((basePrice + randInt(-1000, 3000)) / 10) * 10;
          const cls = Math.random() < 0.85 ? 'Economy' : 'Business';

          flights.push({
            airline: airline.name,
            airline_logo: airline.logo,
            flight_number: `${airline.name.slice(0, 2).toUpperCase()}-${randInt(100, 999)}`,
            origin_city: origin.city,
            origin_code: origin.code,
            destination_city: destination.city,
            destination_code: destination.code,
            departure_time: `${pad(depHour)}:${pad(depMin)}`,
            arrival_time: `${pad(arrHour)}:${pad(arrMin)}`,
            duration: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
            stops,
            price: cls === 'Business' ? price * 3 : price,
            class: cls,
            seats_left: randInt(1, 9),
            travel_date: date,
          });
        }
      }
    }
  }
  return flights;
}

const HOTEL_TEMPLATES: Record<string, { areas: string[]; names: string[] }> = {
  Goa: { areas: ['Calangute', 'Baga', 'Candolim', 'Anjuna', 'Palolem'], names: ['Beach Resort', 'Sea View Villa', 'Sunset Cottages', 'Palm Grove Hotel', 'Coastal Retreat'] },
  Jaipur: { areas: ['Civil Lines', 'C-Scheme', 'Amer Road', 'MI Road'], names: ['Heritage Haveli', 'Royal Palace Hotel', 'Pink City Inn', 'Fort View Residency'] },
  Delhi: { areas: ['Connaught Place', 'Aerocity', 'Karol Bagh', 'Paharganj'], names: ['Grand Plaza', 'City Central Hotel', 'Capital Suites', 'Metro Inn'] },
  Mumbai: { areas: ['Bandra', 'Colaba', 'Andheri', 'Juhu'], names: ['Marine Drive Hotel', 'Skyline Towers', 'Sea Breeze Residency', 'Business Bay Hotel'] },
  Bengaluru: { areas: ['MG Road', 'Koramangala', 'Whitefield', 'Indiranagar'], names: ['Garden City Hotel', 'Tech Park Inn', 'Urban Nest', 'Silicon Suites'] },
  Kochi: { areas: ['Fort Kochi', 'Marine Drive', 'Ernakulam'], names: ['Backwater Resort', 'Spice Coast Hotel', 'Harbor View Inn'] },
  Hyderabad: { areas: ['Banjara Hills', 'Hitech City', 'Jubilee Hills'], names: ['Nizam Palace Hotel', 'Pearl City Inn', 'Charminar View Suites'] },
  Kolkata: { areas: ['Park Street', 'Salt Lake', 'New Town'], names: ['Colonial Heritage Hotel', 'Riverside Residency', 'City Lights Inn'] },
};

const AMENITY_POOL = ['Free WiFi', 'Pool', 'Spa', 'Breakfast Included', 'Gym', 'Parking', 'AC', 'Bar', 'Airport Shuttle', 'Pet Friendly'];

// Curated, real Unsplash CDN photo IDs for hotel/resort imagery (images.unsplash.com,
// NOT the deprecated source.unsplash.com which shut down in 2024)
const HOTEL_IMAGE_IDS = [
  '1566073771259-6a8506099945',
  '1520250497591-112f2f40a3f4',
  '1571896349842-33c89424de2d',
  '1445019980597-93fa8acb246c',
  '1582719478250-c89cae4dc85b',
  '1611892440504-42a792e24d32',
  '1590490360182-c33d57733427',
  '1590073242678-70ee3fc28f8e',
  '1631049307264-da0ec9d70304',
  '1584132967334-10e028bd69f7',
  '1520277739336-7bf67edfa768',
  '1551882547-ff40c63fe5fa',
];

function randomHotelImage() {
  const id = HOTEL_IMAGE_IDS[randInt(0, HOTEL_IMAGE_IDS.length - 1)];
  return `https://images.unsplash.com/photo-${id}?w=600&h=400&auto=format&fit=crop`;
}

function generateHotels() {
  const hotels: any[] = [];
  for (const [city, tpl] of Object.entries(HOTEL_TEMPLATES)) {
    for (const area of tpl.areas) {
      const hotelsInArea = randInt(2, 3);
      for (let h = 0; h < hotelsInArea; h++) {
        const namePart = tpl.names[randInt(0, tpl.names.length - 1)];
        const starRating = [3, 4, 4, 5][randInt(0, 3)];
        const guestRating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
        const basePrice = starRating * 1500 + randInt(-500, 2500);
        const amenitiesCount = randInt(4, 7);
        const shuffled = [...AMENITY_POOL].sort(() => Math.random() - 0.5);

        hotels.push({
          name: `${area} ${namePart}`,
          city,
          area,
          image: randomHotelImage(),
          star_rating: starRating,
          guest_rating: guestRating,
          reviews: randInt(20, 900),
          price_per_night: Math.max(900, Math.round(basePrice / 10) * 10),
          amenities: JSON.stringify(shuffled.slice(0, amenitiesCount)),
          description: `Comfortable stay in ${area}, ${city} with easy access to top attractions.`,
          free_cancellation: Math.random() < 0.7 ? 1 : 0,
        });
      }
    }
  }
  return hotels;
}

export async function seedDatabase() {
  try {
    // Seed Destinations
    const existingDestinations = await db.all('SELECT id FROM destinations LIMIT 1');
    if (existingDestinations.length === 0) {
      console.log('Seeding destinations...');
      for (const dest of destinations) {
        await db.run(
          `INSERT INTO destinations (id, name, country, image, price, rating, description, category, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dest.id,
            dest.name,
            dest.country,
            dest.image,
            dest.price,
            dest.rating,
            dest.description,
            dest.category,
            dest.featured ? 1 : 0
          ]
        );
      }
      console.log('Destinations table seeded successfully.');
    } else {
      console.log('Destinations table already has data. Skipping seed.');
    }

    // Seed Flights
    const existingFlights = await db.all('SELECT id FROM flights LIMIT 1');
    if (existingFlights.length === 0) {
      console.log('Seeding flights...');
      const flights = generateFlights();
      for (const f of flights) {
        await db.run(
          `INSERT INTO flights (airline, airline_logo, flight_number, origin_city, origin_code, destination_city, destination_code, departure_time, arrival_time, duration, stops, price, class, seats_left, travel_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [f.airline, f.airline_logo, f.flight_number, f.origin_city, f.origin_code, f.destination_city, f.destination_code, f.departure_time, f.arrival_time, f.duration, f.stops, f.price, f.class, f.seats_left, f.travel_date]
        );
      }
      console.log(`Flights table seeded with ${flights.length} flights.`);
    } else {
      console.log('Flights table already has data. Skipping seed.');
    }

    // Seed Hotels
    const existingHotels = await db.all('SELECT id FROM hotels LIMIT 1');
    if (existingHotels.length === 0) {
      console.log('Seeding hotels...');
      const hotels = generateHotels();
      for (const h of hotels) {
        await db.run(
          `INSERT INTO hotels (name, city, area, image, star_rating, guest_rating, reviews, price_per_night, amenities, description, free_cancellation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [h.name, h.city, h.area, h.image, h.star_rating, h.guest_rating, h.reviews, h.price_per_night, h.amenities, h.description, h.free_cancellation]
        );
      }
      console.log(`Hotels table seeded with ${hotels.length} hotels.`);
    } else {
      console.log('Hotels table already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding SQLite database:', error);
  }
}

export default seedDatabase;