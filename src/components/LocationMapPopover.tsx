import type { MapMouseEvent } from "maplibre-gl";
import { Plane, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  useMap,
} from "@/components/ui/mapcn-map-arc";
import { useI18n } from "@/i18n/I18nContext";
import { loadAirportGeoJSON, reverseGeocode, searchPlaces } from "@/utils/geocode";

const ISTANBUL = { lng: 28.9784, lat: 41.0082, zoom: 11 };

// Cleaner, more modern basemap than the flat dark tiles.
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

function MapPin({ tone = "red" }: { tone?: "red" | "gold" }) {
  const fill = tone === "gold" ? "#d4af37" : "#e11d2a";
  return (
    <div className="map-pin">
      <svg viewBox="0 0 24 32" width="30" height="40" aria-hidden="true">
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

export type LocationPoint = {
  label: string;
  lng: number;
  lat: number;
};

type MapClickPickerProps = {
  draft: LocationPoint | null;
  onPick: (point: LocationPoint) => void;
  other: LocationPoint | null;
};

function MapFlyTo({ point }: { point: LocationPoint | null }) {
  const { map, isLoaded } = useMap();
  const lastKey = useRef("");

  useEffect(() => {
    if (!map || !isLoaded || !point) return;
    const key = `${point.lng},${point.lat}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    map.flyTo({ center: [point.lng, point.lat], zoom: 14, duration: 900 });
  }, [map, isLoaded, point]);

  return null;
}

const AIRPORT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="12" fill="#e11d2a" stroke="#ffffff" stroke-width="2.5"/><g transform="translate(7 7) scale(0.66)" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 4.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></g></svg>`;

// Highlights every airport worldwide as a single MapLibre symbol layer.
// Collision handling thins them out when zoomed out and reveals more on zoom-in.
function AirportLayer() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return undefined;

    let cancelled = false;
    const sourceId = "vt-airports";
    const layerId = "vt-airports-symbol";
    const iconId = "vt-airport-icon";

    // Reuse a font the current style already loads, so labels never 404.
    const styleFont = (() => {
      const layers = (map.getStyle()?.layers ?? []) as Array<{
        type?: string;
        layout?: Record<string, unknown>;
      }>;
      for (const layer of layers) {
        const font = layer.layout?.["text-font"];
        if (layer.type === "symbol" && Array.isArray(font) && font.length) {
          return font as string[];
        }
      }
      return ["Open Sans Regular"];
    })();

    const addLayers = (data: GeoJSON.FeatureCollection) => {
      if (cancelled || !map.getStyle()) return;
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: "geojson", data });
      }
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "icon-image": iconId,
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              2, 0.4,
              6, 0.62,
              12, 0.85,
            ],
            "icon-allow-overlap": false,
            "text-field": ["get", "iata"],
            "text-font": styleFont,
            "text-size": 11,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-optional": true,
          },
          paint: {
            "text-color": "#b3121f",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.4,
          },
        });
      }
    };

    loadAirportGeoJSON().then((data) => {
      if (cancelled) return;
      if (map.hasImage(iconId)) {
        addLayers(data);
        return;
      }
      const img = new Image(30, 30);
      img.onload = () => {
        if (cancelled) return;
        if (!map.hasImage(iconId)) {
          try {
            map.addImage(iconId, img, { pixelRatio: 2 });
          } catch {
            /* image may have been added concurrently */
          }
        }
        addLayers(data);
      };
      img.src =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(AIRPORT_ICON_SVG);
    });

    return () => {
      cancelled = true;
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        /* style may already be torn down */
      }
    };
  }, [map, isLoaded]);

  return null;
}

function MapClickPicker({ draft, onPick, other }: MapClickPickerProps) {
  const { map, isLoaded } = useMap();
  const { lang } = useI18n();

  useEffect(() => {
    if (!map || !isLoaded) return undefined;

    const handleClick = async (event: MapMouseEvent) => {
      const { lng, lat } = event.lngLat;
      const label = await reverseGeocode(lng, lat, lang);
      onPick({ lng, lat, label });
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, isLoaded, onPick, lang]);

  const marker = draft ?? other;

  return (
    <>
      <MapFlyTo point={draft} />
      {other && draft && (
        <MapRoute
          coordinates={[
            [other.lng, other.lat],
            [draft.lng, draft.lat],
          ]}
          color="#e11d2a"
          width={4}
          opacity={0.9}
          interactive={false}
        />
      )}
      {other && (
        <MapMarker longitude={other.lng} latitude={other.lat} anchor="bottom">
          <MarkerContent>
            <MapPin tone="red" />
            <MarkerLabel position="top" className="rounded bg-background/90 px-1.5 py-0.5 text-[10px] backdrop-blur">
              {other.label}
            </MarkerLabel>
          </MarkerContent>
        </MapMarker>
      )}
      {marker && (
        <MapMarker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
          <MarkerContent>
            <MapPin tone="red" />
          </MarkerContent>
        </MapMarker>
      )}
    </>
  );
}

type LocationSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (point: LocationPoint) => void;
  autoFocus?: boolean;
};

function LocationSearch({ query, onQueryChange: setQuery, onSelect, autoFocus }: LocationSearchProps) {
  const { t, lang } = useI18n();
  const [results, setResults] = useState<(LocationPoint & { kind?: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    setOpen(true);
    const timer = window.setTimeout(async () => {
      const id = ++requestId.current;
      try {
        const places = await searchPlaces(trimmed, lang);
        if (id !== requestId.current) return;
        setResults(places);
      } catch {
        if (id !== requestId.current) return;
        setResults([]);
      } finally {
        if (id === requestId.current) setIsSearching(false);
      }
    }, 320);

    return () => window.clearTimeout(timer);
  }, [query, lang]);

  const handleSelect = useCallback(
    (point: LocationPoint) => {
      setQuery(point.label);
      setOpen(false);
      setResults([]);
      onSelect(point);
    },
    [onSelect],
  );

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div className="location-map-search">
      <div className="location-map-search-inner">
        <Search className="location-map-search-icon" size={16} aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="location-map-search-input"
          value={query}
          placeholder={t("map.searchPlaceholder")}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
      </div>
      {showDropdown && (
        <div className="location-map-results" role="listbox">
          {isSearching && results.length === 0 ? (
            <div className="location-map-result-empty">{t("map.searching")}</div>
          ) : null}
          {!isSearching && results.length === 0 ? (
            <div className="location-map-result-empty">{t("map.noResults")}</div>
          ) : null}
          {results.map((item) => (
            <button
              key={`${item.lng}-${item.lat}-${item.label}`}
              type="button"
              className={`location-map-result-item${item.kind === "airport" ? " location-map-result-item--airport" : ""}`}
              role="option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(item)}
            >
              {item.kind === "airport" ? (
                <Plane className="location-map-result-airport-icon" size={14} aria-hidden />
              ) : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type LocationMapPopoverProps = {
  variant: "from" | "to";
  value: LocationPoint | null;
  other: LocationPoint | null;
  query: string;
  onQueryChange: (query: string) => void;
  onConfirm: (point: LocationPoint) => void;
  onClose: () => void;
  className?: string;
};

export default function LocationMapPopover({
  variant,
  value,
  other,
  query,
  onQueryChange,
  onConfirm,
  onClose,
  className = "",
}: LocationMapPopoverProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<LocationPoint | null>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const center = useMemo(() => {
    if (draft) return [draft.lng, draft.lat] as [number, number];
    if (other) return [other.lng, other.lat] as [number, number];
    return [ISTANBUL.lng, ISTANBUL.lat] as [number, number];
  }, [draft, other]);

  const handleConfirm = useCallback(() => {
    if (draft) onConfirm(draft);
    onClose();
  }, [draft, onConfirm, onClose]);

  return (
    <div className={`location-map-popover tailwind-root ${className}`.trim()}>
      <div className="location-map-popover-header">
        <strong>{variant === "from" ? t("booking.fromLabel") : t("booking.toLabel")}</strong>
        <button type="button" className="location-map-close" onClick={onClose} aria-label={t("map.close")}>
          ×
        </button>
      </div>
      <LocationSearch query={query} onQueryChange={onQueryChange} onSelect={setDraft} autoFocus />
      <p className="location-map-hint">{t("map.clickHint")}</p>
      <div className="location-map-canvas">
        <Map
          center={center}
          zoom={ISTANBUL.zoom}
          styles={{ light: MAP_STYLE, dark: MAP_STYLE }}
          className="h-full w-full"
        >
          <AirportLayer />
          <MapClickPicker draft={draft} onPick={setDraft} other={other} />
          <MapControls position="bottom-right" showZoom showLocate />
        </Map>
      </div>
      <div className="location-map-footer">
        <span className="location-map-selection">{draft?.label ?? t("map.noSelection")}</span>
        <button type="button" className="location-map-confirm" onClick={handleConfirm} disabled={!draft}>
          {t("map.confirm")}
        </button>
      </div>
    </div>
  );
}
