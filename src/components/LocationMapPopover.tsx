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
import { reverseGeocode, searchPlaces } from "@/utils/geocode";

const ISTANBUL = { lng: 28.9784, lat: 41.0082, zoom: 11 };

export type LocationPoint = {
  label: string;
  lng: number;
  lat: number;
};

type MapClickPickerProps = {
  draft: LocationPoint | null;
  onPick: (point: LocationPoint) => void;
  other: LocationPoint | null;
  variant: "from" | "to";
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

function MapClickPicker({ draft, onPick, other, variant }: MapClickPickerProps) {
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
          color={variant === "from" ? "#d4af37" : "#f7f5f0"}
          width={3}
          opacity={0.85}
          interactive={false}
        />
      )}
      {other && (
        <MapMarker longitude={other.lng} latitude={other.lat}>
          <MarkerContent>
            <div className="size-3 rounded-full border-2 border-white bg-emerald-500 shadow-md" />
            <MarkerLabel position="top" className="rounded bg-background/90 px-1.5 py-0.5 text-[10px] backdrop-blur">
              {other.label}
            </MarkerLabel>
          </MarkerContent>
        </MapMarker>
      )}
      {marker && (
        <MapMarker longitude={marker.lng} latitude={marker.lat}>
          <MarkerContent>
            <div
              className={`size-3.5 rounded-full border-2 border-white shadow-md ${
                variant === "from" ? "bg-[#d4af37]" : "bg-neutral-900"
              }`}
            />
          </MarkerContent>
        </MapMarker>
      )}
    </>
  );
}

type LocationSearchProps = {
  value: LocationPoint | null;
  onSelect: (point: LocationPoint) => void;
};

function LocationSearch({ value, onSelect }: LocationSearchProps) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<(LocationPoint & { kind?: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

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
  onConfirm: (point: LocationPoint) => void;
  onClose: () => void;
};

export default function LocationMapPopover({
  variant,
  value,
  other,
  onConfirm,
  onClose,
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
    <div className="location-map-popover tailwind-root">
      <div className="location-map-popover-header">
        <strong>{variant === "from" ? t("booking.fromLabel") : t("booking.toLabel")}</strong>
        <button type="button" className="location-map-close" onClick={onClose} aria-label={t("map.close")}>
          ×
        </button>
      </div>
      <LocationSearch value={draft} onSelect={setDraft} />
      <p className="location-map-hint">{t("map.clickHint")}</p>
      <div className="location-map-canvas">
        <Map center={center} zoom={ISTANBUL.zoom} theme="dark" className="h-full w-full">
          <MapClickPicker draft={draft} onPick={setDraft} other={other} variant={variant} />
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
