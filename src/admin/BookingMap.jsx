import { useMemo } from "react";
import {
  Map,
  MapMarker,
  MapRoute,
  MarkerContent,
} from "@/components/ui/mapcn-map-arc";

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

function MapPin() {
  return (
    <div className="map-pin">
      <svg viewBox="0 0 24 32" width="28" height="37" aria-hidden="true">
        <path
          d="M12 .75C5.79.75.75 5.79.75 12 .75 20.4 12 31.25 12 31.25S23.25 20.4 23.25 12C23.25 5.79 18.21.75 12 .75Z"
          fill="#e11d2a"
          stroke="#fff"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="4" fill="#fff" />
      </svg>
    </div>
  );
}

export default function BookingMap({ booking }) {
  const center = useMemo(() => {
    if (booking.fromLng != null && booking.fromLat != null) {
      return [booking.fromLng, booking.fromLat];
    }
    return [28.9784, 41.0082];
  }, [booking]);

  const hasRoute = booking.toLng != null && booking.toLat != null;

  return (
    <div className="admin-detail-map tailwind-root">
      <Map
        center={center}
        zoom={hasRoute ? 10 : 13}
        styles={{ light: MAP_STYLE, dark: MAP_STYLE }}
        className="h-full w-full"
      >
        <MapMarker longitude={booking.fromLng} latitude={booking.fromLat} anchor="bottom">
          <MarkerContent>
            <MapPin />
          </MarkerContent>
        </MapMarker>
        {hasRoute && (
          <>
            <MapMarker longitude={booking.toLng} latitude={booking.toLat} anchor="bottom">
              <MarkerContent>
                <MapPin />
              </MarkerContent>
            </MapMarker>
            <MapRoute
              coordinates={[
                [booking.fromLng, booking.fromLat],
                [booking.toLng, booking.toLat],
              ]}
              color="#e11d2a"
              width={4}
              interactive={false}
            />
          </>
        )}
      </Map>
    </div>
  );
}
