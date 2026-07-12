import MapLibreGL from "maplibre-gl";
import { useEffect, useRef } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  useMap,
} from "@/components/ui/mapcn-map-arc";
import { useI18n } from "../i18n/I18nContext";
import { useTheme } from "../lib/ThemeContext";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

type DestinationCity = {
  id: string;
  lon: number;
  lat: number;
};

type DestinationsInteractiveMapProps = {
  cities: DestinationCity[];
  litId?: string | null;
  onCityEnter?: (id: string) => void;
  onCityLeave?: () => void;
};

function MapPin({ active = false }: { active?: boolean }) {
  const fill = active ? "#d4af37" : "#e11d2a";
  return (
    <div className={`destinations-map-pin${active ? " destinations-map-pin--active" : ""}`}>
      <svg viewBox="0 0 24 32" width="28" height="36" aria-hidden="true">
        <path
          d="M12 .75C5.79.75.75 5.79.75 12 .75 20.4 12 31.25 12 31.25S23.25 20.4 23.25 12C23.25 5.79 18.21.75 12 .75Z"
          fill={fill}
          stroke="#fff"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="4" fill="#fff" />
      </svg>
    </div>
  );
}

function FitAllCities({ cities }: { cities: DestinationCity[] }) {
  const { map, isLoaded } = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded || fitted.current || cities.length === 0) return;
    fitted.current = true;

    const bounds = new MapLibreGL.LngLatBounds();
    cities.forEach((city) => bounds.extend([city.lon, city.lat]));
    map.fitBounds(bounds, { padding: 56, maxZoom: 3, duration: 0 });
  }, [map, isLoaded, cities]);

  return null;
}

export default function DestinationsInteractiveMap({
  cities,
  litId = null,
  onCityEnter,
  onCityLeave,
}: DestinationsInteractiveMapProps) {
  const { t } = useI18n();
  const { theme } = useTheme();

  return (
    <div className="destinations-map-canvas tailwind-root">
      <Map
        center={[20, 24]}
        zoom={1.6}
        minZoom={1}
        maxZoom={12}
        theme={theme === "light" ? "light" : "dark"}
        styles={{ light: MAP_STYLE, dark: MAP_STYLE }}
        className="h-full w-full"
      >
        <FitAllCities cities={cities} />
        {cities.map((city) => {
          const lit = city.id === litId;
          return (
            <MapMarker
              key={city.id}
              longitude={city.lon}
              latitude={city.lat}
              anchor="bottom"
              onClick={() => onCityEnter?.(city.id)}
              onMouseEnter={() => onCityEnter?.(city.id)}
              onMouseLeave={onCityLeave}
            >
              <MarkerContent>
                <MapPin active={lit} />
                {lit ? (
                  <MarkerLabel position="top" className="destinations-marker-label">
                    <strong>{t(`airportTransfer.cities.${city.id}.city`)}</strong>
                    <span>{t(`airportTransfer.cities.${city.id}.country`)}</span>
                  </MarkerLabel>
                ) : null}
              </MarkerContent>
            </MapMarker>
          );
        })}
        <MapControls position="bottom-right" showZoom />
      </Map>
    </div>
  );
}
