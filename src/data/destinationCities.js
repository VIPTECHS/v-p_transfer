import { projectLonLat } from "../utils/worldMapProject";

const CITY_DEFS = [
  { id: "newyork", lon: -74.006, lat: 40.7128, cardDx: -98, cardDy: -66 },
  { id: "losangeles", lon: -118.2437, lat: 34.0522 },
  { id: "miami", lon: -80.1918, lat: 25.7617 },
  { id: "lasvegas", lon: -115.1398, lat: 36.1699 },
  { id: "london", lon: -0.1276, lat: 51.5074, cardDx: 18, cardDy: -86 },
  { id: "paris", lon: 2.3522, lat: 48.8566, cardDx: -128, cardDy: 48 },
  { id: "rome", lon: 12.4964, lat: 41.9028 },
  { id: "barcelona", lon: 2.1734, lat: 41.3851 },
  { id: "amsterdam", lon: 4.9041, lat: 52.3676 },
  { id: "prague", lon: 14.4378, lat: 50.0755 },
  { id: "vienna", lon: 16.3738, lat: 48.2082 },
  { id: "venice", lon: 12.3155, lat: 45.4408 },
  { id: "istanbul", lon: 28.9784, lat: 41.0082 },
  { id: "antalya", lon: 30.7133, lat: 36.8969, cardDx: 112, cardDy: -72 },
  { id: "bodrum", lon: 27.4305, lat: 37.0344 },
  { id: "athens", lon: 23.7275, lat: 37.9838 },
  { id: "dubai", lon: 55.2708, lat: 25.2048, cardDx: 78, cardDy: 82 },
  { id: "cairo", lon: 31.2357, lat: 30.0444 },
  { id: "marrakech", lon: -7.9811, lat: 31.6295 },
  { id: "capetown", lon: 18.4241, lat: -33.9249 },
  { id: "tokyo", lon: 139.6917, lat: 35.6895, cardDx: 78, cardDy: -62 },
  { id: "singapore", lon: 103.8198, lat: 1.3521 },
  { id: "bangkok", lon: 100.5018, lat: 13.7563 },
  { id: "bali", lon: 115.2167, lat: -8.3405 },
  { id: "hongkong", lon: 114.1694, lat: 22.3193 },
  { id: "seoul", lon: 126.978, lat: 37.5665 },
  { id: "maldives", lon: 73.5093, lat: 4.1755 },
  { id: "sydney", lon: 151.2093, lat: -33.8688 },
  { id: "riodejaneiro", lon: -43.1729, lat: -22.9068 },
  { id: "buenosaires", lon: -58.3816, lat: -34.6037 },
];

export const DESTINATION_CITIES = CITY_DEFS.map(({ id, lon, lat, cardDx, cardDy }) => ({
  id,
  lon,
  lat,
  ...projectLonLat(lon, lat),
  ...(cardDx != null ? { cardDx, cardDy } : {}),
}));

export const FEATURED_DESTINATION_IDS = ["newyork", "london", "paris", "antalya", "dubai", "tokyo"];

export const FEATURED_CITIES = DESTINATION_CITIES.filter((city) =>
  FEATURED_DESTINATION_IDS.includes(city.id),
);
