import { useMemo } from "react";
import {
  Map,
  MapMarker,
  MapRoute,
  MarkerContent,
} from "@/components/ui/mapcn-map-arc";

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
      <Map center={center} zoom={hasRoute ? 10 : 13} theme="dark" className="h-full w-full">
        <MapMarker longitude={booking.fromLng} latitude={booking.fromLat}>
          <MarkerContent>
            <div className="size-3.5 rounded-full border-2 border-white bg-[#d4af37] shadow-md" />
          </MarkerContent>
        </MapMarker>
        {hasRoute && (
          <>
            <MapMarker longitude={booking.toLng} latitude={booking.toLat}>
              <MarkerContent>
                <div className="size-3 rounded-full border-2 border-white bg-emerald-500 shadow-md" />
              </MarkerContent>
            </MapMarker>
            <MapRoute
              coordinates={[
                [booking.fromLng, booking.fromLat],
                [booking.toLng, booking.toLat],
              ]}
              color="#d4af37"
              width={3}
              interactive={false}
            />
          </>
        )}
      </Map>
    </div>
  );
}
