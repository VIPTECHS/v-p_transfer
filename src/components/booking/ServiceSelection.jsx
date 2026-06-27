import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { fleetItems } from "../../data/content";
import TripSidebar from "./TripSidebar";
import AddStopsModal from "./AddStopsModal";

export default function ServiceSelection({
  state,
  dispatch,
  onContinue,
  onEdit,
}) {
  const { t } = useI18n();
  const [showStopsModal, setShowStopsModal] = useState(false);

  const { tripData, selectedVehicle, passengers, luggage, childSeat, pets, stops } = state;

  return (
    <div className="bw-layout">
      <TripSidebar
        tripData={tripData}
        stops={stops}
        passengers={passengers}
        luggage={luggage}
        childSeat={childSeat}
        pets={pets}
        onPassengersChange={(v) => dispatch({ type: "SET_PASSENGERS", payload: v })}
        onLuggageChange={(v) => dispatch({ type: "SET_LUGGAGE", payload: v })}
        onChildSeatChange={(v) => dispatch({ type: "SET_CHILD_SEAT", payload: v })}
        onPetsChange={(v) => dispatch({ type: "SET_PETS", payload: v })}
        onAddStops={() => setShowStopsModal(true)}
        onEdit={onEdit}
        editable
        showCounters
      />

      <div className="bw-main">
        <h2 className="bw-page-title">{t("wizard.selectService")}</h2>

        <div className="bw-vehicle-list">
          {fleetItems.map((item) => {
            const info = t(`fleet.items.${item.key}.name`) !== `fleet.items.${item.key}.name`
              ? {
                  name: t(`fleet.items.${item.key}.name`),
                  passengers: t(`fleet.items.${item.key}.passengers`),
                  bags: t(`fleet.items.${item.key}.bags`),
                }
              : { name: item.key, passengers: "", bags: "" };

            const active = selectedVehicle === item.key;
            const pCount = parseInt(info.passengers) || 0;
            const bCount = parseInt(info.bags) || 0;

            return (
              <button
                key={item.key}
                type="button"
                className={`bw-vehicle-row ${active ? "bw-vehicle-row--active" : ""}`}
                onClick={() => dispatch({ type: "SET_VEHICLE", payload: item.key })}
              >
                <img src={item.image} alt={info.name} loading="lazy" className="bw-vehicle-row-img" />
                <div className="bw-vehicle-row-info">
                  <strong>{info.name}</strong>
                  <span className="bw-vehicle-row-caps">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {pCount}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    {bCount}
                  </span>
                  {item.popular && <span className="bw-vehicle-row-badge">{t("booking.mostPopular")}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showStopsModal && (
        <AddStopsModal
          stops={stops}
          onSave={(s) => dispatch({ type: "SET_STOPS", payload: s })}
          onClose={() => setShowStopsModal(false)}
        />
      )}
    </div>
  );
}
