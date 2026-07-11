import { lazy, Suspense, useEffect, useState } from "react";
import { MapPin } from "lucide-react";

const LocationMapPopover = lazy(() => import("../../components/LocationMapPopover"));

function pointFromDraft(draft, side) {
  if (!draft) return null;
  if (side === "from") {
    if (!draft.fromLabel) return null;
    if (draft.fromLng == null || draft.fromLat == null) return { label: draft.fromLabel, lng: 28.9784, lat: 41.0082 };
    return { label: draft.fromLabel, lng: draft.fromLng, lat: draft.fromLat };
  }
  if (!draft.toLabel) return null;
  if (draft.toLng == null || draft.toLat == null) return { label: draft.toLabel, lng: 28.9784, lat: 41.0082 };
  return { label: draft.toLabel, lng: draft.toLng, lat: draft.toLat };
}

export default function TransferRouteMap({ mapContext, transferDrafts, onConfirm, onClose }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!mapContext) return;
    const draft = transferDrafts[mapContext.transferId];
    const point = pointFromDraft(draft, mapContext.field);
    setQuery(point?.label ?? "");
  }, [mapContext, transferDrafts]);

  if (!mapContext) {
    return (
      <div className="transfer-route-map transfer-route-map--empty">
        <MapPin size={28} />
        <p>Nereden veya Nereye alanına tıklayın</p>
        <span>Haritadan konum seçebilir veya arama yapabilirsiniz</span>
      </div>
    );
  }

  const draft = transferDrafts[mapContext.transferId];
  const activePoint = pointFromDraft(draft, mapContext.field);
  const otherPoint = pointFromDraft(draft, mapContext.field === "from" ? "to" : "from");

  return (
    <div className="transfer-route-map">
      <Suspense fallback={<div className="transfer-route-map-loading">Harita yükleniyor…</div>}>
        <LocationMapPopover
          key={`${mapContext.transferId}-${mapContext.field}`}
          variant={mapContext.field}
          value={activePoint}
          other={otherPoint}
          query={query}
          onQueryChange={setQuery}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      </Suspense>
    </div>
  );
}
