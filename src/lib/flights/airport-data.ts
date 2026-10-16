/**
 * Reference list of airports GroupTrip accepts. Curated for trips from Australia
 * (domestic, NZ, Pacific, Asia) plus major long-haul hubs. Replace or augment with a
 * provider lookup (e.g. Amadeus Airport & City Search) when live data is added.
 */
export interface AirportRecord {
  code: string;
  city: string;
  country: string;
  /** IANA time zone, used to convert local flight times. */
  timeZone: string;
}

const AU = "Australia";
const NZ = "New Zealand";

export const AIRPORTS: readonly AirportRecord[] = [
  // Australia
  { code: "SYD", city: "Sydney", country: AU, timeZone: "Australia/Sydney" },
  { code: "MEL", city: "Melbourne", country: AU, timeZone: "Australia/Melbourne" },
  { code: "BNE", city: "Brisbane", country: AU, timeZone: "Australia/Brisbane" },
  { code: "OOL", city: "Gold Coast", country: AU, timeZone: "Australia/Brisbane" },
  { code: "MCY", city: "Sunshine Coast", country: AU, timeZone: "Australia/Brisbane" },
  { code: "CNS", city: "Cairns", country: AU, timeZone: "Australia/Brisbane" },
  { code: "TSV", city: "Townsville", country: AU, timeZone: "Australia/Brisbane" },
  { code: "HTI", city: "Hamilton Island", country: AU, timeZone: "Australia/Brisbane" },
  { code: "PPP", city: "Whitsunday Coast", country: AU, timeZone: "Australia/Brisbane" },
  { code: "PER", city: "Perth", country: AU, timeZone: "Australia/Perth" },
  { code: "BME", city: "Broome", country: AU, timeZone: "Australia/Perth" },
  { code: "ADL", city: "Adelaide", country: AU, timeZone: "Australia/Adelaide" },
  { code: "CBR", city: "Canberra", country: AU, timeZone: "Australia/Sydney" },
  { code: "NTL", city: "Newcastle", country: AU, timeZone: "Australia/Sydney" },
  { code: "BNK", city: "Ballina Byron", country: AU, timeZone: "Australia/Sydney" },
  { code: "CFS", city: "Coffs Harbour", country: AU, timeZone: "Australia/Sydney" },
  { code: "HBA", city: "Hobart", country: AU, timeZone: "Australia/Hobart" },
  { code: "LST", city: "Launceston", country: AU, timeZone: "Australia/Hobart" },
  { code: "DRW", city: "Darwin", country: AU, timeZone: "Australia/Darwin" },
  { code: "AYQ", city: "Uluru (Ayers Rock)", country: AU, timeZone: "Australia/Darwin" },
  { code: "LDH", city: "Lord Howe Island", country: AU, timeZone: "Australia/Lord_Howe" },
  { code: "NLK", city: "Norfolk Island", country: AU, timeZone: "Pacific/Norfolk" },
  // New Zealand
  { code: "AKL", city: "Auckland", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "WLG", city: "Wellington", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "CHC", city: "Christchurch", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "ZQN", city: "Queenstown", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "DUD", city: "Dunedin", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "NSN", city: "Nelson", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "ROT", city: "Rotorua", country: NZ, timeZone: "Pacific/Auckland" },
  { code: "TRG", city: "Tauranga", country: NZ, timeZone: "Pacific/Auckland" },
  // Pacific
  { code: "NAN", city: "Nadi", country: "Fiji", timeZone: "Pacific/Fiji" },
  { code: "SUV", city: "Suva", country: "Fiji", timeZone: "Pacific/Fiji" },
  { code: "RAR", city: "Rarotonga", country: "Cook Islands", timeZone: "Pacific/Rarotonga" },
  { code: "APW", city: "Apia", country: "Samoa", timeZone: "Pacific/Apia" },
  { code: "TBU", city: "Nuku'alofa", country: "Tonga", timeZone: "Pacific/Tongatapu" },
  { code: "VLI", city: "Port Vila", country: "Vanuatu", timeZone: "Pacific/Efate" },
  { code: "NOU", city: "Nouméa", country: "New Caledonia", timeZone: "Pacific/Noumea" },
  { code: "PPT", city: "Papeete (Tahiti)", country: "French Polynesia", timeZone: "Pacific/Tahiti" },
  { code: "POM", city: "Port Moresby", country: "Papua New Guinea", timeZone: "Pacific/Port_Moresby" },
  { code: "HIR", city: "Honiara", country: "Solomon Islands", timeZone: "Pacific/Guadalcanal" },
  { code: "HNL", city: "Honolulu", country: "United States", timeZone: "Pacific/Honolulu" },
  // Indonesia
  { code: "DPS", city: "Bali (Denpasar)", country: "Indonesia", timeZone: "Asia/Makassar" },
  { code: "LOP", city: "Lombok", country: "Indonesia", timeZone: "Asia/Makassar" },
  { code: "LBJ", city: "Labuan Bajo", country: "Indonesia", timeZone: "Asia/Makassar" },
  { code: "CGK", city: "Jakarta", country: "Indonesia", timeZone: "Asia/Jakarta" },
  { code: "SUB", city: "Surabaya", country: "Indonesia", timeZone: "Asia/Jakarta" },
  { code: "YIA", city: "Yogyakarta", country: "Indonesia", timeZone: "Asia/Jakarta" },
  // Vietnam
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  { code: "HAN", city: "Hanoi", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  { code: "DAD", city: "Da Nang", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  { code: "CXR", city: "Nha Trang (Cam Ranh)", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  { code: "PQC", city: "Phu Quoc", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  { code: "HUI", city: "Hue", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  { code: "HPH", city: "Hai Phong", country: "Vietnam", timeZone: "Asia/Ho_Chi_Minh" },
  // South-East Asia
  { code: "SIN", city: "Singapore", country: "Singapore", timeZone: "Asia/Singapore" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", timeZone: "Asia/Kuala_Lumpur" },
  { code: "PEN", city: "Penang", country: "Malaysia", timeZone: "Asia/Kuala_Lumpur" },
  { code: "LGK", city: "Langkawi", country: "Malaysia", timeZone: "Asia/Kuala_Lumpur" },
  { code: "BKI", city: "Kota Kinabalu", country: "Malaysia", timeZone: "Asia/Kuching" },
  { code: "BKK", city: "Bangkok (Suvarnabhumi)", country: "Thailand", timeZone: "Asia/Bangkok" },
  { code: "DMK", city: "Bangkok (Don Mueang)", country: "Thailand", timeZone: "Asia/Bangkok" },
  { code: "HKT", city: "Phuket", country: "Thailand", timeZone: "Asia/Bangkok" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand", timeZone: "Asia/Bangkok" },
  { code: "USM", city: "Koh Samui", country: "Thailand", timeZone: "Asia/Bangkok" },
  { code: "KBV", city: "Krabi", country: "Thailand", timeZone: "Asia/Bangkok" },
  { code: "MNL", city: "Manila", country: "Philippines", timeZone: "Asia/Manila" },
  { code: "CEB", city: "Cebu", country: "Philippines", timeZone: "Asia/Manila" },
  // East Asia
  { code: "NRT", city: "Tokyo (Narita)", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "HND", city: "Tokyo (Haneda)", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "KIX", city: "Osaka (Kansai)", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "NGO", city: "Nagoya", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "CTS", city: "Sapporo", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "FUK", city: "Fukuoka", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "OKA", city: "Okinawa (Naha)", country: "Japan", timeZone: "Asia/Tokyo" },
  { code: "ICN", city: "Seoul (Incheon)", country: "South Korea", timeZone: "Asia/Seoul" },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", timeZone: "Asia/Hong_Kong" },
  { code: "MFM", city: "Macau", country: "Macau", timeZone: "Asia/Macau" },
  { code: "TPE", city: "Taipei", country: "Taiwan", timeZone: "Asia/Taipei" },
  { code: "PEK", city: "Beijing", country: "China", timeZone: "Asia/Shanghai" },
  { code: "PVG", city: "Shanghai", country: "China", timeZone: "Asia/Shanghai" },
  { code: "CAN", city: "Guangzhou", country: "China", timeZone: "Asia/Shanghai" },
  { code: "SZX", city: "Shenzhen", country: "China", timeZone: "Asia/Shanghai" },
  // South Asia
  { code: "DEL", city: "Delhi", country: "India", timeZone: "Asia/Kolkata" },
  { code: "BOM", city: "Mumbai", country: "India", timeZone: "Asia/Kolkata" },
  { code: "BLR", city: "Bengaluru", country: "India", timeZone: "Asia/Kolkata" },
  { code: "MAA", city: "Chennai", country: "India", timeZone: "Asia/Kolkata" },
  { code: "CMB", city: "Colombo", country: "Sri Lanka", timeZone: "Asia/Colombo" },
  { code: "MLE", city: "Malé", country: "Maldives", timeZone: "Indian/Maldives" },
  { code: "KTM", city: "Kathmandu", country: "Nepal", timeZone: "Asia/Kathmandu" },
  // Long-haul hubs
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", timeZone: "Asia/Dubai" },
  { code: "AUH", city: "Abu Dhabi", country: "United Arab Emirates", timeZone: "Asia/Dubai" },
  { code: "DOH", city: "Doha", country: "Qatar", timeZone: "Asia/Qatar" },
  { code: "IST", city: "Istanbul", country: "Türkiye", timeZone: "Europe/Istanbul" },
  { code: "LHR", city: "London (Heathrow)", country: "United Kingdom", timeZone: "Europe/London" },
  { code: "CDG", city: "Paris", country: "France", timeZone: "Europe/Paris" },
  { code: "FRA", city: "Frankfurt", country: "Germany", timeZone: "Europe/Berlin" },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", timeZone: "Europe/Amsterdam" },
  { code: "FCO", city: "Rome", country: "Italy", timeZone: "Europe/Rome" },
  { code: "ATH", city: "Athens", country: "Greece", timeZone: "Europe/Athens" },
  { code: "JNB", city: "Johannesburg", country: "South Africa", timeZone: "Africa/Johannesburg" },
  { code: "LAX", city: "Los Angeles", country: "United States", timeZone: "America/Los_Angeles" },
  { code: "SFO", city: "San Francisco", country: "United States", timeZone: "America/Los_Angeles" },
  { code: "DFW", city: "Dallas", country: "United States", timeZone: "America/Chicago" },
  { code: "JFK", city: "New York (JFK)", country: "United States", timeZone: "America/New_York" },
  { code: "YVR", city: "Vancouver", country: "Canada", timeZone: "America/Vancouver" },
];
