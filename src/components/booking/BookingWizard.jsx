import { useCallback, useReducer, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { submitBooking } from "../../api/booking";
import { formatPickupDisplay } from "../../utils/datetime";
import BookingConfirmModal from "../BookingConfirmModal";
import StepBreadcrumb from "./StepBreadcrumb";
import TripDetails from "./TripDetails";
import ServiceSelection from "./ServiceSelection";
import PickupInfo from "./PickupInfo";
import Checkout from "./Checkout";
import StickyBottomBar from "./StickyBottomBar";

const initialState = {
  step: 2,
  tripData: null,
  stops: [],
  passengers: 1,
  luggage: 1,
  childSeat: 0,
  selectedVehicle: null,
  contact: {
    firstName: "",
    lastName: "",
    email: "",
    phoneCode: "+90",
    phone: "",
    whatsappDifferent: false,
    whatsappCode: "+90",
    whatsappNumber: "",
  },
  flightNumber: "",
  meetAndGreetSelected: false,
  meetAndGreetName: "",
  returnTransfer: false,
  notes: "",
  termsAccepted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT": return { ...initialState, tripData: action.payload, step: 2 };
    case "SET_STEP": return { ...state, step: action.payload };
    case "SET_TRIP": return { ...state, tripData: { ...state.tripData, ...action.payload } };
    case "SET_VEHICLE": return { ...state, selectedVehicle: action.payload };
    case "SET_PASSENGERS": return { ...state, passengers: action.payload };
    case "SET_LUGGAGE": return { ...state, luggage: action.payload };
    case "SET_CHILD_SEAT": return { ...state, childSeat: action.payload };
    case "SET_CONTACT": return { ...state, contact: action.payload };
    case "SET_FLIGHT": return { ...state, flightNumber: action.payload };
    case "SET_MEET_GREET_SELECTED": return {
      ...state,
      meetAndGreetSelected: action.payload,
      meetAndGreetName: action.payload ? state.meetAndGreetName : "",
    };
    case "SET_MEET_GREET": return { ...state, meetAndGreetName: action.payload };
    case "SET_RETURN": return { ...state, returnTransfer: action.payload };
    case "SET_NOTES": return { ...state, notes: action.payload };
    case "SET_STOPS": return { ...state, stops: action.payload };
    case "SET_TERMS": return { ...state, termsAccepted: action.payload };
    default: return state;
  }
}

export default function BookingWizard({ bookingData, onBack }) {
  const { t, lang } = useI18n();
  const hasTrip = Boolean(
    bookingData?.from && (bookingData?.type === "hourly" ? true : bookingData?.to),
  );
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    tripData: bookingData || { type: "transfer" },
    step: hasTrip ? 2 : 1,
    selectedVehicle: bookingData?.vehicle || null,
    // Carry passenger/luggage counts through from the home form so the user
    // does not have to re-enter them (previously they were reset to 1/1 here).
    passengers: Math.max(1, Number(bookingData?.passengers) || initialState.passengers),
    luggage: Math.max(0, Number(bookingData?.luggage) || initialState.luggage),
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const { step, selectedVehicle, contact } = state;

  const vehicleName = selectedVehicle
    ? (t(`fleet.items.${selectedVehicle}.name`) !== `fleet.items.${selectedVehicle}.name` ? t(`fleet.items.${selectedVehicle}.name`) : selectedVehicle)
    : "";

  const goTo = useCallback((s) => {
    dispatch({ type: "SET_STEP", payload: s });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleContinue = () => {
    setMessage("");
    if (step === 2) {
      if (!selectedVehicle) {
        setMessage(t("booking.details.vehicleValidation"));
        setStatus("error");
        return;
      }
      goTo(3);
    } else if (step === 3) {
      if (!contact.firstName.trim() || !contact.email.trim() || !contact.phone.trim()) {
        setMessage(t("booking.details.contactValidation"));
        setStatus("error");
        return;
      }
      // Email must contain '@' and a domain with a dot.
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(contact.email.trim())) {
        setMessage(t("booking.details.emailValidation"));
        setStatus("error");
        return;
      }
      // Phone must be exactly 10 digits (national number, country code is
      // stored separately as `phoneCode`).
      if (contact.phone.replace(/\D+/g, "").length !== 10) {
        setMessage(t("booking.details.phoneLengthValidation"));
        setStatus("error");
        return;
      }
      if (
        contact.whatsappDifferent
        && contact.whatsappNumber.replace(/\D+/g, "").length !== 10
      ) {
        setMessage(t("booking.details.phoneLengthValidation"));
        setStatus("error");
        return;
      }
      setStatus("idle");
      goTo(4);
    }
  };

  const handleSubmit = async () => {
    setMessage("");
    if (!state.termsAccepted) {
      setStatus("error");
      setMessage(t("wizard.termsRequired"));
      return;
    }

    setStatus("loading");
    try {
      // Only send the WhatsApp number when the guest has explicitly opted in
      // to a different one; otherwise the primary phone is used for WhatsApp
      // by default and we skip the extra field.
      const whatsappNumber = state.contact.whatsappDifferent
        && state.contact.whatsappNumber.trim()
        ? `${state.contact.whatsappCode}${state.contact.whatsappNumber.trim()}`
        : undefined;

      const result = await submitBooking({
        ...state.tripData,
        firstName: state.contact.firstName.trim(),
        lastName: state.contact.lastName.trim(),
        email: state.contact.email.trim(),
        phone: `${state.contact.phoneCode}${state.contact.phone.trim()}`,
        whatsappNumber,
        passengers: state.passengers,
        luggage: state.luggage,
        childSeat: state.childSeat,
        vehicle: state.selectedVehicle,
        notes: state.notes.trim(),
        flightNumber: state.flightNumber.trim() || undefined,
        meetAndGreetRequested: state.meetAndGreetSelected,
        meetAndGreetName: state.meetAndGreetSelected ? state.meetAndGreetName.trim() || undefined : undefined,
        returnTransfer: state.returnTransfer,
        stops: state.stops.length > 0 ? state.stops : undefined,
      });

      setStatus("success");
      const route = state.tripData.type === "hourly"
        ? `${state.tripData.from} (${state.tripData.durationHours}h)`
        : `${state.tripData.from} → ${state.tripData.to}`;
      setConfirmed({
        reference: result.reference,
        customerName: `${state.contact.firstName.trim()} ${state.contact.lastName.trim()}`.trim(),
        dateText: formatPickupDisplay(new Date(state.tripData.pickupAt), lang),
        pickupAt: state.tripData.pickupAt,
        durationHours: state.tripData.type === "hourly" ? state.tripData.durationHours : 2,
        route,
        vehicleName,
        passengers: state.passengers,
        phone: `${state.contact.phoneCode}${state.contact.phone.trim()}`,
      });
    } catch (error) {
      setStatus("error");
      const unavailable = error.code === "API_UNAVAILABLE"
        || error.code === "NOT_FOUND"
        || error.status === 404;
      setMessage(unavailable
        ? t("booking.details.serverUnavailable")
        : t("booking.details.error"));
    }
  };

  const handleEdit = (targetStep) => goTo(targetStep);

  return (
    <div className="bw-page">
      <div className="bw-container">
        <StepBreadcrumb current={step} onGoTo={goTo} />

        {step === 1 && (
          <TripDetails state={state} dispatch={dispatch} onContinue={() => goTo(2)} />
        )}
        {step === 2 && (
          <ServiceSelection state={state} dispatch={dispatch} onContinue={handleContinue} onEdit={handleEdit} />
        )}
        {step === 3 && (
          <PickupInfo state={state} dispatch={dispatch} />
        )}
        {step === 4 && (
          <Checkout
            state={state}
            dispatch={dispatch}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            status={status}
            message={message}
          />
        )}

        {message && step !== 4 && (
          <div className={`bw-feedback bw-feedback--${status}`} role="status">
            <p>{message}</p>
          </div>
        )}
      </div>

      {step > 1 && step < 4 && (
        <StickyBottomBar
          vehicleName={vehicleName}
          onContinue={handleContinue}
          disabled={step === 2 && !selectedVehicle}
          isLastStep={false}
        />
      )}

      {confirmed && (
        <BookingConfirmModal booking={confirmed} onClose={() => { setConfirmed(null); onBack(); }} />
      )}
    </div>
  );
}
